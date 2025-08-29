import { test, expect } from '@playwright/test'

test('admin redirects unauthenticated users to home', async ({ page }) => {
  const resp = await page.goto('/admin')
  // Next App Router redirect results in navigation to '/'
  await expect(page).toHaveURL(/\/$/)
  await expect(page.getByRole('heading', { name: /hello, i'm sam/i })).toBeVisible()
  expect(resp?.status()).toBeLessThan(400)
})

