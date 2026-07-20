import { expect, test } from '@playwright/test';
import { MISSING_SLUG, PAGE_ROUTES, POSTS } from '../helpers';

test('every page route serves HTML with a 200', async ({ request }) => {
  for (const route of PAGE_ROUTES) {
    const res = await request.get(route);
    expect(res.status(), route).toBe(200);
    expect(res.headers()['content-type'] || '', route).toContain('text/html');
  }
});

test('every published post serves HTML with a 200', async ({ request }) => {
  for (const post of POSTS) {
    const res = await request.get(`/blog/${post.slug}`);
    expect(res.status(), post.slug).toBe(200);
    expect(res.headers()['content-type'] || '', post.slug).toContain(
      'text/html',
    );
  }
});

test('trailing slashes redirect to the canonical path', async ({ request }) => {
  // next.config.ts sets trailingSlash: false — duplicate URLs would split SEO.
  for (const route of PAGE_ROUTES.filter((r) => r !== '/')) {
    const res = await request.get(`${route}/`, { maxRedirects: 0 });
    expect(res.status(), `${route}/`).toBe(308);
    expect(res.headers().location, `${route}/`).toMatch(
      new RegExp(`${route}$`),
    );
  }
});

test('routes are case sensitive rather than silently aliased', async ({
  request,
}) => {
  expect((await request.get('/Blog')).status()).toBe(404);
  expect((await request.get('/WORK')).status()).toBe(404);
});

test('unknown routes and unknown post slugs both 404', async ({ request }) => {
  expect((await request.get('/this-route-does-not-exist-xyz')).status()).toBe(
    404,
  );
  expect((await request.get(`/blog/${MISSING_SLUG}`)).status()).toBe(404);
  // A nested unknown path must not fall through to the blog post handler.
  expect((await request.get('/blog/nested/nope')).status()).toBe(404);
});
