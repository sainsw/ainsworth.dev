'use server';

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

export async function getGuestbookEntries() {
  if (!process.env.DATABASE_URL) {
    return [];
  }

  await connection();
  return sql`
    SELECT id, body, created_by, updated_at
    FROM guestbook
    ORDER BY created_at DESC
    LIMIT 100
  `;
}
