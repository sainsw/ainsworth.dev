import { test, expect } from '@playwright/test'

test('home loads and shows key links', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: /hello, i'm sam/i })).toBeVisible()
  await expect(page.getByRole('link', { name: /get in touch/i })).toHaveAttribute('href', '/contact')
  await expect(page.getByRole('link', { name: /^work$/i })).toHaveAttribute('href', '/work')
})

test('cookie banner appears and can be accepted', async ({ page }) => {
  await page.goto('/')
  // Banner shows after a short delay
  await expect(page.getByText(/I use cookies to analyse traffic and provide features/i)).toBeVisible({ timeout: 5000 })
  await page.getByRole('button', { name: /accept/i }).click()
  await expect(page.getByText(/I use cookies to analyse traffic and provide features/i)).toBeHidden()
})

