import { describe, expect, it } from 'vitest';

// The blog pages show a live view count. They must render as ISR, not fully
// static: without `export const revalidate` the count freezes at build time and
// only moves on redeploy. That is exactly what happened after 82a42fd removed
// `connection()` (to fix bfcache) without adding a revalidate window, and it is
// invisible from the outside because the page still returns real, non-zero —
// just stale — numbers. These assertions fail if the export is dropped again.

describe('blog pages opt into ISR so view counts are not frozen', () => {
  it('the blog index declares a finite revalidate window', async () => {
    const mod = await import('../app/blog/page');
    expect(typeof mod.revalidate, 'export const revalidate').toBe('number');
    expect(mod.revalidate).toBeGreaterThan(0);
    expect(Number.isFinite(mod.revalidate as number)).toBe(true);
  });

  it('a blog post declares a finite revalidate window', async () => {
    const mod = await import('../app/blog/[slug]/page');
    expect(typeof mod.revalidate, 'export const revalidate').toBe('number');
    expect(mod.revalidate).toBeGreaterThan(0);
    expect(Number.isFinite(mod.revalidate as number)).toBe(true);
  });
});
