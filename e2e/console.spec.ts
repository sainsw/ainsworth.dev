import { expect, test } from '@playwright/test';
import { PAGE_ROUTES, POSTS, prepareContext, SETTLE_MS } from './helpers';

const ROUTES = [...PAGE_ROUTES, `/blog/${POSTS[0].slug}`];

// Noise that says nothing about the app's health.
const IGNORED = [
  /favicon/i,
  /Download the React DevTools/i,
  /\[Fast Refresh\]/i,
  // Analytics and Speed Insights are served by the Vercel platform. Running a
  // production build anywhere else (`next start`, a container) leaves
  // /_vercel/* unrouted, so these are environment noise, not app defects.
  /vercel-scripts|vercel-insights|_vercel\//i,
  // Turnstile is a third-party widget and is deliberately blocked in tests.
  /challenges\.cloudflare\.com|turnstile/i,
  // WebKit logs resource failures without the URL, so they cannot be attributed
  // to a host here. Failed requests are asserted by name in the network test
  // below, which sees the real URL.
  /Failed to load resource/i,
];

const isNoise = (text: string) => IGNORED.some((pattern) => pattern.test(text));

test.beforeEach(async ({ context, baseURL }) => {
  await prepareContext(context, baseURL);
});

test('no page logs a console error', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error' && !isNoise(msg.text())) {
      errors.push(`${page.url()} → ${msg.text()}`);
    }
  });

  for (const route of ROUTES) {
    await page.goto(route);
    await page.waitForLoadState('load');
    await page.waitForTimeout(SETTLE_MS);
  }

  expect(errors).toEqual([]);
});

test('no page throws an uncaught exception', async ({ page }) => {
  const failures: string[] = [];
  page.on('pageerror', (error) => {
    if (!isNoise(error.message)) {
      failures.push(`${page.url()} → ${error.message}`);
    }
  });

  for (const route of ROUTES) {
    await page.goto(route);
    await page.waitForLoadState('load');
    await page.waitForTimeout(SETTLE_MS);
  }

  expect(failures).toEqual([]);
});

test('no page requests a resource that 404s', async ({ page }) => {
  const broken: string[] = [];
  page.on('response', (res) => {
    if (res.status() >= 400 && !isNoise(res.url())) {
      broken.push(`${res.status()} ${res.url()}`);
    }
  });

  for (const route of ROUTES) {
    await page.goto(route);
    await page.waitForLoadState('load');
    await page.waitForTimeout(SETTLE_MS);
  }

  expect(broken).toEqual([]);
});

test('the error boundary does not swallow a healthy page', async ({ page }) => {
  // app/error.tsx replaces the whole page when it trips. There is no way to
  // force a server error from outside the app, so this guards the other
  // direction: a page that renders fine must never fall into the boundary.
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));

  await page.goto(`/blog/${POSTS[0].slug}`);
  await expect(page.locator('article')).toBeVisible();
  await expect(page.getByText(/Oh no, something went wrong/i)).toHaveCount(0);
  expect(errors).toEqual([]);
});
