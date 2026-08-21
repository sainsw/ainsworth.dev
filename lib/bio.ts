import resumeData from '@/data/resume.json';

export const fullName = `${resumeData.personalInfo.name.first} ${resumeData.personalInfo.name.last}`;

export const email = resumeData.personalInfo.email;

export const linkedIn = resumeData.personalInfo.linkedin;

export const location = resumeData.personalInfo.location;

export const currentEmployer = resumeData.experience[0].company;

export const currentJobTitle = resumeData.experience[0].position;

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
