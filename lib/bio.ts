import resumeData from '@/data/resume.json';

export const fullName = `${resumeData.personalInfo.name.first} ${resumeData.personalInfo.name.last}`;

export const email = resumeData.personalInfo.email;

export const linkedIn = resumeData.personalInfo.linkedin;

export const location = resumeData.personalInfo.location;

export const currentEmployer = resumeData.experience[0].company;

export const currentJobTitle = resumeData.experience[0].position;

export function getYearsOfExperience(): number {
  const startDate = new Date(resumeData.careerStartDate);
  const now = new Date();
  const years = now.getFullYear() - startDate.getFullYear();
  const hasReachedAnniversary =
    now.getMonth() > startDate.getMonth() ||
    (now.getMonth() === startDate.getMonth() &&
      now.getDate() >= startDate.getDate());
  return hasReachedAnniversary ? years : years - 1;
}
