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

  // The clock is an argument now, so these can assert exact numbers instead of
  // a range. careerStartDate is 2016-07-26.
  it('counts a full year only once the anniversary has passed', () => {
    const start = new Date(resumeData.careerStartDate);
    expect(start.toISOString().slice(0, 10)).toBe('2016-07-26');

    expect(getYearsOfExperience(new Date('2024-07-25T12:00:00Z'))).toBe(7);
    expect(getYearsOfExperience(new Date('2024-07-26T12:00:00Z'))).toBe(8);
    expect(getYearsOfExperience(new Date('2024-07-27T12:00:00Z'))).toBe(8);
  });

  it('does not roll over early in an earlier month of the same year', () => {
    expect(getYearsOfExperience(new Date('2024-01-15T12:00:00Z'))).toBe(7);
    expect(getYearsOfExperience(new Date('2024-12-31T12:00:00Z'))).toBe(8);
  });

  it('reads the clock it is given rather than the real one', () => {
    // The whole point of the signature: the home page passes a cached clock, so
    // a bare `new Date()` in here would be both a build error and silently
    // frozen output. See lib/current-date.ts.
    expect(getYearsOfExperience(new Date('2030-07-26T12:00:00Z'))).toBe(14);
  });
});
