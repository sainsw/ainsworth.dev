import { expect, test } from '@playwright/test';

test('sitemap.xml lists the known routes and blog posts', async ({
  request,
}) => {
  const res = await request.get('/sitemap.xml');
  expect(res.status()).toBe(200);
  expect(res.headers()['content-type'] || '').toMatch(/xml/);

  const body = await res.text();
  for (const path of ['', '/blog', '/work', '/contact', '/privacy']) {
    expect(body).toContain(`<loc>https://ainsworth.dev${path}</loc>`);
  }
  // sitemap enumerates blog posts via getBlogPosts()
  expect(body).toContain('<loc>https://ainsworth.dev/blog/hello-world</loc>');
  // /uses was removed — regression guard
  expect(body).not.toContain('/uses</loc>');
});

test('home response carries the configured security headers', async ({
  request,
}) => {
  const res = await request.get('/');
  expect(res.status()).toBe(200);
  const headers = res.headers();

  const csp = headers['content-security-policy'] || '';
  expect(csp).toContain("default-src 'self'");
  expect(csp).toContain("frame-ancestors 'none'");
  expect(csp).toContain("object-src 'none'");

  expect(headers['x-frame-options']).toBe('DENY');
  expect(headers['x-content-type-options']).toBe('nosniff');
  expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
  expect(headers['strict-transport-security'] || '').toMatch(
    /max-age=\d+.*includeSubDomains/i,
  );
});

test('robots.txt points at the sitemap', async ({ request }) => {
  const res = await request.get('/robots.txt');
  expect(res.status()).toBe(200);
  expect(res.headers()['content-type'] || '').toMatch(/text\/plain/);

  const body = await res.text();
  expect(body).toMatch(/User-Agent:\s*\*/i);
  expect(body).toContain('Sitemap: https://ainsworth.dev/sitemap.xml');
});

test('unknown route returns 404', async ({ page, request }) => {
  const res = await request.get('/this-route-does-not-exist-xyz');
  expect(res.status()).toBe(404);

  // Page still renders (not a crash) so the App Router not-found boundary works
  const nav = await page.goto('/this-route-does-not-exist-xyz');
  expect(nav?.status()).toBe(404);
  await expect(page.locator('body')).not.toBeEmpty();
});
