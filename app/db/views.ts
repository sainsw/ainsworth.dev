import { sql } from './postgres';

export async function incrementView(slug: string) {
  if (!process.env.DATABASE_URL) {
    return;
  }

  await sql`
    INSERT INTO views (slug, count)
    VALUES (${slug}, 1)
    ON CONFLICT (slug)
    DO UPDATE SET count = views.count + 1
  `;
}
