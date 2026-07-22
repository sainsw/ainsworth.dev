import { expect, type Locator, type Page, test } from '@playwright/test';
import { prepareContext } from '../helpers';

// Catches what no other spec can: a layout that still has every element, the
// right colours and no overflow, but looks wrong. The theme specs read computed
// values; the responsive specs measure overflow. Neither notices a section
// collapsing, a gap doubling, or an image rendering at the wrong size.
//
// Baselines are committed per platform (Playwright suffixes them -darwin /
// -linux), because font rasterisation differs between macOS and the Linux CI
// runner. Regenerate with:
//   npx playwright test --project=visual --update-snapshots
// or, for Linux without a Linux machine, run the e2e-on-demand workflow with
// update_snapshots=true and commit the artifact it uploads.

/**
 * Anything derived from the current date or the database, which would otherwise
 * rewrite the baseline on its own schedule:
 *   - "Last updated: 21 July 2026" on /privacy changes daily
 *   - "2mo ago" relative dates change monthly
 *   - "N views" changes whenever anyone reads a post
 *   - "9+ years of experience" and the footer copyright change annually
 * Masked regions are painted over, so their layout is still compared — only
 * their content is ignored.
 */
function volatileRegions(page: Page): Locator[] {
  return [
    // Footer copyright year.
    page.locator('footer div.text-sm'),
    // "Last updated" on /privacy.
    page.locator('p').filter({ hasText: /^Last updated:/ }),
    // Relative date + view count on each blog index row, and on a post.
    page.locator('main a[href^="/blog/"] p.text-muted-foreground'),
    page.locator('p.text-sm.text-muted-foreground').filter({ hasText: /\(/ }),
    page.getByText(/^[\d,]+ views$/),
    // "I'm a Senior Full Stack Engineer with N+ years of experience…" — the
    // number rolls over on an anniversary, and it is inline in the prose so the
    // whole paragraph has to go.
    page.locator('main > section > p.prose').first(),
  ];
}

/** Fixed slugs, not POSTS[0]: publishing a post must not invalidate a baseline. */
const ROUTES = [
  { name: 'home', path: '/' },
  { name: 'work', path: '/work' },
  { name: 'blog-index', path: '/blog' },
  { name: 'blog-post', path: '/blog/hello-world' },
  { name: 'contact', path: '/contact' },
  { name: 'privacy', path: '/privacy' },
] as const;

for (const scheme of ['light', 'dark'] as const) {
  test.describe(`${scheme} mode`, () => {
    test.use({ colorScheme: scheme });

    test.beforeEach(async ({ context, baseURL, page }) => {
      await prepareContext(context, baseURL);
      // Turnstile injects a third-party iframe into /contact whose contents and
      // load timing are outside our control.
      await page.route('**/challenges.cloudflare.com/**', (r) => r.abort());
    });

    for (const route of ROUTES) {
      test(`${route.name} looks right`, async ({ page }) => {
        await page.goto(route.path);

        // Web fonts shift metrics when they swap in, so wait for them to settle
        // before capturing or the first run bakes fallback glyphs into the file.
        await page.evaluate(() => document.fonts.ready);
        await expect(page.locator('footer')).toBeAttached();

        await expect(page).toHaveScreenshot(`${route.name}-${scheme}.png`, {
          fullPage: true,
          mask: volatileRegions(page),
        });
      });
    }
  });
}
