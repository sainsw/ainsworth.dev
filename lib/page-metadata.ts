import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/site';

/** The card for every route that is not a blog post. */
export const SITE_OG_IMAGE = `${SITE_URL}/api/og`;

/**
 * Metadata for a static page.
 *
 * The counterpart to `postMetadata` in lib/content/post-links.ts, and it exists
 * for the same reason: the canonical, the OpenGraph block and the Twitter card
 * have to agree on the page's URL, title and description, and stating them
 * three times per route is how they drift.
 *
 * It also fixes a specific bug. Next inherits a parent `openGraph` block whole
 * rather than merging it field by field, so a page that set only
 * `title`/`description` kept the root layout's OpenGraph: every non-post page
 * advertised the site's title, the site's description, and `og:url` pointing at
 * the homepage while its own canonical pointed elsewhere.
 */
export function pageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  /** Route path with a leading slash, or '' for the homepage. */
  path: string;
}): Metadata {
  const url = `${SITE_URL}${path}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      type: 'website',
      url,
      siteName: 'Sam Ainsworth',
      locale: 'en_GB',
      images: [{ url: SITE_OG_IMAGE, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [SITE_OG_IMAGE],
    },
  };
}
