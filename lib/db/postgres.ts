import 'server-only';
import postgres from 'postgres';

// lib/views.ts guards on DATABASE_URL before issuing any query, so an empty
// string here is never actually connected to.
export const sql = postgres(process.env.DATABASE_URL ?? '', {
  ssl: 'require',
});
