import { expect, test } from '@playwright/test';
import resumeData from '@/data/resume.json';
import { CV_VERSION } from '@/lib/version';

// data/resume.json is the single source of truth: the /work page renders it,
// and scripts/generate-latex.js turns it into main.tex which pdflatex builds
// into the hashed PDF. That build runs locally, not in CI, so nothing stops
// resume.json being edited and committed without `npm run update-cv`. These
// tests are what catches that drift — every fact on the page must also be in
// the PDF a recruiter downloads.
//
// The text layer is read with unpdf rather than hand-rolled stream inflation:
// this is a PDF 1.5 with compressed object streams, and a naive extractor
// silently returns page 1 only, which would pass while checking half the CV.

/** Comparison ignores whitespace, case and punctuation — LaTeX positions words
 *  rather than emitting spaces, so extracted text has no reliable word breaks. */
const normalise = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]/g, '');

async function cvText(request: import('@playwright/test').APIRequestContext) {
  const res = await request.get(`/files/cv-${CV_VERSION}.pdf`);
  expect(res.status(), 'CV PDF').toBe(200);

  const { extractText, getDocumentProxy } = await import('unpdf');
  const pdf = await getDocumentProxy(new Uint8Array(await res.body()));
  const { totalPages, text } = await extractText(pdf, { mergePages: true });

  return { totalPages, haystack: normalise(text), raw: text };
}

test('the CV PDF has a readable text layer on every page', async ({
  request,
}) => {
  const { totalPages, raw, haystack } = await cvText(request);

  // A failed LaTeX run can still emit a valid but near-empty PDF.
  expect(totalPages).toBeGreaterThanOrEqual(2);
  expect(raw.length).toBeGreaterThan(2000);

  const { name, title, email, location } = resumeData.personalInfo;
  expect(haystack, 'name').toContain(normalise(`${name.first}${name.last}`));
  expect(haystack, 'title').toContain(normalise(title));
  expect(haystack, 'email').toContain(normalise(email));
  expect(haystack, 'location').toContain(normalise(location));
});

test('the CV PDF lists every role in resume.json', async ({ request }) => {
  const { haystack } = await cvText(request);

  expect(resumeData.experience.length).toBeGreaterThan(0);
  for (const job of resumeData.experience) {
    expect(haystack, `company: ${job.company}`).toContain(
      normalise(job.company),
    );
    expect(haystack, `position: ${job.position}`).toContain(
      normalise(job.position),
    );
    expect(haystack, `dates: ${job.company}`).toContain(normalise(job.dates));
  }
});

test('the CV PDF carries the written description of every role', async ({
  request,
}) => {
  const { haystack } = await cvText(request);

  // The prose is where drift is least visible on the web page, so pin it too.
  for (const job of resumeData.experience) {
    for (const [index, line] of (job.description ?? []).entries()) {
      expect(haystack, `${job.company} description[${index}]`).toContain(
        normalise(line),
      );
    }
  }
});

test('the CV PDF lists every qualification in resume.json', async ({
  request,
}) => {
  const { haystack } = await cvText(request);

  expect(resumeData.education.length).toBeGreaterThan(0);
  for (const school of resumeData.education) {
    expect(haystack, `institution: ${school.institution}`).toContain(
      normalise(school.institution),
    );
    expect(haystack, `degree: ${school.institution}`).toContain(
      normalise(school.degree),
    );
    expect(haystack, `dates: ${school.institution}`).toContain(
      normalise(school.dates),
    );
  }
});

test('the CV PDF lists every skill shown on the work page', async ({
  request,
}) => {
  const { haystack } = await cvText(request);

  const skills = resumeData.skillCategories.flatMap((c) => c.skills);
  expect(skills.length).toBeGreaterThan(0);
  for (const skill of skills) {
    expect(haystack, `skill: ${skill}`).toContain(normalise(skill));
  }
});

test('the linked CV is the one the site advertises', async ({ request }) => {
  // /work links to /files/cv-<CV_VERSION>.pdf. If lib/version.js and the file
  // on disk ever diverge, the download 404s for every visitor.
  const html = await (await request.get('/work')).text();
  const linked = html.match(/\/files\/cv-([a-f0-9]+)\.pdf/)?.[1];

  expect(linked, 'CV link on /work').toBe(CV_VERSION);
});
