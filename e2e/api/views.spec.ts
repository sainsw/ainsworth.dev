import { expect, test } from '@playwright/test';
import { isLocalhost, MISSING_SLUG, POSTS } from '../helpers';

// app/api/views/[slug]/route.ts increments a per-slug counter, guarded by a
// 24h `viewed-<slug>` cookie so a refresh does not inflate the count.

const slug = POSTS[0].slug;

// Only these two POST a real slug, so only these two write. The browser specs
// are covered by prepareContext(), which routes /api/views to abort, but that
// is a browser-context hook and cannot reach the `request` fixture — so gate on
// the origin. View counts are aggregate and an inflated one cannot be undone.
// The rejection paths below stay unguarded: they never reach the database, and
// they are worth asserting against a real deployment.
test.describe('writes to the counter', () => {
  test.beforeEach(({ baseURL }, testInfo) => {
    testInfo.skip(
      !isLocalhost(baseURL),
      'writes real view counts — localhost only',
    );
  });

  test('POST records a view and sets the dedupe cookie', async ({
    playwright,
    baseURL,
  }) => {
    // A fresh context per test — the shared `request` fixture would carry the
    // dedupe cookie between tests and make ordering significant.
    const api = await playwright.request.newContext({ baseURL });

    const first = await api.post(`/api/views/${slug}`);
    expect(first.status()).toBe(204);

    const cookies = await api.storageState();
    const dedupe = cookies.cookies.find((c) => c.name === `viewed-${slug}`);
    expect(dedupe?.value).toBe('1');
    expect(dedupe?.httpOnly).toBe(true);
    expect(dedupe?.sameSite).toBe('Lax');

    await api.dispose();
  });

  test('a repeat POST is deduped by the cookie', async ({
    playwright,
    baseURL,
  }) => {
    const api = await playwright.request.newContext({ baseURL });

    const first = await api.post(`/api/views/${slug}`);
    expect(first.status()).toBe(204);
    expect(first.headers()['set-cookie'] || '').toContain(`viewed-${slug}`);

    // Second call short-circuits before touching the database, so it must not
    // re-issue the cookie (which would extend the dedupe window indefinitely).
    const second = await api.post(`/api/views/${slug}`);
    expect(second.status()).toBe(204);
    expect(second.headers()['set-cookie'] || '').not.toContain(
      `viewed-${slug}`,
    );

    await api.dispose();
  });
});

test('POST 404s for a slug that is not a published post', async ({
  request,
}) => {
  expect((await request.post(`/api/views/${MISSING_SLUG}`)).status()).toBe(404);
});

test('the view counter is write-only — GET is not allowed', async ({
  request,
}) => {
  expect((await request.get(`/api/views/${slug}`)).status()).toBe(405);
});

test('slugs are matched exactly, not by prefix', async ({ request }) => {
  expect((await request.post(`/api/views/${slug}-extra`)).status()).toBe(404);
  expect((await request.post('/api/views/')).status()).toBe(404);
});
