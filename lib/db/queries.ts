import 'server-only';
import { unstable_cache } from 'next/cache';
import { sql } from './postgres';

export const getViewsCount: () => Promise<
  { slug: string; count: number }[]
> = process.env.DATABASE_URL
  ? unstable_cache(
      () => sql`SELECT slug, count FROM views`,
      ['views-count'],
      { revalidate: 300 },
    )
  : () => Promise.resolve([]);
