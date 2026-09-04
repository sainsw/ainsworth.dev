import { expect, test } from '@playwright/test';
import { prepareContext } from './helpers';

test.beforeEach(async ({ context, baseURL }) => {
  await prepareContext(context, baseURL);
});

test('privacy page renders', async ({ page }) => {
  await page.goto('/privacy');
  await expect(
    page.getByRole('heading', { level: 1, name: /privacy policy/i }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { level: 2, name: /who i am/i }),
  ).toBeVisible();
});

test('privacy page covers every required policy section', async ({ page }) => {
  await page.goto('/privacy');

  // A policy that quietly loses a section is a compliance problem, so pin them.
  const sections = [
    /who i am/i,
    /cookies and analytics/i,
    /your choices/i,
    /contact form/i,
    /data retention/i,
    /service providers/i,
    /legal basis/i,
    /your rights/i,
    /^contact$/i,
  ];

  for (const name of sections) {
    await expect(
      page.getByRole('heading', { level: 2, name }),
      String(name),
    ).toBeVisible();
  }
});

test('privacy page shows a last-updated date', async ({ page }) => {
  await page.goto('/privacy');
  await expect(
    page.getByText(/Last updated:\s*\d{1,2}\s+\w+\s+\d{4}/),
  ).toBeVisible();
});

test('the email triggers never expose the address to scrapers', async ({
  page,
}) => {
  await page.goto('/privacy');

  // Buttons, not links: they have no destination, they run script. An
  // <a href="#"> announced a link that went nowhere.
  const emailButtons = page.getByRole('button', { name: /email privacy at/i });
  expect(await emailButtons.count()).toBeGreaterThan(0);

  // components/email-link.tsx keeps the address out of the markup and builds
  // the mailto: on click instead, so the rendered HTML must not contain it.
  for (let i = 0; i < (await emailButtons.count()); i++) {
    await expect(emailButtons.nth(i)).not.toHaveAttribute('href', /.*/);
    await expect(emailButtons.nth(i)).toHaveAttribute(
      'aria-label',
      'Email privacy at ainsworth.dev',
    );
  }
  expect(await page.content()).not.toContain('privacy@ainsworth.dev');
});

test('clicking an email trigger does not navigate away', async ({ page }) => {
  await page.goto('/privacy');

  // A button submits nothing and follows nothing, so the reader must still be
  // on /privacy with no stray fragment afterwards.
  await page
    .getByRole('button', { name: /email privacy at/i })
    .first()
    .click();

  await expect(page).toHaveURL(/\/privacy$/);
  await expect(
    page.getByRole('heading', { level: 1, name: /privacy policy/i }),
  ).toBeVisible();
});

test('privacy page links out to the Turnstile privacy addendum', async ({
  page,
}) => {
  await page.goto('/privacy');
  await expect(
    page.getByRole('link', { name: /turnstile privacy addendum/i }),
  ).toHaveAttribute('href', /cloudflare\.com\/policies\/privacy/);
});
