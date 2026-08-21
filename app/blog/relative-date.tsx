import { currentDate } from '@/lib/current-date';
import { formatRelativeDate } from '@/lib/date';

/**
 * Renders "3d ago" for a post date. Async because the clock it reads is cached,
 * so this must only be rendered somewhere a suspend is allowed. Both callers sit
 * inside a Suspense boundary: never put it in a boundary's fallback.
 */
export async function RelativeDate({ date }: { date: string }) {
  return <>{formatRelativeDate(date, await currentDate())}</>;
}
