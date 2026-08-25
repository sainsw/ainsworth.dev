import { describe, expect, it } from 'vitest';
import nextConfig from '../next.config';

describe('next config security headers', () => {
  it('applies a hardened CSP and referrer policy site-wide', async () => {
    expect(nextConfig.headers).toBeTypeOf('function');

    const rules = await nextConfig.headers?.();
    const siteWideRule = rules?.find((rule) => rule.source === '/(.*)');
    const headers = new Map(
      siteWideRule?.headers.map(({ key, value }) => [key, value]),
    );
    const csp = headers.get('Content-Security-Policy');

    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain("form-action 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).not.toContain('codesandbox.io');
    expect(headers.get('Referrer-Policy')).toBe(
      'strict-origin-when-cross-origin',
    );
  });

  it('declares content signals under the spec name, including ai-input', async () => {
    const rules = await nextConfig.headers?.();
    const siteWideRule = rules?.find((rule) => rule.source === '/(.*)');
    const headers = new Map(
      siteWideRule?.headers.map(({ key, value }) => [key, value]),
    );

    // Singular. The plural spelling matched no spec and signalled nothing.
    expect(headers.has('Content-Signals')).toBe(false);

    const signal = headers.get('Content-Signal');
    // ai-input is the signal that governs citation; omitting it reads as
    // "no preference expressed", not as consent.
    expect(signal).toContain('ai-input=yes');
    expect(signal).toContain('ai-train=no');
    expect(signal).toContain('search=yes');
  });
});
