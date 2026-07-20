import { expect, test } from '@playwright/test';

test('home loads and shows key links', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: /hello, i'm sam/i }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: /get in touch/i }),
  ).toHaveAttribute('href', '/contact');
  await expect(
    page.locator('#nav').getByRole('link', { name: /^work$/i }),
  ).toHaveAttribute('href', '/work');
});

test('home links to LinkedIn as a safe external tab', async ({ page }) => {
  await page.goto('/');
  const linkedin = page.getByRole('link', { name: 'linkedin', exact: true });
  await expect(linkedin).toHaveAttribute(
    'href',
    'https://linkedin.com/in/samainsworth',
  );
  await expect(linkedin).toHaveAttribute('target', '_blank');
  await expect(linkedin).toHaveAttribute('rel', /noopener/);
});

test('cookie banner appears and can be accepted', async ({ page }) => {
  await page.goto('/');
  // Banner shows after a short delay
  // Banner has a 2s setTimeout on mount; under parallel dev-server load
  // the initial compile + delay can exceed 5s, so allow more headroom.
  await expect(
    page.getByText(/I use cookies to analyse traffic and provide features/i),
  ).toBeVisible({ timeout: 15000 });
  await page.getByRole('button', { name: /accept/i }).click();
  await expect(
    page.getByText(/I use cookies to analyse traffic and provide features/i),
  ).toBeHidden();
});
