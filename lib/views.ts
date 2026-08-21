import 'server-only';
import { unstable_cache } from 'next/cache';
import { sql } from '@/lib/db/postgres';

/**
 * `null` means the counter is unavailable: no database configured, or the query
 * failed. That is deliberately distinct from `0`, which is a post nobody has
 * read yet. Callers render nothing for `null` rather than claiming zero views.
 */
export type ViewCount = number | null;

// Aligned with the pages' ISR window (app/blog/*). A longer inner cache would
// cap how fresh the count can be regardless of page revalidation.
const CACHE_WINDOW_SECONDS = 60;

const cachedRows = unstable_cache(
  () => sql<{ slug: string; count: number }[]>`SELECT slug, count FROM views`,
  ['views-count'],
  { revalidate: CACHE_WINDOW_SECONDS },
);

/**
 * The catch sits *outside* unstable_cache on purpose. A rejection thrown
 * through the cache is not stored, so the next request retries; catching inside
 * would cache the failure and pin every count at "unavailable" for the full
 * window even after the database came back.
 */
async function readCounts(): Promise<Map<string, number> | null> {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  try {
    const rows = await cachedRows();
    return new Map(rows.map((row) => [row.slug, Number(row.count)]));
  } catch (error) {
    console.error('Failed to load view counts:', error);
    return null;
  }
}

export async function getViewCount(slug: string): Promise<ViewCount> {
  const counts = await readCounts();
  return counts ? (counts.get(slug) ?? 0) : null;
}

export async function getViewCounts(
  slugs: string[],
): Promise<Map<string, ViewCount>> {
  const counts = await readCounts();
  return new Map(
    slugs.map((slug) => [slug, counts ? (counts.get(slug) ?? 0) : null]),
  );
}

/**
 * Writes are not cached and not batched: one visit, one statement. Failures are
 * reported rather than thrown so the route can answer without a try/catch of
 * its own.
 */
export async function recordView(
  slug: string,
): Promise<'recorded' | 'unavailable'> {
  if (!process.env.DATABASE_URL) {
    return 'unavailable';
  }

  try {
    await sql`
      INSERT INTO views (slug, count)
      VALUES (${slug}, 1)
      ON CONFLICT (slug)
      DO UPDATE SET count = views.count + 1
    `;
    return 'recorded';
  } catch (error) {
    console.error('Failed to increment view count:', error);
    return 'unavailable';
  }
}
