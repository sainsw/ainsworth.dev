import type { BrowserContext } from '@playwright/test';
import { getBlogPosts } from '@/lib/content/blog';

/** Every page route the site serves, in nav order. */
export const PAGE_ROUTES = [
  '/',
  '/work',
  '/blog',
  '/contact',
  '/privacy',
] as const;

/** Navbar entries, in render order — mirrors navItems in components/nav.tsx. */
export const NAV_ITEMS = [
  { name: 'home', path: '/' },
  { name: 'work', path: '/work' },
  { name: 'blog', path: '/blog' },
  { name: 'contact', path: '/contact' },
] as const;

/**
 * Posts read straight from content/ so the suite covers whatever is published
 * rather than a hand-maintained list that silently rots.
 */
export const POSTS = getBlogPosts()
  .map((post) => ({
    slug: post.slug,
    title: post.metadata.title,
    summary: post.metadata.summary,
    publishedAt: post.metadata.publishedAt,
    content: post.content,
  }))
  .sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );

/** Slugs whose posts exercise a specific custom renderer in blog-content.tsx. */
export const POSTS_WITH_MERMAID = POSTS.filter((p) =>
  p.content.includes('language-mermaid'),
).map((p) => p.slug);

export const POSTS_WITH_CODE = POSTS.filter((p) =>
  /language-(?!mermaid)\w+/.test(p.content),
).map((p) => p.slug);

/** A slug that is guaranteed never to exist, for negative-path assertions. */
export const MISSING_SLUG = 'definitely-not-a-real-post-xyz';

/**
 * /work is the one page with no <h1> — it opens at <h2>. Tracked as a known
 * gap so the heading-structure test stays strict everywhere else; adding an
 * <h1> to /work later will not break the test.
 */
export const ROUTES_WITHOUT_H1: readonly string[] = ['/work'];

/**
 * Pre-answers the cookie banner so it never covers the bottom-left of the page
 * mid-test. "declined" rather than "accepted" because accepting also boots
 * Vercel Analytics, whose network chatter would pollute the console specs.
 * Specs that assert on the banner itself must not call this.
 */
export async function suppressCookieBanner(
  context: BrowserContext,
  baseURL: string,
) {
  await context.addCookies([
    {
      name: 'cookie-consent',
      value: 'declined',
      url: baseURL,
      sameSite: 'Lax',
    },
  ]);
}

/**
 * Waits until React has hydrated the given element. React attaches
 * `__reactProps$…` / `__reactFiber$…` keys to a DOM node as it hydrates, so
 * their presence is a reliable signal that clicks will be handled by the client
 * router rather than falling through to a plain document navigation.
 */
export async function waitForHydration(
  page: import('@playwright/test').Page,
  selector: string,
) {
  await page.waitForFunction((sel) => {
    const el = document.querySelector(sel);
    return !!el && Object.keys(el).some((k) => k.startsWith('__react'));
  }, selector);
}

/** Site-wide security headers asserted on every route (see next.config.ts). */
export const SECURITY_HEADERS: Record<string, string | RegExp> = {
  'x-frame-options': 'DENY',
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'x-dns-prefetch-control': 'on',
  'permissions-policy': 'camera=(), microphone=(), geolocation=()',
  'content-signals': 'search=yes, ai-train=no',
  'strict-transport-security': /max-age=\d+.*includeSubDomains/i,
};
