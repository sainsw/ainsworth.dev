import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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

  it('accept() calls zaraz.consent.granted()', () => {
    const granted = vi.fn();
    window.zaraz = { consent: { granted, revoked: vi.fn() }, track: vi.fn() };
    accept();
    expect(granted).toHaveBeenCalled();
    window.zaraz = undefined;
  });

  it('decline() calls zaraz.consent.revoked()', () => {
    const revoked = vi.fn();
    window.zaraz = { consent: { granted: vi.fn(), revoked }, track: vi.fn() };
    decline();
    expect(revoked).toHaveBeenCalled();
    window.zaraz = undefined;
  });
});
