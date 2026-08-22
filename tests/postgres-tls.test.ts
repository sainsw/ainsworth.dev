import { describe, expect, it } from 'vitest';
import { requiresTls } from '@/lib/db/postgres';

describe('requiresTls', () => {
  it('requires TLS for a managed provider', () => {
    expect(requiresTls('postgres://user:pw@db.example.neon.tech/main')).toBe(
      true,
    );
  });

  it('does not require TLS for a container on the same host', () => {
    expect(
      requiresTls('postgres://postgres:postgres@localhost:5432/views_test'),
    ).toBe(false);
    expect(requiresTls('postgres://postgres@127.0.0.1:5432/views_test')).toBe(
      false,
    );
  });

  it('is not fooled by a hostname that merely contains localhost', () => {
    // The check is on the parsed hostname, not a substring of the URL.
    expect(requiresTls('postgres://user@localhost.example.com/db')).toBe(true);
    expect(requiresTls('postgres://user@notlocalhost/db')).toBe(true);
  });

  it('requires TLS when the URL cannot be parsed', () => {
    expect(requiresTls('not a url')).toBe(true);
  });

  it('is irrelevant when there is no database at all', () => {
    // Nothing is ever connected to, so this only avoids a pointless TLS demand.
    expect(requiresTls('')).toBe(false);
  });
});
