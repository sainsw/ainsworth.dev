import { describe, expect, it } from 'vitest';
import {
  postJsonLd,
  postMetadata,
  postSocialImage,
  postUrl,
} from '@/lib/content/post-links';

const plain = {
  slug: 'hello-world',
  metadata: {
    title: 'Hello World',
    publishedAt: '2024-01-15',
    summary: 'A first post',
  },
};

const withImage = {
  ...plain,
  slug: 'with-image',
  metadata: { ...plain.metadata, image: '/images/blog/cover.png' },
};

describe('postUrl', () => {
  it('is the canonical absolute URL for the post', () => {
    expect(postUrl(plain)).toBe('https://ainsworth.dev/blog/hello-world');
  });
});

describe('postSocialImage', () => {
  it('falls back to the generated card when the post declares no image', () => {
    expect(postSocialImage(plain)).toBe(
      'https://ainsworth.dev/api/og/hello-world',
    );
  });

  it("uses the post's own image when it has one", () => {
    expect(postSocialImage(withImage)).toBe(
      'https://ainsworth.dev/images/blog/cover.png',
    );
  });
});

describe('postMetadata', () => {
  it('carries the title and summary through', () => {
    const meta = postMetadata(plain);

    expect(meta.title).toBe('Hello World');
    expect(meta.description).toBe('A first post');
  });

  it('points the canonical, OpenGraph and Twitter blocks at one URL', () => {
    const meta = postMetadata(plain);
    const url = 'https://ainsworth.dev/blog/hello-world';

    expect(meta.alternates?.canonical).toBe(url);
    expect(meta.openGraph?.url).toBe(url);
  });

  it('uses the same social image in OpenGraph and Twitter', () => {
    const meta = postMetadata(withImage);
    const image = 'https://ainsworth.dev/images/blog/cover.png';

    expect((meta.openGraph?.images as { url: string }[])[0].url).toBe(image);
    expect((meta.twitter?.images as string[])[0]).toBe(image);
  });

  it('marks the post as an article with its publication date', () => {
    const openGraph = postMetadata(plain).openGraph as {
      type: string;
      publishedTime: string;
    };

    expect(openGraph.type).toBe('article');
    expect(openGraph.publishedTime).toBe('2024-01-15');
  });

  it('requests a large summary card', () => {
    expect((postMetadata(plain).twitter as { card: string }).card).toBe(
      'summary_large_image',
    );
  });
});

describe('postJsonLd', () => {
  it('describes the post as a BlogPosting', () => {
    const jsonLd = postJsonLd(plain);

    expect(jsonLd['@type']).toBe('BlogPosting');
    expect(jsonLd.headline).toBe('Hello World');
    expect(jsonLd.datePublished).toBe('2024-01-15');
  });

  it('agrees with the metadata block on URL and image', () => {
    // These used to be computed separately forty lines apart, and nothing
    // stopped them drifting.
    const jsonLd = postJsonLd(withImage);
    const meta = postMetadata(withImage);

    expect(jsonLd.url).toBe(meta.alternates?.canonical);
    expect(jsonLd.image).toBe(
      (meta.openGraph?.images as { url: string }[])[0].url,
    );
  });

  it('names the author', () => {
    expect(postJsonLd(plain).author.name).toBe('Sam Ainsworth');
  });
});

describe('generateMetadata', () => {
  it('delegates to postMetadata for a real post', async () => {
    const { generateMetadata } = await import('@/app/blog/[slug]/page');
    const { getBlogPosts } = await import('@/lib/content/blog');
    const post = getBlogPosts()[0];

    const meta = await generateMetadata({
      params: Promise.resolve({ slug: post.slug }),
    });

    expect(meta).toEqual(postMetadata(post));
  });

  it('returns nothing for a slug that is not a post', async () => {
    const { generateMetadata } = await import('@/app/blog/[slug]/page');

    const meta = await generateMetadata({
      params: Promise.resolve({ slug: 'not-a-post' }),
    });

    expect(meta).toBeUndefined();
  });
});
