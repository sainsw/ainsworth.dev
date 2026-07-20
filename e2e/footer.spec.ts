import { expect, test } from '@playwright/test';
import { AVATAR_VERSION } from '@/lib/version';
import { PAGE_ROUTES, POSTS, suppressCookieBanner } from './helpers';

test.beforeEach(async ({ context, baseURL }) => {
  await suppressCookieBanner(context, baseURL ?? '');
});

test('the footer appears on every page', async ({ page }) => {
  for (const route of [...PAGE_ROUTES, `/blog/${POSTS[0].slug}`]) {
    await page.goto(route);
    await expect(page.locator('footer'), route).toBeVisible();
  }
});

test('the footer avatar actually loads', async ({ page }) => {
  await page.goto('/');

  const avatar = page.locator('footer img[alt="my face"]');
  await expect(avatar).toBeVisible();
  await expect(avatar).toHaveAttribute(
    'src',
    `/images/home/avatar-${AVATAR_VERSION}.jpg`,
  );

  // A 404 still renders an <img>, so check the decoded bitmap has real pixels.
  await expect
    .poll(() =>
      avatar.evaluate(
        (img: HTMLImageElement) => img.complete && img.naturalWidth,
      ),
    )
    .toBeGreaterThan(0);
});

test('the footer avatar links to LinkedIn as a safe external tab', async ({
  page,
}) => {
  await page.goto('/');

  const link = page.locator('footer a[aria-label="find me on linkedin"]');
  await expect(link).toHaveAttribute(
    'href',
    'https://linkedin.com/in/samainsworth',
  );
  await expect(link).toHaveAttribute('target', '_blank');
  await expect(link).toHaveAttribute('rel', /noopener/);
});

test('the copyright runs from 2024 to the current year', async ({ page }) => {
  await page.goto('/');

  const year = new Date().getFullYear();
  const expected =
    year > 2024
      ? `© Sam Ainsworth 2024 - ${year}. All Rights Reserved.`
      : `© Sam Ainsworth ${year}. All Rights Reserved.`;

  await expect(page.locator('footer')).toContainText(expected);
});
