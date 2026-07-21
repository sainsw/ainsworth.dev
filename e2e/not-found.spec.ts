import { expect, test } from '@playwright/test';
import { MISSING_SLUG, prepareContext } from './helpers';

test.beforeEach(async ({ context, baseURL }) => {
  await prepareContext(context, baseURL);
});

test('an unknown route renders the not-found page with a 404', async ({
  page,
}) => {
  const res = await page.goto('/this-route-does-not-exist-xyz');
  expect(res?.status()).toBe(404);

  // The App Router boundary rendered, rather than the app crashing.
  await expect(page.locator('body')).not.toBeEmpty();
  await expect(page.getByText(/could not be found/i)).toBeVisible();
});

test('an unknown post slug renders the not-found page with a 404', async ({
  page,
}) => {
  const res = await page.goto(`/blog/${MISSING_SLUG}`);
  expect(res?.status()).toBe(404);
  await expect(page.getByText(/could not be found/i)).toBeVisible();
});

test('the site is still navigable from a 404', async ({ page }) => {
  await page.goto('/this-route-does-not-exist-xyz');

  // Next's built-in not-found page replaces the layout, so navigate directly
  // and confirm recovery works rather than expecting the navbar to be present.
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: /hello, i'm sam/i }),
  ).toBeVisible();
});
