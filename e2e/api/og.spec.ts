import { expect, test } from '@playwright/test';
import { MISSING_SLUG, POSTS } from '../helpers';

// app/api/og/[slug]/route.tsx renders a 1200x630 card from post metadata.

test('every post has a working OG image endpoint', async ({ request }) => {
  for (const post of POSTS) {
    const res = await request.get(`/api/og/${post.slug}`);
    expect(res.status(), `/api/og/${post.slug}`).toBe(200);
    expect(res.headers()['content-type'] || '', post.slug).toMatch(/^image\//);

    // A card that rendered nothing would still be a valid image, so assert the
    // payload is substantial enough to actually contain the title and summary.
    const body = await res.body();
    expect(body.byteLength, post.slug).toBeGreaterThan(5_000);
  }
});

test('OG image is a PNG at the declared 1200x630 card size', async ({
  request,
}) => {
  const res = await request.get(`/api/og/${POSTS[0].slug}`);
  const body = await res.body();

  // PNG signature, then IHDR width/height as big-endian uint32s at bytes 16/20.
  expect(body.subarray(0, 8)).toEqual(
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  );
  expect(body.readUInt32BE(16)).toBe(1200);
  expect(body.readUInt32BE(20)).toBe(630);
});

test('OG image route 404s for an unknown slug', async ({ request }) => {
  const res = await request.get(`/api/og/${MISSING_SLUG}`);
  expect(res.status()).toBe(404);
});
