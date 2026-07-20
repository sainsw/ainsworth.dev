import { expect, test } from '@playwright/test';

test('privacy page renders', async ({ page }) => {
  await page.goto('/privacy');
  await expect(
    page.getByRole('heading', { level: 1, name: /privacy policy/i }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { level: 2, name: /who i am/i }),
  ).toBeVisible();
});
