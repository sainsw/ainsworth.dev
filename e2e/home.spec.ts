import { expect, test } from '@playwright/test';
import { AVATAR_VERSION } from '@/lib/version';
import { prepareContext } from './helpers';

test.beforeEach(async ({ context, baseURL }) => {
  await prepareContext(context, baseURL);
});

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

test('home states years of experience derived from the start date', async ({
  page,
}) => {
  await page.goto('/');

  // lib/site.ts counts from 2016-07-26; derive the same number here rather than
  // hard-coding a value that silently ages out.
  const start = new Date(2016, 6, 26);
  const now = new Date();
  const reachedAnniversary =
    now.getMonth() > start.getMonth() ||
    (now.getMonth() === start.getMonth() && now.getDate() >= start.getDate());
  const years =
    now.getFullYear() - start.getFullYear() - (reachedAnniversary ? 0 : 1);

  await expect(page.locator('main')).toContainText(
    `${years}+ years of experience`,
  );
});

test('home prose links point at the work and blog pages', async ({ page }) => {
  await page.goto('/');
  // The navbar also lives inside <main>, so scope to the page's own section to
  // assert the inline prose links rather than the nav ones.
  const prose = page.locator('main > section');

  await expect(
    prose.getByRole('link', { name: 'work', exact: true }),
  ).toHaveAttribute('href', '/work');
  await expect(
    prose.getByRole('link', { name: 'blog', exact: true }),
  ).toHaveAttribute('href', '/blog');
});

test('home tech badges link out to the right vendors', async ({ page }) => {
  await page.goto('/');

  const badges = [
    { name: 'IBM', href: 'https://www.ibm.com' },
    { name: 'React', href: 'https://react.dev' },
    { name: '.NET', href: 'https://dotnet.microsoft.com' },
    { name: 'Azure', href: 'https://azure.microsoft.com/en-gb' },
  ];

  for (const badge of badges) {
    const link = page.locator(`main a[href="${badge.href}"]`);
    await expect(link, badge.name).toHaveCount(1);
    await expect(link, badge.name).toHaveAttribute('target', '_blank');
    await expect(link, badge.name).toHaveAttribute('rel', /noopener/);
  }
});

test('home lists the personal projects with working outbound links', async ({
  page,
}) => {
  await page.goto('/');

  await expect(
    page.getByRole('heading', { name: /personal projects/i }),
  ).toBeVisible();

  const projects = [
    { title: 'Framemoji', href: 'https://framemoji.ainsworth.dev' },
    { title: 'BurnRate', href: 'https://burnrate.ainsworth.dev' },
    { title: 'Invoicer', href: 'https://invoicer.ainsworth.dev' },
  ];

  for (const project of projects) {
    const link = page.locator(`main a[href="${project.href}"]`);
    await expect(link, project.title).toHaveCount(1);
    await expect(link, project.title).toContainText(project.title);
    await expect(link, project.title).toHaveAttribute('target', '_blank');
    await expect(link, project.title).toHaveAttribute('rel', /noreferrer/);
    // Each card carries a description, so an empty entry is caught.
    await expect(link.locator('p').first(), project.title).not.toBeEmpty();
  }
});

test('home preloads the avatar exactly once', async ({ page }) => {
  await page.goto('/');

  // app/page.tsx calls ReactDOM.preload(), which dedupes by href. A JSX
  // <link rel="preload"> would be hoisted into <head> while the authored copy
  // stayed put, shipping the tag twice.
  const preloads = page.locator(
    'link[rel="preload"][as="image"][type="image/webp"]',
  );
  await expect(preloads).toHaveCount(1);
  await expect(preloads).toHaveAttribute(
    'href',
    `/images/home/avatar-${AVATAR_VERSION}.webp`,
  );
});

test('the sprite is preloaded once per page, on every page', async ({
  page,
}) => {
  for (const route of ['/', '/work', '/blog', '/contact', '/privacy']) {
    await page.goto(route);
    await expect(
      page.locator('link[rel="preload"][href="/sprite.svg"]'),
      route,
    ).toHaveCount(1);
  }
});

test('the avatar preload is scoped to the page that needs it', async ({
  page,
}) => {
  // Only the home page renders the footer avatar above the fold, so preloading
  // it elsewhere would be wasted bytes on every other route.
  await page.goto('/work');
  await expect(
    page.locator('link[rel="preload"][as="image"][type="image/webp"]'),
  ).toHaveCount(0);
});
