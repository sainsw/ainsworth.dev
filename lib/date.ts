export function parsePostDate(date: string): Date {
  return new Date(date.includes('T') ? date : `${date}T00:00:00`);
}

export function formatLongDate(date: string): string {
  return parsePostDate(date).toLocaleString('en-us', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatRelativeDate(date: string) {
  const currentDate = new Date();
  const targetDate = parsePostDate(date);

  const yearDiff = currentDate.getFullYear() - targetDate.getFullYear();
  const monthDiff = currentDate.getMonth() - targetDate.getMonth();
  let totalMonthsAgo = yearDiff * 12 + monthDiff;

  if (currentDate.getDate() < targetDate.getDate()) {
    totalMonthsAgo -= 1;
  }

  if (totalMonthsAgo >= 12) {
    return `${Math.floor(totalMonthsAgo / 12)}y ago`;
  }

  if (totalMonthsAgo >= 1) {
    return `${totalMonthsAgo}mo ago`;
  }

  const msPerDay = 1000 * 60 * 60 * 24;
  const daysAgo = Math.floor(
    (currentDate.getTime() - targetDate.getTime()) / msPerDay,
  );
  return daysAgo > 0 ? `${daysAgo}d ago` : 'Today';
}
