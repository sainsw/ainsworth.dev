import { expect, test } from '@playwright/test';
import { POSTS, SETTLE_MS, suppressCookieBanner } from './helpers';

// components/view-tracker.tsx fires a POST from the client once a post mounts.

test.beforeEach(async ({ context, baseURL }) => {
  await suppressCookieBanner(context, baseURL ?? '');
});

test('opening a post records a view', async ({ page }) => {
  const post = POSTS[0];
  const tracked = page.waitForRequest(
    (req) =>
      req.url().endsWith(`/api/views/${post.slug}`) && req.method() === 'POST',
  );

  await page.goto(`/blog/${post.slug}`);

  const request = await tracked;
  const response = await request.response();
  expect(response?.status()).toBe(204);
});

test('the blog index does not record views', async ({ page }) => {
  const calls: string[] = [];
  page.on('request', (req) => {
    if (req.url().includes('/api/views/')) calls.push(req.url());
  });

  await page.goto('/blog');
  await expect(
    page.getByRole('heading', { name: /read my blog/i }),
  ).toBeVisible();
  await page.waitForLoadState('load');
  await page.waitForTimeout(SETTLE_MS);

  expect(calls).toEqual([]);
});

test('a failed view request never blocks the article', async ({ page }) => {
  const post = POSTS[0];
  // The tracker swallows errors on purpose — reading must not depend on it.
  await page.route(`**/api/views/${post.slug}`, (route) => route.abort());

  await page.goto(`/blog/${post.slug}`);

  await expect(
    page.getByRole('heading', { level: 1, name: post.title }),
  ).toBeVisible();
  await expect(page.locator('article')).toBeVisible();
});
