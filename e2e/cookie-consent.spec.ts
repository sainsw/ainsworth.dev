import { expect, test } from '@playwright/test';

// components/cookie-banner.tsx shows a mini banner 2s after mount, unless a
// cookie-consent cookie already exists. Under parallel dev-server load the
// first compile plus that delay can exceed the default timeout.
const BANNER = /I use cookies to analyse traffic and provide features/i;
const APPEAR = { timeout: 15000 };

const consentCookie = async (page: import('@playwright/test').Page) =>
  (await page.context().cookies()).find((c) => c.name === 'cookie-consent');

test('the banner appears and can be accepted', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByText(BANNER)).toBeVisible(APPEAR);
  await page.getByRole('button', { name: /accept/i }).click();
  await expect(page.getByText(BANNER)).toBeHidden();

  expect((await consentCookie(page))?.value).toBe('accepted');
});

test('the banner can be declined', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByText(BANNER)).toBeVisible(APPEAR);
  await page.getByRole('button', { name: /decline/i }).click();
  await expect(page.getByText(BANNER)).toBeHidden();

  expect((await consentCookie(page))?.value).toBe('declined');
});

test('a recorded choice keeps the banner away on later visits', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByText(BANNER)).toBeVisible(APPEAR);
  await page.getByRole('button', { name: /decline/i }).click();
  await expect(page.getByText(BANNER)).toBeHidden();

  // Reload, and navigate to a different page — the choice is site-wide.
  await page.reload();
  await expect(page.getByText(BANNER)).toBeHidden();

  await page.goto('/blog');
  await expect(page.getByText(BANNER)).toBeHidden();
});

test('the banner fits on a narrow phone with both actions reachable', async ({
  page,
}) => {
  // 360px is the narrowest width app/global.css claims to support.
  await page.setViewportSize({ width: 360, height: 640 });
  await page.goto('/');

  await expect(page.getByText(BANNER)).toBeVisible(APPEAR);
  await expect(page.getByText(BANNER)).toBeInViewport();
  await expect(page.getByRole('button', { name: /accept/i })).toBeInViewport();
  await expect(page.getByRole('button', { name: /decline/i })).toBeInViewport();
  await expect(
    page.getByRole('link', { name: /privacy policy/i }),
  ).toBeInViewport();
});

test('the banner links to the privacy policy', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText(BANNER)).toBeVisible(APPEAR);

  const link = page.getByRole('link', { name: /privacy policy/i });
  await expect(link).toHaveAttribute('href', '/privacy');

  await link.click();
  await expect(page).toHaveURL(/\/privacy$/);
  await expect(
    page.getByRole('heading', { level: 1, name: /privacy policy/i }),
  ).toBeVisible();
});

// Vercel Analytics is consent-gated; Speed Insights is cookie-free and loads
// unconditionally, so it must be excluded from the match.
const isAnalyticsScript = (url: string) =>
  /(_vercel\/insights|vercel-scripts\.com\/v1)/.test(url) &&
  !url.includes('speed-insights');

test('analytics stay off when consent is declined', async ({ page }) => {
  // components/deferred-analytics.tsx only mounts <Analytics /> once the
  // cookie-consent cookie reads "accepted".
  const analyticsRequests: string[] = [];
  page.on('request', (req) => {
    if (isAnalyticsScript(req.url())) analyticsRequests.push(req.url());
  });

  await page.goto('/');
  await expect(page.getByText(BANNER)).toBeVisible(APPEAR);
  await page.getByRole('button', { name: /decline/i }).click();
  await expect(page.getByText(BANNER)).toBeHidden();
  await page.waitForLoadState('networkidle');

  expect(analyticsRequests).toEqual([]);
});

test('accepting consent boots analytics', async ({
  page,
  baseURL,
  browserName,
}) => {
  // The consent cookie is written with `Secure`. WebKit refuses to expose a
  // Secure cookie to document.cookie on an insecure origin (Chromium exempts
  // localhost), so DeferredAnalytics cannot read consent over plain http there.
  // Against the real https deployment this runs on every engine.
  test.skip(
    browserName === 'webkit' && !!baseURL?.startsWith('http://'),
    'Secure consent cookie is invisible to JS in WebKit over http',
  );

  const analyticsRequests: string[] = [];
  page.on('request', (req) => {
    if (isAnalyticsScript(req.url())) analyticsRequests.push(req.url());
  });

  await page.goto('/');
  await expect(page.getByText(BANNER)).toBeVisible(APPEAR);
  await page.getByRole('button', { name: /accept/i }).click();

  // The banner dispatches cookie-consent-accepted, which mounts <Analytics />.
  await expect
    .poll(() => analyticsRequests.length, { timeout: 15000 })
    .toBeGreaterThan(0);
});
