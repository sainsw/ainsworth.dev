import { expect, test } from '@playwright/test';
import { AVATAR_VERSION } from '@/lib/version';
import { PAGE_ROUTES, POSTS, prepareContext } from './helpers';

test.beforeEach(async ({ context, baseURL }) => {
  await prepareContext(context, baseURL);
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

  // The avatar is loading="lazy" and sits below the fold, so on a short
  // viewport it will not fetch until scrolled to. Scroll first, then assert.
  await avatar.scrollIntoViewIfNeeded();

  // A 404 still renders an <img>, so check the decoded bitmap has real pixels.
  // naturalWidth is 0 until the bytes decode, which covers "not loaded yet" too.
  await expect
    .poll(
      () =>
        avatar.evaluate((img: HTMLImageElement) => img.naturalWidth as number),
      { timeout: 15000 },
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
