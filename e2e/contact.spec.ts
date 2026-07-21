import { expect, test } from '@playwright/test';
import { prepareContext } from './helpers';

test.beforeEach(async ({ context, baseURL, page }) => {
  await prepareContext(context, baseURL);
  // Block Turnstile so verification deterministically fails client-side.
  // Keeps the suite off Cloudflare and off the mail path.
  await page.route('**/challenges.cloudflare.com/**', (route) => route.abort());
});

test('contact form marks message required and email optional', async ({
  page,
}) => {
  await page.goto('/contact');
  await expect(page.getByLabel(/message/i)).toHaveAttribute('required', '');
  await expect(page.getByLabel(/email/i)).not.toHaveAttribute('required', '');
});

test('contact page renders its heading and labelled fields', async ({
  page,
}) => {
  await page.goto('/contact');

  await expect(
    page.getByRole('heading', { level: 1, name: /get in touch/i }),
  ).toBeVisible();

  const email = page.getByLabel(/email/i);
  await expect(email).toHaveAttribute('type', 'email');
  await expect(email).toHaveAttribute('name', 'email');

  const message = page.getByLabel(/message/i);
  await expect(message).toHaveAttribute('name', 'message');

  await expect(page.getByRole('button', { name: /send/i })).toBeEnabled();
});

test('an empty message is blocked before anything is submitted', async ({
  page,
}) => {
  await page.goto('/contact');

  const message = page.getByLabel(/message/i);
  await page.getByRole('button', { name: /send/i }).click();

  // Native constraint validation stops the submit handler ever running.
  expect(
    await message.evaluate(
      (el: HTMLTextAreaElement) => el.validity.valueMissing,
    ),
  ).toBe(true);
  await expect(page.getByText(/verification failed/i)).toBeHidden();
});

test('a malformed email is blocked before anything is submitted', async ({
  page,
}) => {
  await page.goto('/contact');

  await page.getByLabel(/email/i).fill('not-an-email');
  await page.getByLabel(/message/i).fill('hello');
  await page.getByRole('button', { name: /send/i }).click();

  expect(
    await page
      .getByLabel(/email/i)
      .evaluate((el: HTMLInputElement) => el.validity.valid),
  ).toBe(false);
  await expect(page.getByText(/verification failed/i)).toBeHidden();
});

test('home → contact → submit shows response in aria-live region', async ({
  page,
}) => {
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
  await expect(page.locator('[aria-live="polite"]')).toHaveText(
    /verification failed/i,
  );
});

test('the form keeps what was typed when submission fails', async ({
  page,
}) => {
  await page.goto('/contact');

  await page.getByLabel(/email/i).fill('e2e@example.com');
  await page.getByLabel(/message/i).fill('hello from the e2e test');
  await page.getByRole('button', { name: /send/i }).click();

  await expect(page.getByText(/verification failed/i)).toBeVisible();

  // Only a successful send resets the form — a failure must not lose the draft.
  await expect(page.getByLabel(/message/i)).toHaveValue(
    'hello from the e2e test',
  );
  await expect(page.getByLabel(/email/i)).toHaveValue('e2e@example.com');
  await expect(page.getByRole('button', { name: /send/i })).toBeEnabled();
});
