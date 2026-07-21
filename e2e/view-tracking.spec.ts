import { expect, test } from '@playwright/test';
import {
  isLocalhost,
  POSTS,
  prepareContext,
  SETTLE_MS,
  suppressCookieBanner,
} from './helpers';

// components/view-tracker.tsx fires a POST from the client once a post mounts.
// Letting it through writes a real, aggregate, un-undoable view count, so the
// tests below are localhost-only and every other spec goes through
// prepareContext(), which blocks /api/views outright.

test('prepareContext stops the suite writing view counts', async ({
  context,
  baseURL,
  page,
}) => {
  // Safe anywhere, and the guard that keeps the rest of the suite safe: a run
  // against a deployment must not touch the counters.
  await prepareContext(context, baseURL);

  const escaped: string[] = [];
  page.on('requestfinished', (req) => {
    if (req.url().includes('/api/views/')) escaped.push(req.url());
  });

  await page.goto(`/blog/${POSTS[0].slug}`);
  await expect(page.locator('article')).toBeVisible();
  await page.waitForLoadState('load');
  await page.waitForTimeout(SETTLE_MS);

  expect(escaped, 'view writes reached the server').toEqual([]);
});

test.describe('with the tracker allowed through', () => {
  test.beforeEach(async ({ context, baseURL }, testInfo) => {
    testInfo.skip(
      !isLocalhost(baseURL),
      'writes real view counts — localhost only',
    );
    await suppressCookieBanner(context, baseURL ?? '');
  });

  test('opening a post records a view', async ({ page }) => {
    const post = POSTS[0];
    const tracked = page.waitForRequest(
      (req) =>
        req.url().endsWith(`/api/views/${post.slug}`) &&
        req.method() === 'POST',
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
});
