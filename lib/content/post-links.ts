import type { Metadata } from 'next';
import { fullName } from '@/lib/bio';
import type { BlogPost } from '@/lib/content/blog';
import { SITE_URL } from '@/lib/site';

/** Everything here needs is the slug and the metadata block, not the body. */
type LinkablePost = Pick<BlogPost, 'slug' | 'metadata'>;

export function postUrl(post: LinkablePost): string {
  return `${SITE_URL}/blog/${post.slug}`;
}

/**
 * A post's own image if it declared one, otherwise the card generated at
 * /api/og/<slug>. This rule is what the canonical tag, the OpenGraph block, the
 * Twitter card and the JSON-LD graph all have to agree on, so it lives here
 * rather than being restated at each of them.
 */
export function postSocialImage(post: LinkablePost): string {
  return post.metadata.image
    ? `${SITE_URL}${post.metadata.image}`
    : `${SITE_URL}/api/og/${post.slug}`;
}

export function postMetadata(post: LinkablePost): Metadata {
  const {
    title,
    publishedAt: publishedTime,
    updatedAt: modifiedTime,
    summary: description,
  } = post.metadata;
  const url = postUrl(post);
  const image = postSocialImage(post);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime,
      ...(modifiedTime ? { modifiedTime } : {}),
      url,
      images: [{ url: image, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

export function postJsonLd(post: LinkablePost) {
  const url = postUrl(post);

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.metadata.title,
    datePublished: post.metadata.publishedAt,
    // Falls back to the publish date, which is what this always used to be.
    // A post that declares `updatedAt` now reports the revision instead.
    dateModified: post.metadata.updatedAt ?? post.metadata.publishedAt,
    description: post.metadata.summary,
    image: postSocialImage(post),
    url,
    // Ties the schema to the page it describes. Without it the graph asserts a
    // BlogPosting exists but never says this page is it.
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    author: { '@type': 'Person', '@id': `${SITE_URL}/#person`, name: fullName },
    publisher: { '@id': `${SITE_URL}/#person` },
  };
}

/**
 * The blog index as a `Blog` node listing its posts. Lets a retrieval system
 * see what the archive holds without crawling every post URL.
 */
export function blogIndexJsonLd(posts: LinkablePost[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': `${SITE_URL}/blog#blog`,
    url: `${SITE_URL}/blog`,
    name: `${fullName} - Blog`,
    description:
      'Notes on software development, side projects, and the things I learn building them.',
    inLanguage: 'en-GB',
    publisher: { '@id': `${SITE_URL}/#person` },
    // Same recommended fields as the standalone BlogPosting on each post page.
    // These entries were thinner than their per-post counterparts, which is
    // exactly the drift postJsonLd exists to avoid.
    blogPost: posts.map((post) => {
      const url = postUrl(post);
      return {
        '@type': 'BlogPosting',
        headline: post.metadata.title,
        datePublished: post.metadata.publishedAt,
        dateModified: post.metadata.updatedAt ?? post.metadata.publishedAt,
        description: post.metadata.summary,
        image: postSocialImage(post),
        url,
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        author: { '@id': `${SITE_URL}/#person` },
        publisher: { '@id': `${SITE_URL}/#person` },
      };
    }),
  };
}

/**
 * A BreadcrumbList rooted at the homepage.
 *
 * Pass the trail below Home, nearest-last:
 *   breadcrumbJsonLd([{ name: 'Blog', path: '/blog' }])
 *   breadcrumbJsonLd([{ name: 'Blog', path: '/blog' }, { name: title, path: `/blog/${slug}` }])
 */
export function breadcrumbJsonLd(trail: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [{ name: 'Home', path: '' }, ...trail].map(
      (crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.name,
        item: `${SITE_URL}${crumb.path}`,
      }),
    ),
  };
}
