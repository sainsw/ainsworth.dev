import { expect, test } from '@playwright/test';
import resumeData from '../data/resume.json';

test('work page renders every entry from resume.json', async ({ page }) => {
  await page.goto('/work');

  await expect(
    page.getByRole('heading', { name: /skills & technologies/i }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { level: 2, name: /^work/i }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: /education/i }),
  ).toBeVisible();

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
