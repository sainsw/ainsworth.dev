import { expect, test } from '@playwright/test';
import {
  NAV_ITEMS,
  PAGE_ROUTES,
  POSTS,
  suppressCookieBanner,
  waitForHydration,
} from './helpers';

test.beforeEach(async ({ context, baseURL }) => {
  await suppressCookieBanner(context, baseURL ?? '');
});

test('the navbar is present with every link on every page', async ({
  page,
}) => {
  for (const route of [...PAGE_ROUTES, `/blog/${POSTS[0].slug}`]) {
    await page.goto(route);

    const nav = page.locator('#nav');
    await expect(nav, route).toBeVisible();

    for (const item of NAV_ITEMS) {
      await expect(
        nav.getByRole('link', { name: item.name, exact: true }),
        `${route} → ${item.name}`,
      ).toHaveAttribute('href', item.path);
    }
  }
});

test('every navbar link reaches its page', async ({ page }) => {
  for (const item of NAV_ITEMS) {
    // Start from a page that is not the destination so the click always moves.
    await page.goto(item.path === '/' ? '/privacy' : '/');

    await page
      .locator('#nav')
      .getByRole('link', { name: item.name, exact: true })
      .click();

    const expected = new RegExp(
      `${item.path === '/' ? '' : item.path}$`.replace(/\//g, '\\/'),
    );
    await expect(page, item.name).toHaveURL(expected);
    await expect(page.locator('#nav')).toBeVisible();

    // Wait for the destination's own heading, which proves the RSC fetch
    // finished. Without this the next goto races the in-flight navigation and
    // WebKit aborts it with "interrupted by another navigation".
    await expect(
      page.getByRole('heading', { name: item.heading }).first(),
      item.name,
    ).toBeVisible();
  }
});

test('navigating between pages is client-side, not a full reload', async ({
  page,
}) => {
  await page.goto('/');

  // Clicking before hydration lets the browser follow the plain href, which is
  // a hard navigation and would fail this assertion for reasons that have
  // nothing to do with routing.
  await waitForHydration(page, '#nav a[href="/blog"]');

  // Survives a soft navigation, but not a document reload.
  await page.evaluate(() => {
    (window as unknown as { __softNav: boolean }).__softNav = true;
  });

  await page.locator('#nav').getByRole('link', { name: 'blog' }).click();
  await expect(page).toHaveURL(/\/blog$/);
  await expect(
    page.getByRole('heading', { name: /read my blog/i }),
  ).toBeVisible();

  const survived = await page.evaluate(
    () => (window as unknown as { __softNav?: boolean }).__softNav === true,
  );
  expect(survived).toBe(true);
});

test('browser back and forward restore the right pages', async ({ page }) => {
  await page.goto('/');
  await page.locator('#nav').getByRole('link', { name: 'work' }).click();
  await expect(page).toHaveURL(/\/work$/);

  await page.locator('#nav').getByRole('link', { name: 'blog' }).click();
  await expect(page).toHaveURL(/\/blog$/);

  await page.goBack();
  await expect(page).toHaveURL(/\/work$/);
  await expect(
    page.getByRole('heading', { name: /skills & technologies/i }),
  ).toBeVisible();

  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await expect(
    page.getByRole('heading', { name: /hello, i'm sam/i }),
  ).toBeVisible();

  await page.goForward();
  await expect(page).toHaveURL(/\/work$/);
});

test('deep-linking straight to a post renders without visiting the index', async ({
  page,
}) => {
  const post = POSTS[0];
  await page.goto(`/blog/${post.slug}`);

  await expect(
    page.getByRole('heading', { level: 1, name: post.title }),
  ).toBeVisible();
  await expect(page.locator('#nav')).toBeVisible();
});
