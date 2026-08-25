import resumeData from '@/data/resume.json';

export const fullName = `${resumeData.personalInfo.name.first} ${resumeData.personalInfo.name.last}`;

export const email = resumeData.personalInfo.email;

export const linkedIn = resumeData.personalInfo.linkedin;

export const location = resumeData.personalInfo.location;

export const currentEmployer = resumeData.experience[0].company;

export const currentJobTitle = resumeData.experience[0].position;

export const currentEmployerUrl = resumeData.experience[0].url;

/**
 * Schools and universities, for the `alumniOf` edge on the Person graph.
 * `data/resume.json` is Sam's own writing and off limits to edit (see
 * CLAUDE.md), but reading it is how every other bio field here works.
 */
export const education = resumeData.education.map(({ institution, url }) => ({
  name: institution,
  url,
}));

/**
 * Everything the CV claims as a skill or a technology, flattened for
 * `knowsAbout`.
 *
 * Splitting is deliberately timid. Commas and spaced slashes are safe
 * separators ("MySQL, MSSQL, NoSQL", "React / Vue"), but a bare slash is not:
 * it would shred "CI/CD" and "Git (Github/Azure DevOps)". So "Python/Go/Swift"
 * survives as one string rather than risk mangling its neighbours. Better a
 * blunt entity than a wrong one.
 */
export const knowsAbout = Array.from(
  new Map(
    [
      ...resumeData.skillCategories.flatMap((category) => category.skills),
      ...resumeData.experience.flatMap((role) => role.technologies ?? []),
    ]
      .flatMap((entry) => entry.split(/,| \/ /))
      .map((entry) => entry.trim())
      .filter(Boolean)
      // Case-insensitive dedupe, keeping the first spelling seen.
      .map((entry) => [entry.toLowerCase(), entry] as const),
  ).values(),
);

/**
 * Pure on purpose: the caller passes the clock in. A bare `new Date()` here is a
 * build error under `cacheComponents`, and it was quietly wrong before that too:
 * the home page is statically prerendered, so the number froze at build time.
 */
export function getYearsOfExperience(now: Date): number {
  const startDate = new Date(resumeData.careerStartDate);
  const years = now.getFullYear() - startDate.getFullYear();
  const hasReachedAnniversary =
    now.getMonth() > startDate.getMonth() ||
    (now.getMonth() === startDate.getMonth() &&
      now.getDate() >= startDate.getDate());
  return hasReachedAnniversary ? years : years - 1;
}
