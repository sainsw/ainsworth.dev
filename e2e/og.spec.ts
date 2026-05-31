import { expect, test } from '@playwright/test';

test('article OG image route returns an image', async ({ request }) => {
  const res = await request.get('/api/og/hello-world');
  expect(res.status()).toBe(200);
  const ctype = res.headers()['content-type'] || '';
  expect(ctype).toMatch(/image\//);
});

test('article OG image route returns correct content type', async ({
  request,
}) => {
  const res = await request.get('/api/og/hello-world');
  const ctype = res.headers()['content-type'] || '';
  expect(ctype).toContain('image/');
});
