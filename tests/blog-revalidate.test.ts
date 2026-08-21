import { describe, expect, it } from 'vitest';
import nextConfig from '../next.config';

// The blog pages show a live view count, and it must not freeze at build time.
// That used to be guaranteed by `export const revalidate = 60` on both routes.
// It is not any more: `cacheComponents` rejects that route-segment config, so
// the window now comes from `cacheLife` inside lib/views-cache.ts, which
// tests/views-cache.test.ts pins at 60 seconds.
//
// What that leaves exposed is the config itself. Turn `cacheComponents` off and
// the build stops erroring, the routes go back to being plain static pages with
// no revalidate window anywhere, and the counts quietly freeze again — the exact
// regression 82a42fd caused, invisible from the outside because the page still
// returns real, non-zero, just stale numbers.

describe('the blog view counts cannot silently freeze', () => {
  it('keeps cacheComponents on, which is what gives the counts a window', () => {
    expect(nextConfig.cacheComponents).toBe(true);
  });

  it('does not use experimental.cacheComponents, which is deprecated', () => {
    expect(
      (nextConfig.experimental as Record<string, unknown> | undefined)
        ?.cacheComponents,
    ).toBeUndefined();
  });

  it('the blog index declares no route-segment revalidate', async () => {
    const mod = await import('../app/blog/page');
    // `cacheComponents` fails the build on this, so a re-added export is caught
    // long before here. The assertion is about intent: freshness belongs to the
    // read now, not the route.
    expect(mod).not.toHaveProperty('revalidate');
  });

  it('a blog post declares no route-segment revalidate', async () => {
    const mod = await import('../app/blog/[slug]/page');
    expect(mod).not.toHaveProperty('revalidate');
  });
});
