import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { accept, decline, resetForTesting } from '@/lib/consent';

beforeEach(() => {
  resetForTesting();
  document.cookie =
    'cookie-consent=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
});

afterEach(() => {
  resetForTesting();
});

describe('consent module', () => {
  it('accept() sets the cookie to accepted', () => {
    accept();
    expect(document.cookie).toContain('cookie-consent=accepted');
  });

  it('decline() sets the cookie to declined', () => {
    decline();
    expect(document.cookie).toContain('cookie-consent=declined');
  });
});
