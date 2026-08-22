#!/usr/bin/env node
// Applies db/migrations/ to the database in DATABASE_URL. Used by CI to set up
// the throwaway postgres container the e2e suite writes to.
//
// Refuses to touch anything that is not on this machine. The migration is
// idempotent, but "idempotent" is not a good enough reason to let a mistyped
// environment point this at the real counter.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import postgres from 'postgres';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const MIGRATIONS = path.join(ROOT, 'db', 'migrations');
const LOCAL_HOSTS = ['localhost', '127.0.0.1', '::1', '[::1]'];

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL is not set.');
  process.exit(1);
}

let hostname;
try {
  ({ hostname } = new URL(url));
} catch {
  console.error('DATABASE_URL is not a URL.');
  process.exit(1);
}

if (!LOCAL_HOSTS.includes(hostname)) {
  console.error(
    `Refusing to migrate ${hostname}: this only runs against a local database.`,
  );
  process.exit(1);
}

const files = fs
  .readdirSync(MIGRATIONS)
  .filter((file) => path.extname(file) === '.sql')
  .sort();

const sql = postgres(url, { ssl: false });

try {
  for (const file of files) {
    await sql.unsafe(fs.readFileSync(path.join(MIGRATIONS, file), 'utf8'));
    console.log(`applied ${file}`);
  }
  console.log(`${files.length} migration(s) applied to ${hostname}.`);
} finally {
  await sql.end();
}
