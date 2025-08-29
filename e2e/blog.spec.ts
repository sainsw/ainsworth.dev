import { test, expect } from '@playwright/test'

test('blog index shows posts', async ({ page }) => {
  await page.goto('/blog')
  await expect(page.getByRole('heading', { name: /read my blog/i })).toBeVisible()
  await expect(page.getByRole('link', { name: /hello, world!/i })).toBeVisible()
})

test('blog post page renders title and content', async ({ page }) => {
  await page.goto('/blog/hello-world')
  await expect(page.getByRole('heading', { name: /hello, world!/i })).toBeVisible()
  await expect(page.getByText(/The blog lives, long live the blog\./i)).toBeVisible()
})

