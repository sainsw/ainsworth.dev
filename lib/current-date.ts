import 'server-only';
import { cacheLife } from 'next/cache';

/**
 * The current time, behind a cache boundary.
 *
 * `cacheComponents` refuses to prerender a bare `new Date()`: a wall-clock read
 * with no expiry would be baked into the static shell at build time and never
 * move again. Putting the read inside `use cache` gives it a bounded lifetime,
 * which is what makes it legal and, more to the point, correct.
 *
 * The only caller formats dates down to day granularity, so an hourly window is
 * plenty. The visible cost is that "Today" can take up to an hour to turn into
 * "1d ago" after midnight.
 */
export async function currentDate(): Promise<Date> {
  'use cache';
  cacheLife('hours');
  return new Date();
}
