import { describe, expect, it } from 'vitest';

describe('robots', () => {
  it('returns proper rules, sitemap and host', async () => {
    const robots = (await import('../app/robots')).default;
    const res = robots();
    expect(res.rules[0]).toEqual({ userAgent: '*', allow: '/' });
    expect(res.sitemap).toBe('https://ainsworth.dev/sitemap.xml');
    expect(res.host).toBe('https://ainsworth.dev');
  });

  /**
   * Cloudflare's managed blocklist covers the training crawlers. These are the
   * separate tokens that feed AI citation, and blocking them is what would
   * actually cost visibility, so an explicit allow is asserted rather than
   * assumed. See the comment in app/robots.ts for why they are restated here.
   */
  it('allows the crawlers that feed AI citation', async () => {
    const robots = (await import('../app/robots')).default;
    const allowed = robots()
      .rules.filter((rule) => rule.allow === '/')
      .map((rule) => rule.userAgent);

    for (const bot of [
      'Googlebot',
      'Bingbot',
      'OAI-SearchBot',
      'ChatGPT-User',
      'Claude-SearchBot',
      'Claude-User',
      'PerplexityBot',
      'Applebot',
    ]) {
      expect(allowed).toContain(bot);
    }
  });

  it('does not allow the training-only tokens Cloudflare blocks', async () => {
    const robots = (await import('../app/robots')).default;
    const named = robots().rules.map((rule) => rule.userAgent);

    // Allowing these here would override Cloudflare's managed Disallow.
    for (const bot of ['GPTBot', 'ClaudeBot', 'CCBot', 'Google-Extended']) {
      expect(named).not.toContain(bot);
    }
  });
});
