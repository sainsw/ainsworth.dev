import { expect, test } from '@playwright/test';
import { formatLongDate } from '@/lib/date';
import { MISSING_SLUG, POSTS, suppressCookieBanner } from './helpers';

test.beforeEach(async ({ context, baseURL }) => {
  await suppressCookieBanner(context, baseURL ?? '');
});

test('blog index shows posts', async ({ page }) => {
  await page.goto('/blog');
  await expect(
    page.getByRole('heading', { name: /read my blog/i }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: /hello, world!/i }),
  ).toBeVisible();
});

test('blog index lists every post, newest first', async ({ page }) => {
  await page.goto('/blog');

  const links = page.locator('main a[href^="/blog/"]');
  await expect(links).toHaveCount(POSTS.length);

  // POSTS is sorted newest-first, matching the sort in app/blog/page.tsx.
  const hrefs = await links.evaluateAll((els) =>
    els.map((el) => el.getAttribute('href')),
  );
  expect(hrefs).toEqual(POSTS.map((p) => `/blog/${p.slug}`));

  for (const post of POSTS) {
    await expect(
      page.locator(`main a[href="/blog/${post.slug}"]`),
      post.slug,
    ).toContainText(post.title);
  }
});

test('blog index renders a view count for every post', async ({ page }) => {
  await page.goto('/blog');

  // The Suspense fallback resolves into a ViewCounter per row; wait for the
  // first before counting so a slow view lookup is not read as a failure.
  const counters = page.getByText(/^[\d,]+ views$/);
  await expect(counters.first()).toBeVisible();
  await expect(counters).toHaveCount(POSTS.length);
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

test('blog post shows its publication date and view count', async ({
  page,
}) => {
  const post = POSTS[0];
  await page.goto(`/blog/${post.slug}`);

  // app/blog/[slug]/page.tsx renders "<long date> (<relative>)".
  await expect(
    page.getByText(new RegExp(`${formatLongDate(post.publishedAt)}\\s*\\(`)),
  ).toBeVisible();
  await expect(page.getByText(/^[\d,]+ views$/)).toBeVisible();
});

test('blog post body renders as an article with real prose', async ({
  page,
}) => {
  const post = POSTS[0];
  await page.goto(`/blog/${post.slug}`);

  const article = page.locator('article');
  await expect(article).toBeVisible();
  expect((await article.innerText()).trim().length).toBeGreaterThan(200);
});

test('missing blog slug returns 404', async ({ page, request }) => {
  const res = await request.get(`/blog/${MISSING_SLUG}`);
  expect(res.status()).toBe(404);

  const nav = await page.goto(`/blog/${MISSING_SLUG}`);
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
