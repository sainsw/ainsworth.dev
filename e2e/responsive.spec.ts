import { expect, test } from '@playwright/test';
import { PAGE_ROUTES, POSTS, suppressCookieBanner } from './helpers';

const ROUTES = [...PAGE_ROUTES, `/blog/${POSTS[0].slug}`];

// app/global.css sets `html { min-width: 360px }`, so 360 is the narrowest
// width the design claims to support — testing below it would measure a
// deliberate clip, not a bug. The layout is a fixed max-w-2xl column, so the
// failure mode to guard is wide content (code blocks, mermaid diagrams, skill
// tags) forcing the page sideways.
const MIN_SUPPORTED_WIDTH = 360;

const VIEWPORTS = [
  { name: 'narrow phone', width: MIN_SUPPORTED_WIDTH, height: 640 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 800 },
];

const overflowOf = (page: import('@playwright/test').Page) =>
  page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );

test.beforeEach(async ({ context, baseURL }) => {
  await suppressCookieBanner(context, baseURL ?? '');
});

for (const viewport of VIEWPORTS) {
  test(`no horizontal overflow on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({
      width: viewport.width,
      height: viewport.height,
    });

    for (const route of ROUTES) {
      await page.goto(route);
      await expect(page.locator('#nav')).toBeVisible();

      // 1px of rounding slack; anything more is a visible sideways scroll.
      expect(
        await overflowOf(page),
        `${route} @ ${viewport.width}px`,
      ).toBeLessThanOrEqual(1);
    }
  });
}

test('the declared minimum width is honoured', async ({ page }) => {
  await page.goto('/');
  const minWidth = await page.evaluate(
    () => getComputedStyle(document.documentElement).minWidth,
  );
  expect(minWidth).toBe(`${MIN_SUPPORTED_WIDTH}px`);
});

test('a code-heavy post does not push the page sideways', async ({ page }) => {
  await page.setViewportSize({ width: MIN_SUPPORTED_WIDTH, height: 640 });
  await page.goto('/blog/api-design');

  await expect(page.locator('.sh__line').first()).toBeVisible();
  expect(await overflowOf(page)).toBeLessThanOrEqual(1);
});

test('a mermaid post does not push the page sideways', async ({ page }) => {
  await page.setViewportSize({ width: MIN_SUPPORTED_WIDTH, height: 640 });
  await page.goto('/blog/github-image-sync');

  await expect(page.locator('svg[id^="mermaid"]').first()).toBeVisible({
    timeout: 30000,
  });
  expect(await overflowOf(page)).toBeLessThanOrEqual(1);
});

test('the work page skill cloud wraps instead of overflowing', async ({
  page,
}) => {
  await page.setViewportSize({ width: MIN_SUPPORTED_WIDTH, height: 640 });
  await page.goto('/work');

  const overflowing = await page
    .locator('main span')
    .evaluateAll((els) =>
      els
        .filter(
          (el) => el.getBoundingClientRect().right > window.innerWidth + 1,
        )
        .map((el) => el.textContent),
    );

  expect(overflowing).toEqual([]);
});

test('the navbar keeps all four links reachable on a narrow phone', async ({
  page,
}) => {
  await page.setViewportSize({ width: MIN_SUPPORTED_WIDTH, height: 640 });
  await page.goto('/');

  const links = page.locator('#nav a');
  await expect(links).toHaveCount(4);
  for (let i = 0; i < 4; i++) {
    await expect(links.nth(i)).toBeInViewport();
  }
});
