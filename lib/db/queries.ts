import 'server-only';
import { unstable_cache } from 'next/cache';
import { sql } from './postgres';

export const getViewsCount: () => Promise<{ slug: string; count: number }[]> =
  process.env.DATABASE_URL
    ? unstable_cache(
        () => sql`SELECT slug, count FROM views`,
        ['views-count'],
        // Aligned with the pages' ISR window (app/blog/*). A longer inner cache
        // would cap how fresh the count can be regardless of page revalidation.
        { revalidate: 60 },
      )
    : () => Promise.resolve([]);
