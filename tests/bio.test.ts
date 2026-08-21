import { describe, expect, it } from 'vitest';
import resumeData from '../data/resume.json';
import {
  currentEmployer,
  currentJobTitle,
  email,
  fullName,
  getYearsOfExperience,
  linkedIn,
  location,
} from '../lib/bio';

describe('bio module', () => {
  it('derives fullName from resume.json', () => {
    expect(fullName).toBe(
      `${resumeData.personalInfo.name.first} ${resumeData.personalInfo.name.last}`,
    );
  });

  it('derives email from resume.json', () => {
    expect(email).toBe(resumeData.personalInfo.email);
  });

  it('derives linkedIn from resume.json', () => {
    expect(linkedIn).toBe(resumeData.personalInfo.linkedin);
  });

  it('derives location from resume.json', () => {
    expect(location).toBe(resumeData.personalInfo.location);
  });

  it('derives currentEmployer from the first experience entry', () => {
    expect(currentEmployer).toBe(resumeData.experience[0].company);
  });

  it('derives currentJobTitle from the first experience entry', () => {
    expect(currentJobTitle).toBe(resumeData.experience[0].position);
  });

  it('computes years of experience from careerStartDate', () => {
    const start = new Date(resumeData.careerStartDate);
    const now = new Date();
    const expectedYears = now.getFullYear() - start.getFullYear();
    const years = getYearsOfExperience();
    expect(years).toBeGreaterThanOrEqual(expectedYears - 1);
    expect(years).toBeLessThanOrEqual(expectedYears);
  });
});
