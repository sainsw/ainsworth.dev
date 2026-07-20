import { expect, test } from '@playwright/test';

test('home → work → CV PDF link resolves', async ({ page, request }) => {
  await page.goto('/');
  await page
    .locator('#nav')
    .getByRole('link', { name: /^work$/i })
    .click();
  await expect(page).toHaveURL(/\/work$/);

  const cvLink = page.getByRole('link', { name: /open pdf version/i });
  await expect(cvLink).toBeVisible();
  await expect(cvLink).toHaveAttribute('target', '_blank');
  await expect(cvLink).toHaveAttribute('href', /^\/files\/cv-[a-f0-9]+\.pdf$/);

  const href = await cvLink.getAttribute('href');
  const res = await request.get(href ?? '');
  expect(res.status()).toBe(200);
  expect(res.headers()['content-type'] || '').toContain('application/pdf');
});
