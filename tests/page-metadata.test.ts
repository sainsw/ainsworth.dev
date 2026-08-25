import { describe, expect, it } from 'vitest';
import { breadcrumbJsonLd } from '@/lib/content/post-links';
import { pageMetadata, SITE_OG_IMAGE } from '@/lib/page-metadata';

describe('pageMetadata', () => {
  const meta = pageMetadata({
    title: 'Work & Experience',
    description: 'Career history and skills.',
    path: '/work',
  });

  it('keeps canonical and og:url on the same URL', () => {
    // The bug this helper exists for: pages set only title/description, so
    // Next handed down the root layout's openGraph whole and og:url pointed at
    // the homepage while the canonical pointed at the page.
    expect(meta.alternates?.canonical).toBe('https://ainsworth.dev/work');
    expect(meta.openGraph?.url).toBe('https://ainsworth.dev/work');
  });

  it('carries the page title and description into openGraph, not the site ones', () => {
    expect(meta.openGraph?.title).toBe('Work & Experience');
    expect(meta.openGraph?.description).toBe('Career history and skills.');
  });

  it('always supplies a card image', () => {
    const images = meta.openGraph?.images as { url: string }[];
    expect(images[0].url).toBe(SITE_OG_IMAGE);
    expect(meta.twitter?.images).toContain(SITE_OG_IMAGE);
  });

  it('treats an empty path as the homepage', () => {
    const home = pageMetadata({ title: 'Home', description: 'x', path: '' });
    expect(home.alternates?.canonical).toBe('https://ainsworth.dev');
  });
});

describe('breadcrumbJsonLd', () => {
  it('roots every trail at the homepage', () => {
    const crumbs = breadcrumbJsonLd([{ name: 'Blog', path: '/blog' }]);

    expect(crumbs['@type']).toBe('BreadcrumbList');
    expect(crumbs.itemListElement).toHaveLength(2);
    expect(crumbs.itemListElement[0]).toMatchObject({
      position: 1,
      name: 'Home',
      item: 'https://ainsworth.dev',
    });
    expect(crumbs.itemListElement[1]).toMatchObject({
      position: 2,
      name: 'Blog',
      item: 'https://ainsworth.dev/blog',
    });
  });

  it('numbers a deeper trail in order', () => {
    const crumbs = breadcrumbJsonLd([
      { name: 'Blog', path: '/blog' },
      { name: 'A post', path: '/blog/a-post' },
    ]);

    expect(crumbs.itemListElement.map((c) => c.position)).toEqual([1, 2, 3]);
    expect(crumbs.itemListElement[2].item).toBe(
      'https://ainsworth.dev/blog/a-post',
    );
  });
});
