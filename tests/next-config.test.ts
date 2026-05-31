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
});
