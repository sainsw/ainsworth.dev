import { type APIRequestContext, expect, test } from '@playwright/test';
import {
  IMMUTABLE_ASSETS,
  PAGE_ROUTES,
  POSTS,
  REVALIDATED_ASSETS,
  SECURITY_HEADERS,
} from '../helpers';

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

// The rules in next.config.ts are order-sensitive: every match is applied and
// the last one wins for a repeated key, so the broad directory rules must come
// before the content-hashed exceptions. These two tests are what catches a
// reordering that silently downgrades the hashed assets.
//
// Against a deployment, a plain request can be answered from the CDN edge with
// whatever Cache-Control was stored before the last deploy — a snapshot of the
// old config, not the current one. A unique query string forces a miss so these
// assert what the origin is configured to send. Next matches header rules on
// the path, so the parameter does not change which rule applies.
const originHeaders = async (
  request: APIRequestContext,
  path: string,
): Promise<Record<string, string>> => {
  const res = await request.get(`${path}?cache-bust=${Date.now()}-${count++}`);
  expect(res.status(), path).toBe(200);
  return res.headers();
};

let count = 0;

test('content-hashed assets are cached immutably for a year', async ({
  request,
}) => {
  for (const asset of IMMUTABLE_ASSETS) {
    const headers = await originHeaders(request, asset);
    expect(headers['cache-control'], asset).toBe(
      'public, max-age=31536000, immutable',
    );
  }
});

test('unversioned assets revalidate daily instead', async ({ request }) => {
  for (const asset of REVALIDATED_ASSETS) {
    const headers = await originHeaders(request, asset);
    expect(headers['cache-control'], asset).toBe(
      'public, max-age=86400, must-revalidate',
    );
  }
});
