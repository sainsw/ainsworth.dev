import { expect, type Page, test } from '@playwright/test';
import { PAGE_ROUTES, POSTS, prepareContext } from './helpers';

// The site has no theme toggle: app/tw.css wires Tailwind's `dark` variant
// straight to `@media (prefers-color-scheme: dark)`, and app/global.css swaps
// the token block under the same query. So the system preference is the whole
// theming mechanism, and both branches need exercising.

const SCHEMES = ['light', 'dark'] as const;
type Scheme = (typeof SCHEMES)[number];

/**
 * Resolves a computed colour to RGB by painting it, then reports WCAG relative
 * luminance and the contrast ratio against the nearest opaque ancestor
 * background. Painting sidesteps the fact that engines serialise `oklch()`
 * tokens inconsistently — the canvas always hands back sRGB.
 */
async function probeColours(page: Page, selector: string) {
  return page.evaluate((sel) => {
    const toRgb = (css: string): [number, number, number] => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('no 2d context');
      ctx.fillStyle = '#000';
      ctx.fillStyle = css; // an unparseable value leaves the previous one
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
      return [r, g, b];
    };

    const luminance = ([r, g, b]: [number, number, number]) => {
      const channel = (v: number) => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
    };

    const el = document.querySelector(sel);
    if (!el) throw new Error(`no element matching ${sel}`);

    let ancestor: Element | null = el;
    let background = 'rgb(255, 255, 255)';
    while (ancestor) {
      const value = getComputedStyle(ancestor).backgroundColor;
      if (value && !/rgba\(0, 0, 0, 0\)|transparent/.test(value)) {
        background = value;
        break;
      }
      ancestor = ancestor.parentElement;
    }

    const fg = luminance(toRgb(getComputedStyle(el).color));
    const bg = luminance(toRgb(background));
    const contrast = (Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05);

    return { fg, bg, contrast };
  }, selector);
}

const pageBackground = (page: Page) =>
  probeColours(page, 'body').then((c) => c.bg);

