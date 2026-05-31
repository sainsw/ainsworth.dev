import 'server-only';
import { connection } from 'next/server';
import { sql } from './postgres';

export async function getViewsCount(): Promise<
  { slug: string; count: number }[]
> {
  if (!process.env.DATABASE_URL) {
    return [];
  }

  await connection();
  return sql`
    SELECT slug, count
    FROM views
  `;
}
