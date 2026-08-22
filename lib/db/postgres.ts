import 'server-only';
import postgres from 'postgres';

/**
 * Managed providers terminate TLS and refuse a plaintext connection; a
 * throwaway postgres container on a CI runner offers none. Decided from the
 * host rather than a separate opt-out flag, so there is no switch that could be
 * left set and quietly drop TLS against the real database.
 */
export function requiresTls(url: string): boolean {
  if (!url) {
    return false;
  }

  try {
    const { hostname } = new URL(url);
    return !['localhost', '127.0.0.1', '::1', '[::1]'].includes(hostname);
  } catch {
    // An unparseable URL is not a reason to connect in the clear.
    return true;
  }
}

const url = process.env.DATABASE_URL ?? '';

// lib/views.ts guards on DATABASE_URL before issuing any query, so an empty
// string here is never actually connected to.
export const sql = postgres(url, {
  ssl: requiresTls(url) ? 'require' : false,
});
