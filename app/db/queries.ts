import { sql } from './postgres';
import { connection } from 'next/server';

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
