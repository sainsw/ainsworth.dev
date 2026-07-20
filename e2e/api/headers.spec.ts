import { expect, test } from '@playwright/test';
import { PAGE_ROUTES, POSTS, SECURITY_HEADERS } from '../helpers';

// next.config.ts applies securityHeaders to `/(.*)`, so they must be present on
// pages, route handlers and static assets alike — not just the home page.
//
// /robots.txt is deliberately absent: in production Cloudflare's Managed
// robots.txt answers that path at the edge, so the request never reaches the
// app and carries none of its headers. /sitemap.xml does pass through and
// stands in for the route-handler case here.
const ALL_SURFACES = [
  ...PAGE_ROUTES,
  `/blog/${POSTS[0].slug}`,
  '/sitemap.xml',
  `/api/og/${POSTS[0].slug}`,
  '/sprite.svg',
];

for (const [header, expected] of Object.entries(SECURITY_HEADERS)) {
  test(`every surface sends ${header}`, async ({ request }) => {
    for (const path of ALL_SURFACES) {
      const value = (await request.get(path)).headers()[header] ?? '';
      if (expected instanceof RegExp) {
        expect(value, `${path} ${header}`).toMatch(expected);
      } else {
        expect(value, `${path} ${header}`).toBe(expected);
      }
    }
  });
}

test('CSP locks down the dangerous directives on every surface', async ({
  request,
}) => {
  for (const path of ALL_SURFACES) {
    const csp = (await request.get(path)).headers()['content-security-policy'];
    expect(csp, `${path} CSP`).toBeTruthy();

    // Directives that must stay closed regardless of what gets added later.
    expect(csp, path).toContain("default-src 'self'");
    expect(csp, path).toContain("base-uri 'self'");
    expect(csp, path).toContain("form-action 'self'");
    expect(csp, path).toContain("frame-ancestors 'none'");
    expect(csp, path).toContain("object-src 'none'");
    expect(csp, path).toContain("media-src 'none'");

    // Turnstile and the analytics endpoints the site actually calls.
    expect(csp, path).toContain('challenges.cloudflare.com');
    expect(csp, path).toContain('vitals.vercel-insights.com');
  }
});

test('CSP never allows unsafe-eval outside development', async ({
  request,
  baseURL,
}) => {
  test.skip(
    !!baseURL?.includes('localhost'),
    "next.config.ts intentionally adds 'unsafe-eval' in dev for React Refresh",
  );

  const csp = (await request.get('/')).headers()['content-security-policy'];
  expect(csp).not.toContain('unsafe-eval');
});

test('static assets are publicly cacheable', async ({ request }) => {
  // Long-lived immutable caching is intended for the content-hashed assets, but
  // the broader /images/* and /files/* rules in next.config.ts currently win, so
  // assert the invariant that actually holds: a public, non-trivial max-age.
  const assets = [
    '/sprite.svg',
    '/images/logos/asfc.svg',
    '/fonts/kaisei-tokumin-bold.ttf',
  ];

  for (const asset of assets) {
    const cacheControl = (await request.get(asset)).headers()['cache-control'];
    expect(cacheControl, asset).toContain('public');
    expect(cacheControl, asset).toMatch(/max-age=(\d+)/);

    const maxAge = Number(cacheControl.match(/max-age=(\d+)/)?.[1]);
    expect(maxAge, asset).toBeGreaterThanOrEqual(86_400);
  }
});

test('fonts are served immutable for a year', async ({ request }) => {
  const res = await request.get('/fonts/kaisei-tokumin-bold.ttf');
  expect(res.headers()['cache-control']).toBe(
    'public, max-age=31536000, immutable',
  );
});
