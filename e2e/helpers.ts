import type { BrowserContext } from '@playwright/test';
import { getBlogPosts } from '@/lib/content/blog';
import { AVATAR_VERSION, CV_VERSION } from '@/lib/version';

/** Every page route the site serves, in nav order. */
export const PAGE_ROUTES = [
  '/',
  '/work',
  '/blog',
  '/contact',
  '/privacy',
] as const;

/**
 * Navbar entries, in render order — mirrors navItems in components/nav.tsx.
 * `heading` is the destination's own h1/h2, used to confirm a navigation has
 * actually landed rather than waiting on the network.
 */
export const NAV_ITEMS = [
  { name: 'home', path: '/', heading: /hello, i'm sam/i },
  { name: 'work', path: '/work', heading: /skills & technologies/i },
  { name: 'blog', path: '/blog', heading: /read my blog/i },
  { name: 'contact', path: '/contact', heading: /get in touch/i },
] as const;

/**
 * Settles after a client-side navigation without using `networkidle`, which
 * never fires against the deployed site — the analytics beacons keep the
 * connection busy indefinitely.
 */
export const SETTLE_MS = 1500;

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

/** Content-hashed assets, which must be cached immutably for a year. */
export const IMMUTABLE_ASSETS = [
  `/files/cv-${CV_VERSION}.pdf`,
  `/images/home/avatar-${AVATAR_VERSION}.webp`,
  `/images/home/avatar-${AVATAR_VERSION}.jpg`,
  '/fonts/kaisei-tokumin-bold.ttf',
] as const;

/** Unversioned assets, which must revalidate daily. */
export const REVALIDATED_ASSETS = [
  '/sprite.svg',
  '/images/logos/asfc.svg',
  '/files/cv.pdf',
] as const;

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
 * Stops components/view-tracker.tsx writing a view for every post the suite
 * opens. Without this a run against a deployment inflates the real counters by
 * one per post per test — the counts are aggregate and cannot be undone.
 * Only e2e/view-tracking.spec.ts, which asserts the tracker itself, skips it.
 */
export async function blockViewTracking(context: BrowserContext) {
  await context.route('**/api/views/**', (route) => route.abort());
}

/** The standard per-test setup: quiet banner, no writes to real view counts. */
export async function prepareContext(
  context: BrowserContext,
  baseURL: string | undefined,
) {
  await suppressCookieBanner(context, baseURL ?? '');
  await blockViewTracking(context);
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
