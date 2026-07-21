import { expect, test } from '@playwright/test';
import resumeData from '../data/resume.json';
import { prepareContext } from './helpers';

test.beforeEach(async ({ context, baseURL }) => {
  await prepareContext(context, baseURL);
});

test('work page renders every entry from resume.json', async ({ page }) => {
  await page.goto('/work');

  await expect(
    page.getByRole('heading', { name: /skills & technologies/i }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { level: 2, name: /^work/i }),
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: /education/i })).toBeVisible();

  for (const job of resumeData.experience) {
    await expect(page.getByText(job.company, { exact: true })).toBeVisible();
    await expect(page.getByText(job.position, { exact: true })).toBeVisible();
  }

  for (const school of resumeData.education) {
    await expect(
      page.getByText(school.institution, { exact: true }),
    ).toBeVisible();
  }

  for (const hobby of resumeData.hobbies) {
    await expect(page.getByText(hobby, { exact: true })).toBeVisible();
  }
});

test('work page renders every skill from every category', async ({ page }) => {
  await page.goto('/work');

  const skills = resumeData.skillCategories.flatMap((c) => c.skills);
  expect(skills.length).toBeGreaterThan(0);

  for (const skill of skills) {
    await expect(
      page.getByText(skill, { exact: true }).first(),
      skill,
    ).toBeVisible();
  }
});

test('work page renders the non-technical skills list', async ({ page }) => {
  await page.goto('/work');

  await expect(
    page.getByRole('heading', { name: /non-technical skills/i }),
  ).toBeVisible();

  for (const skill of resumeData.nonTechnicalSkills) {
    await expect(page.getByText(skill, { exact: true })).toBeVisible();
  }
});

test('work page shows dates and blurbs for each role', async ({ page }) => {
  await page.goto('/work');

  for (const job of resumeData.experience) {
    await expect(
      page.getByText(job.dates, { exact: true }).first(),
      job.company,
    ).toBeVisible();

    for (const line of job.description ?? []) {
      await expect(
        page.getByText(line, { exact: true }),
        `${job.company} blurb`,
      ).toBeVisible();
    }
  }
});

test('employer and school logos link out safely', async ({ page }) => {
  await page.goto('/work');

  const entries = [...resumeData.experience, ...resumeData.education].filter(
    (e) => e.url,
  );
  expect(entries.length).toBeGreaterThan(0);

  for (const entry of entries) {
    const name = 'company' in entry ? entry.company : entry.institution;
    const link = page.locator(`main a[href="${entry.url}"]`).first();

    await expect(link, name).toHaveAttribute('target', '_blank');
    await expect(link, name).toHaveAttribute('rel', /noopener/);
    // The logo is decorative, so the link carries the accessible name.
    await expect(link, name).toHaveAttribute('aria-label', `Visit ${name}`);
  }
});

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

test('the CV is prefetched once its link scrolls into view', async ({
  page,
}) => {
  // app/hooks/use-prefetch-on-view.ts warms the PDF via fetch() on intersection.
  const prefetched = page.waitForRequest((req) =>
    /\/files\/cv-[a-f0-9]+\.pdf$/.test(req.url()),
  );

  await page.goto('/work');
  await page
    .getByRole('link', { name: /open pdf version/i })
    .scrollIntoViewIfNeeded();

  expect((await prefetched).url()).toMatch(/\/files\/cv-[a-f0-9]+\.pdf$/);
});
