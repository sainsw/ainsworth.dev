import { expect, test } from '@playwright/test';
import {
  PAGE_ROUTES,
  POSTS,
  POSTS_WITH_CODE,
  POSTS_WITH_MERMAID,
  prepareContext,
} from './helpers';

const ROUTES = [...PAGE_ROUTES, `/blog/${POSTS[0].slug}`];

test.beforeEach(async ({ context, baseURL }) => {
  await prepareContext(context, baseURL);
});

test('every page declares British English as its language', async ({
  page,
}) => {
  for (const route of ROUTES) {
    await page.goto(route);
    await expect(page.locator('html'), route).toHaveAttribute('lang', 'en-GB');
  }
});

test('every page has exactly one h1', async ({ page }) => {
  for (const route of ROUTES) {
    await page.goto(route);

    const headings = page.locator('h1');
    await expect(headings, `${route} h1 count`).toHaveCount(1);
    // An empty h1 is as useless to a screen reader as a missing one.
    expect(
      (await headings.first().innerText()).trim().length,
      `${route} h1 text`,
    ).toBeGreaterThan(0);
  }
});

test('heading levels never skip a rank', async ({ page }) => {
  for (const route of ROUTES) {
    await page.goto(route);

    const levels = await page
      .locator('main :is(h1, h2, h3, h4, h5, h6)')
      .evaluateAll((els) => els.map((el) => Number(el.tagName[1])));

    let previous = levels[0] ?? 1;
    for (const level of levels) {
      // Going deeper by more than one rank at a time breaks screen-reader
      // outlines; coming back up any distance is fine.
      expect(level - previous, `${route} heading jump`).toBeLessThanOrEqual(1);
      previous = level;
    }
  }
});

test('every image carries an alt attribute', async ({ page }) => {
  for (const route of ROUTES) {
    await page.goto(route);

    const missing = await page
      .locator('img')
      .evaluateAll((els) =>
        els
          .filter((el) => !el.hasAttribute('alt'))
          .map((el) => el.getAttribute('src') ?? '(no src)'),
      );

    // Decorative images are allowed alt="" but must still declare it.
    expect(missing, `${route} images without alt`).toEqual([]);
  }
});

test('every link has an accessible name', async ({ page }) => {
  for (const route of ROUTES) {
    await page.goto(route);

    const unnamed = await page.locator('a').evaluateAll((els) =>
      els
        .filter((el) => {
          const hasText = (el.textContent ?? '').trim().length > 0;
          const hasLabel = !!el.getAttribute('aria-label')?.trim();
          const hasTitle = !!el.getAttribute('title')?.trim();
          const hasLabelledBy = !!el.getAttribute('aria-labelledby');
          const hasImageAlt = Array.from(el.querySelectorAll('img')).some(
            (img) => !!img.getAttribute('alt')?.trim(),
          );
          // Heading anchor links render as a "#" from CSS and are
          // visibility:hidden until their heading is hovered, which keeps them
          // out of the a11y tree and out of the heading's own name.
          const isHeadingAnchor = el.classList.contains('anchor');
          return (
            !isHeadingAnchor &&
            !hasText &&
            !hasLabel &&
            !hasTitle &&
            !hasLabelledBy &&
            !hasImageAlt
          );
        })
        .map((el) => el.getAttribute('href') ?? '(no href)'),
    );

    expect(unnamed, `${route} links without a name`).toEqual([]);
  }
});

test('every form control on the contact page is labelled', async ({ page }) => {
  await page.goto('/contact');

  // Hidden inputs are exempt — they are never presented to the user. The real
  // Turnstile widget injects one (cf-turnstile-response) whenever it loads,
  // which is why this only shows up against a deployment.
  const unlabelled = await page
    .locator('input:not([type="hidden"]), textarea, select')
    .evaluateAll((els) =>
      els
        .filter((el) => {
          const id = el.getAttribute('id');
          const hasLabel = id
            ? !!document.querySelector(`label[for="${id}"]`)
            : false;
          return (
            !hasLabel &&
            !el.getAttribute('aria-label') &&
            !el.getAttribute('aria-labelledby')
          );
        })
        .map((el) => el.getAttribute('name') ?? el.tagName),
    );

  expect(unlabelled).toEqual([]);
});

test('navbar links take focus and activate from the keyboard', async ({
  page,
}) => {
  await page.goto('/');

  // Real anchors, not div-with-onclick: focusable and activated by Enter.
  const workLink = page.locator('#nav a[href="/work"]');
  await workLink.focus();

  expect(
    await page.evaluate(
      () => document.activeElement?.getAttribute('href') ?? null,
    ),
  ).toBe('/work');

  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/work$/);
  await expect(
    page.getByRole('heading', { name: /skills & technologies/i }),
  ).toBeVisible();
});

