export const SITE_URL = 'https://ainsworth.dev';
export const SITE_NAME = 'Sam Ainsworth';
export const SITE_AUTHOR_EMAIL = 's@ainsworth.dev';
export const SITE_CONTACT_FROM = 'form@contact.ainsworth.dev';

export function getYearsOfExperience(): number {
  const startDate = new Date(2016, 6, 26);
  const now = new Date();
  const years = now.getFullYear() - startDate.getFullYear();
  const hasReachedAnniversary =
    now.getMonth() > startDate.getMonth() ||
    (now.getMonth() === startDate.getMonth() &&
      now.getDate() >= startDate.getDate());
  return hasReachedAnniversary ? years : years - 1;
}
