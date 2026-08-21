import 'server-only';
import { cacheLife } from 'next/cache';
import { sql } from '@/lib/db/postgres';

export type ViewRow = { slug: string; count: number };

/**
 * How stale a view count is allowed to get. This used to be
 * `export const revalidate = 60` on both blog routes, but `cacheComponents`
 * rejects that route-segment config outright, so the window now lives here: at
 * the one boundary in the codebase that actually caches anything.
 */
export const CACHE_WINDOW_SECONDS = 60;

/**
 * The cache boundary for view counts, in its own module so that the boundary is
 * a file edge rather than a directive buried inside a longer function.
 *
 * `lib/views.ts` wraps its call to this in a try/catch, and that placement is
 * load-bearing: a rejection thrown out through `use cache` is not stored, so
 * the next request retries. Keeping the boundary visible in the import graph is
 * what lets the tests fake it as "resolutions cached, rejections not".
 *
 * The stale and expire values are Next's built-in `'minutes'` profile, written
 * out rather than named so the revalidate window is readable from here.
 */
export async function readViewRows(): Promise<ViewRow[]> {
  'use cache';
  cacheLife({
    stale: 300,
    revalidate: CACHE_WINDOW_SECONDS,
    expire: 3600,
  });

  const rows = await sql<
    { slug: string; count: number }[]
  >`SELECT slug, count FROM views`;
  return rows.map((row) => ({ slug: row.slug, count: Number(row.count) }));
}
