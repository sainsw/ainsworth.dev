import { describe, expect, it, vi } from 'vitest';

const posts = [
  {
    slug: 'second',
    metadata: {
      title: 'Second & last',
      publishedAt: '2024-02-02',
      updatedAt: '2026-08-25',
      summary: 'A summary with <angles> and "quotes"',
    },
    content: '<p>Body of the second post.</p><script>evil()</script>',
  },
  {
    slug: 'hello-world',
    metadata: {
      title: 'Hello World',
      publishedAt: '2024-01-01',
      summary: 'A first post',
    },
    content: '<h2>Heading</h2><p>Body &amp; more.</p>',
  },
];

function mockPosts() {
  vi.doMock('@/lib/content/blog', async () => {
    const actual =
      await vi.importActual<typeof import('@/lib/content/blog')>(
        '@/lib/content/blog',
      );
    return { ...actual, getBlogPosts: vi.fn(() => posts) };
  });
}

describe('/rss.xml', () => {
  it('emits a valid channel with an item per post, newest first', async () => {
    vi.resetModules();
    mockPosts();
    const { GET } = await import('@/app/rss.xml/route');
    const res = await GET();
    const xml = await res.text();

    expect(res.headers.get('Content-Type')).toContain('application/rss+xml');
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain(
      '<link>https://ainsworth.dev/blog/hello-world</link>',
    );
    expect(xml.match(/<item>/g)).toHaveLength(2);

    // sortByPublishedAt is newest first, and the feed must not reorder it.
    expect(xml.indexOf('/blog/second')).toBeLessThan(
      xml.indexOf('/blog/hello-world'),
    );
  });

  it('escapes ampersands and angle brackets exactly once', async () => {
    vi.resetModules();
    mockPosts();
    const { GET } = await import('@/app/rss.xml/route');
    const xml = await (await GET()).text();

    expect(xml).toContain('<title>Second &amp; last</title>');
    // The killer bug in hand-rolled escaping: & replaced last, so the entities
    // written by the other replacements get re-escaped into &amp;lt;.
    expect(xml).not.toContain('&amp;lt;');
    expect(xml).toContain('&lt;angles&gt;');
  });

  it('dates an updated post by its revision, not its publication', async () => {
    vi.resetModules();
    mockPosts();
    const { GET } = await import('@/app/rss.xml/route');
    const xml = await (await GET()).text();

    expect(xml).toContain(new Date('2026-08-25T00:00:00').toUTCString());
  });
});

describe('/llms-full.txt', () => {
  it('returns plain text with every post in full', async () => {
    vi.resetModules();
    mockPosts();
    const { GET } = await import('@/app/llms-full.txt/route');
    const res = await GET();
    const text = await res.text();

    expect(res.headers.get('Content-Type')).toContain('text/plain');
    expect(text).toContain('## Hello World');
    expect(text).toContain('## Second & last');
    expect(text).toContain('https://ainsworth.dev/blog/hello-world');
  });

  it('strips markup and scripts but keeps the prose', async () => {
    vi.resetModules();
    mockPosts();
    const { GET } = await import('@/app/llms-full.txt/route');
    const text = await (await GET()).text();

    expect(text).toContain('Body of the second post.');
    expect(text).not.toContain('evil()');
    expect(text).not.toContain('<p>');
    expect(text).not.toContain('<h2>');
    // Entities decode, and &amp; resolves last so it cannot double-decode.
    expect(text).toContain('Body & more.');
  });

  it('notes the revision date only for a post that has one', async () => {
    vi.resetModules();
    mockPosts();
    const { GET } = await import('@/app/llms-full.txt/route');
    const text = await (await GET()).text();

    expect(text).toContain('Last updated: August 25, 2026');
    expect(text.match(/Last updated:/g)).toHaveLength(1);
  });
});
