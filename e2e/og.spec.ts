import { test, expect } from '@playwright/test'

test('article OG image route returns an image', async ({ request }) => {
  const res = await request.get('/api/og/hello-world')
  expect(res.status()).toBe(200)
  const ctype = res.headers()['content-type'] || ''
  expect(ctype).toMatch(/image\//)
})

test('generic OG route with title param returns an image', async ({ request }) => {
  const res = await request.get('/og?title=Test+Title')
  expect(res.status()).toBe(200)
  const ctype = res.headers()['content-type'] || ''
  expect(ctype).toMatch(/image\//)
})

