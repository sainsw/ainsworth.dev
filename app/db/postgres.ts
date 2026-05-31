import 'server-only';
import postgres from 'postgres';

// Callers guard on DATABASE_URL before issuing queries (see db/queries.ts and
// db/actions.ts), so an empty string here is never actually connected to.
export const sql = postgres(process.env.DATABASE_URL ?? '', {
  ssl: 'require',
});
