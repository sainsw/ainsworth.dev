import { expect, test } from '@playwright/test';

test('contact form marks message required and email optional', async ({
  page,
}) => {
  await page.goto('/contact');
  await expect(page.getByLabel(/message/i)).toHaveAttribute('required', '');
  await expect(page.getByLabel(/email/i)).not.toHaveAttribute('required', '');
});

test('home → contact → submit shows response in aria-live region', async ({
  page,
}) => {
  // Block Turnstile so verification deterministically fails client-side.
  // Keeps the test off Cloudflare and off the mail path.
  await page.route('**/challenges.cloudflare.com/**', (route) => route.abort());

  await page.goto('/');
  await page.getByRole('link', { name: /get in touch/i }).click();
  await expect(page).toHaveURL(/\/contact$/);

  await expect(page.getByLabel(/message/i)).toBeVisible();
  await expect(page.getByLabel(/email/i)).toBeVisible();

  await page.getByLabel(/email/i).fill('e2e@example.com');
  await page.getByLabel(/message/i).fill('hello from the e2e test');

  const send = page.getByRole('button', { name: /send/i });
  await expect(send).toBeEnabled();
  await send.click();

  // The aria-live region renders any submit response; with Turnstile blocked
  // this is the client-side verification-failed message.
  await expect(page.getByText(/verification failed/i)).toBeVisible();
});
