import { expect, test } from '@playwright/test';

test('blog index shows posts', async ({ page }) => {
  await page.goto('/blog');
  await expect(
    page.getByRole('heading', { name: /read my blog/i }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: /hello, world!/i }),
  ).toBeVisible();
});

test('home → nav to blog → open a post', async ({ page }) => {
  await page.goto('/');
  await page
    .locator('#nav')
    .getByRole('link', { name: /^blog$/i })
    .click();
  await expect(page).toHaveURL(/\/blog$/);
  await expect(
    page.getByRole('heading', { name: /read my blog/i }),
  ).toBeVisible();

  await page.getByRole('link', { name: /hello, world!/i }).click();
  await expect(page).toHaveURL(/\/blog\/hello-world$/);
  await expect(
    page.getByRole('heading', { name: /hello, world!/i }),
  ).toBeVisible();
});

test('blog post page renders title and content', async ({ page }) => {
  await page.goto('/blog/hello-world');
  await expect(
    page.getByRole('heading', { name: /hello, world!/i }),
  ).toBeVisible();
  await expect(
    page.getByText(/The blog lives, long live the blog\./i),
  ).toBeVisible();
});

test('missing blog slug returns 404', async ({ page, request }) => {
  const res = await request.get('/blog/definitely-not-a-real-post');
  expect(res.status()).toBe(404);

  const nav = await page.goto('/blog/definitely-not-a-real-post');
  expect(nav?.status()).toBe(404);
});

test('blog post exposes correct OpenGraph + canonical metadata', async ({
  page,
}) => {
  await page.goto('/blog/hello-world');

  await expect(page).toHaveTitle(/hello, world!/i);

  const canonical = await page
    .locator('link[rel="canonical"]')
    .getAttribute('href');
  expect(canonical).toBe('https://ainsworth.dev/blog/hello-world');

  const ogTitle = await page
    .locator('meta[property="og:title"]')
    .getAttribute('content');
  expect(ogTitle).toMatch(/hello, world!/i);

  const ogType = await page
    .locator('meta[property="og:type"]')
    .getAttribute('content');
  expect(ogType).toBe('article');

  const ogImage = await page
    .locator('meta[property="og:image"]')
    .getAttribute('content');
  expect(ogImage).toBe('https://ainsworth.dev/api/og/hello-world');

  const twitterCard = await page
    .locator('meta[name="twitter:card"]')
    .getAttribute('content');
  expect(twitterCard).toBe('summary_large_image');
});