test('tab order reaches the navbar before the page content', async ({
  page,
  browserName,
}) => {
  // WebKit follows the macOS "Tab highlights each item" preference, which is
  // off by default, so Tab does not move focus to links there at all.
  test.skip(
    browserName === 'webkit',
    'WebKit does not tab to links by default',
  );

  await page.goto('/');

  let landed = false;
  for (let i = 0; i < 10 && !landed; i++) {
    await page.keyboard.press('Tab');
    landed = await page.evaluate(
      () => document.activeElement?.closest('#nav') !== null,
    );
  }
  expect(landed, 'a nav link takes focus within 10 tabs').toBe(true);
});

test('the keyboard-focused element is visibly distinguishable', async ({
  page,
  browserName,
}) => {
  test.skip(
    browserName === 'webkit',
    'WebKit does not tab to links by default',
  );

  await page.goto('/');
  await page.keyboard.press('Tab');

  // Focus must not be signalled by colour alone with the outline removed.
  const styles = await page.evaluate(() => {
    const el = document.activeElement as HTMLElement;
    const s = getComputedStyle(el);
    return {
      outline: s.outlineStyle,
      width: s.outlineWidth,
      shadow: s.boxShadow,
    };
  });

  const hasOutline = styles.outline !== 'none' && styles.width !== '0px';
  const hasShadow = styles.shadow !== 'none';
  expect(hasOutline || hasShadow).toBe(true);
});

test('the current page is marked in the navigation', async ({ page }) => {
  for (const { path } of [
    { path: '/' },
    { path: '/work' },
    { path: '/blog' },
    { path: '/contact' },
  ]) {
    await page.goto(path);

    // Without aria-current the four nav links are announced identically and a
    // screen reader user is never told which one they are on.
    const current = page.locator('#nav a[aria-current="page"]');
    await expect(current, `${path} marks one link current`).toHaveCount(1);
    await expect(current).toHaveAttribute('href', path);
  }

  // A post counts as being under /blog.
  await page.goto(`/blog/${POSTS[0].slug}`);
  await expect(page.locator('#nav a[aria-current="page"]')).toHaveAttribute(
    'href',
    '/blog',
  );
});

test('the site navigation is not inside a complementary landmark', async ({
  page,
}) => {
  await page.goto('/');

  // It used to sit in an <aside>, so the only navigation on the site was
  // announced as "complementary".
  expect(
    await page.locator('#nav').evaluate((el) => !!el.closest('aside')),
  ).toBe(false);
});

test('the skip link moves focus, not just the scroll position', async ({
  page,
}) => {
  await page.goto('/');

  // Focus and Enter, not click: the link is sr-only until it has focus, so
  // there is nothing on screen to click — which is also the only way a real
  // user ever reaches it.
  const skip = page.locator('a[href="#main-content"]');
  await skip.focus();
  await expect(skip).toBeFocused();
  await page.keyboard.press('Enter');

  // <main> carries tabindex="-1" for this. Chrome and Firefox would move the
  // sequential focus starting point on their own; Safari would not.
  await expect(page.locator('#main-content')).toBeFocused();
});

test('scrollable code blocks can be reached from the keyboard', async ({
  page,
}) => {
  const withCode = POSTS_WITH_CODE[0];
  test.skip(!withCode, 'no post contains a code block');

  await page.goto(`/blog/${withCode}`);

  // Chromium focuses overflowing scrollers by itself; Firefox and Safari do
  // not, so without an explicit tabindex the rest of a long line is
  // unreachable there.
  const pres = page.locator('article pre');
  expect(await pres.count()).toBeGreaterThan(0);
  for (let i = 0; i < (await pres.count()); i++) {
    await expect(pres.nth(i)).toHaveAttribute('tabindex', '0');
    expect(
      (await pres.nth(i).getAttribute('aria-label'))?.length,
    ).toBeGreaterThan(0);
  }
});

test('a diagram can be traversed rather than only described', async ({
  page,
}) => {
  const withDiagram = POSTS_WITH_MERMAID[0];
  test.skip(!withDiagram, 'no post contains a diagram');

  await page.goto(`/blog/${withDiagram}`);

  // The drawing carries its structure in geometry, so it is hidden and the
  // equivalent below it carries the same information as links.
  await expect(page.locator('[data-testid="mermaid"]').first()).toHaveAttribute(
    'aria-hidden',
    'true',
  );

  const details = page.locator('details.diagram-text').first();
  await details.locator('summary').click();

  // Following an edge has to land on a step that is really there. This is the
  // whole point: a description can be read, a graph has to be walked.
  const edge = details.locator('li a').first();
  const href = await edge.getAttribute('href');
  expect(href).toMatch(/^#diagram-/);
  await edge.click();

  const landed = page.locator(href as string);
  await expect(landed).toBeVisible();
  await expect(landed).toHaveText(/Go to|Nothing leads out/);
});