for (const scheme of SCHEMES) {
  test.describe(`${scheme} mode`, () => {
    test.use({ colorScheme: scheme });

    test.beforeEach(async ({ context, baseURL }) => {
      await prepareContext(context, baseURL);
    });

    test('html declares the matching color-scheme', async ({ page }) => {
      await page.goto('/');
      const declared = await page.evaluate(
        () => getComputedStyle(document.documentElement).colorScheme,
      );

      // global.css only sets `color-scheme: dark` inside the dark query, so
      // light mode correctly falls through to the initial `normal`.
      if (scheme === 'dark') {
        expect(declared).toBe('dark');
      } else {
        expect(declared).not.toBe('dark');
      }
    });

    test('every page paints the right end of the palette', async ({ page }) => {
      for (const route of [...PAGE_ROUTES, `/blog/${POSTS[0].slug}`]) {
        await page.goto(route);
        const { fg, bg } = await probeColours(page, 'body');

        if (scheme === 'dark') {
          expect(bg, `${route} background`).toBeLessThan(0.1);
          expect(fg, `${route} text`).toBeGreaterThan(0.5);
        } else {
          expect(bg, `${route} background`).toBeGreaterThan(0.5);
          expect(fg, `${route} text`).toBeLessThan(0.1);
        }
      }
    });

    test('body text clears WCAG AA on every page', async ({ page }) => {
      for (const route of [...PAGE_ROUTES, `/blog/${POSTS[0].slug}`]) {
        await page.goto(route);
        const { contrast } = await probeColours(page, 'body');
        expect(contrast, `${route} body contrast`).toBeGreaterThanOrEqual(4.5);
      }
    });

    test('muted text clears WCAG AA', async ({ page }) => {
      await page.goto('/');
      // Dates, view counts and the cookie copy all use this token, and it is
      // the closest thing on the site to a contrast cliff.
      const { contrast } = await probeColours(page, '.text-muted-foreground');
      expect(contrast).toBeGreaterThanOrEqual(4.5);
    });

    test('card surfaces stay distinct from the page background', async ({
      page,
    }) => {
      await page.goto('/work');

      const { bg: cardBg, contrast } = await probeColours(page, '.bg-card p');
      const bodyBg = await pageBackground(page);

      // A card that resolves to the page background loses all definition.
      expect(Math.abs(cardBg - bodyBg)).toBeGreaterThan(0);
      expect(contrast).toBeGreaterThanOrEqual(4.5);
    });

    test('article prose inverts and stays readable', async ({ page }) => {
      await page.goto(`/blog/${POSTS[0].slug}`);

      const { fg, contrast } = await probeColours(page, 'article p');
      expect(contrast).toBeGreaterThanOrEqual(4.5);

      if (scheme === 'dark') {
        expect(fg).toBeGreaterThan(0.5);
      } else {
        expect(fg).toBeLessThan(0.2);
      }
    });

    test('syntax highlighting uses the matching palette', async ({ page }) => {
      await page.goto('/blog/api-design');
      await expect(page.locator('.sh__line').first()).toBeVisible();

      for (const token of [
        'keyword',
        'string',
        'comment',
        'property',
        'class',
      ]) {
        const selector = `.sh__token--${token}`;
        if ((await page.locator(selector).count()) === 0) continue;

        const { contrast } = await probeColours(page, selector);
        // Code is body-sized text, so the full AA bar applies. The tightest of
        // these is the comment token at ~4.9:1 in both schemes.
        expect(contrast, `${scheme} ${token} contrast`).toBeGreaterThanOrEqual(
          4.5,
        );
      }
    });

    test('the theme-aware university logo picks the right file', async ({
      page,
    }) => {
      await page.goto('/work');

      // components/icon.tsx serves this one through <picture> with a
      // prefers-color-scheme media source rather than the sprite.
      const logo = page.locator('img[src*="uol"]').first();
      await expect(logo).toBeVisible();
      await expect
        .poll(() =>
          logo.evaluate((img: HTMLImageElement) =>
            img.complete ? img.currentSrc : '',
          ),
        )
        .toContain(`uol_${scheme}_mode.svg`);
    });

    test('mermaid diagrams follow the system theme', async ({ page }) => {
      await page.goto('/blog/github-image-sync');

      const svg = page.locator('svg[id^="mermaid"]');
      await expect(svg.first()).toBeVisible({ timeout: 30000 });
      await expect
        .poll(
          () =>
            svg.first().evaluate((el) => el.querySelectorAll('g, path').length),
          { timeout: 30000 },
        )
        .toBeGreaterThan(0);

      // Both themes are baked into the committed SVG — mermaid's light
      // stylesheet plus its dark one under a prefers-color-scheme media query —
      // and global.css then overrides the node fill for each scheme.
      const fill = await page.evaluate(() => {
        const rect = document.querySelector('.mermaid-diagram .node rect');
        if (!rect) return null;
        const css = getComputedStyle(rect).fill;
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;
        ctx.fillStyle = '#000';
        ctx.fillStyle = css;
        ctx.fillRect(0, 0, 1, 1);
        const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
        return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
      });

      if (fill !== null) {
        if (scheme === 'dark') {
          expect(fill, 'mermaid node fill').toBeLessThan(0.5);
        } else {
          expect(fill, 'mermaid node fill').toBeGreaterThan(0.5);
        }
      }
    });
  });

  test.describe(`${scheme} mode chrome`, () => {
    test.use({ colorScheme: scheme });

    test('the cookie banner is readable', async ({ page }) => {
      // Deliberately not suppressed — this asserts the banner itself.
      await page.goto('/');
      await expect(
        page.getByText(/I use cookies to analyse traffic/i),
      ).toBeVisible({ timeout: 15000 });

      const { contrast } = await probeColours(
        page,
        'p.text-xs.text-muted-foreground',
      );
      expect(contrast).toBeGreaterThanOrEqual(4.5);

      await expect(page.getByRole('button', { name: /accept/i })).toBeVisible();
      await expect(
        page.getByRole('button', { name: /decline/i }),
      ).toBeVisible();
    });
  });
}

test('the two schemes actually render differently', async ({
  browser,
  baseURL,
}) => {
  // Guards the whole mechanism: if the media query were dropped or the token
  // block collapsed, every per-scheme test above would still pass on one side.
  const read = async (scheme: Scheme) => {
    // A hand-rolled context does not inherit baseURL from the config.
    const context = await browser.newContext({ colorScheme: scheme, baseURL });
    const page = await context.newPage();
    await page.goto('/');
    const colours = await probeColours(page, 'body');
    await context.close();
    return colours;
  };

  const light = await read('light');
  const dark = await read('dark');

  expect(light.bg).toBeGreaterThan(dark.bg);
  expect(light.fg).toBeLessThan(dark.fg);
  // Not a subtle tint difference — genuinely inverted.
  expect(light.bg - dark.bg).toBeGreaterThan(0.5);
});
