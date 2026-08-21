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
      url,
      images: [{ url: image }],
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
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.metadata.title,
    datePublished: post.metadata.publishedAt,
    dateModified: post.metadata.publishedAt,
    description: post.metadata.summary,
    image: postSocialImage(post),
    url: postUrl(post),
    author: {
      '@type': 'Person',
      name: fullName,
    },
  };
}
