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

function mockPosts(list: typeof posts = posts) {
  vi.doMock('@/lib/content/blog', async () => {
    const actual =
      await vi.importActual<typeof import('@/lib/content/blog')>(
        '@/lib/content/blog',
      );
    return { ...actual, getBlogPosts: vi.fn(() => list) };
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

  it('fences a code block and keeps its indentation', async () => {
    vi.resetModules();
    mockPosts([
      {
        slug: 'coded',
        metadata: {
          title: 'Coded',
          publishedAt: '2024-04-04',
          summary: 'Has a code block',
        },
        content:
          '<p>Before.</p><pre><code class="language-json">{\n  "a": {\n    "b": 1\n  }\n}</code></pre><p>After.</p>',
      },
    ] as typeof posts);
    const { GET } = await import('@/app/llms-full.txt/route');
    const text = await (await GET()).text();

    // Nothing used to say where a code block started or stopped, and the
    // prose cleanup flattened every line in it to column zero.
    expect(text).toContain('```json\n{\n  "a": {\n    "b": 1\n  }\n}\n```');
    expect(text).toContain('Before.');
    expect(text).toContain('After.');
  });

  it('ships a diagram as its mermaid source, indentation intact', async () => {
    vi.resetModules();
    mockPosts([
      {
        slug: 'drawn',
        metadata: {
          title: 'Drawn',
          publishedAt: '2024-05-05',
          summary: 'Has a diagram',
        },
        content:
          '<pre><code class="language-mermaid">flowchart TD\n    A[Start] --> B[End]</code></pre>',
      },
    ] as typeof posts);
    const { GET } = await import('@/app/llms-full.txt/route');
    const text = await (await GET()).text();

    expect(text).toContain(
      '```mermaid\nflowchart TD\n    A[Start] --> B[End]\n```',
    );
  });

  it('decodes numeric escapes as well as named ones', async () => {
    vi.resetModules();
    mockPosts([
      {
        slug: 'escaped',
        metadata: {
          title: 'Escaped',
          publishedAt: '2024-06-06',
          summary: 'Has hex entities',
        },
        content:
          '<pre><code class="language-ts">const a = `x&#x26;y`;\nif (a &#x3C; b) {}</code></pre><p>Prose with &#x60;ticks&#x60; too.</p>',
      },
    ] as typeof posts);
    const { GET } = await import('@/app/llms-full.txt/route');
    const text = await (await GET()).text();

    expect(text).toContain('const a = `x&y`;');
    expect(text).toContain('if (a < b) {}');
    expect(text).toContain('Prose with `ticks` too.');
    expect(text).not.toContain('&#x');
  });

  it('leaves an escaped entity escaped', async () => {
    vi.resetModules();
    mockPosts([
      {
        slug: 'double',
        metadata: {
          title: 'Double',
          publishedAt: '2024-07-07',
          summary: 'Writes an entity as text',
        },
        content: '<p>Write it as &amp;lt; in the source.</p>',
      },
    ] as typeof posts);
    const { GET } = await import('@/app/llms-full.txt/route');
    const text = await (await GET()).text();

    // & resolves last, so this stays the literal text `&lt;` instead of
    // decoding a second time into `<`.
    expect(text).toContain('Write it as &lt; in the source.');
  });
});

describe('/llms.txt', () => {
  it('is llmstxt.org v2: an H1, a blockquote, then H2 link lists', async () => {
    vi.resetModules();
    mockPosts();
    const { GET } = await import('@/app/llms.txt/route');
    const res = await GET();
    const text = await res.text();

    expect(res.headers.get('Content-Type')).toContain('text/plain');
    expect(text.startsWith('# ainsworth.dev\n')).toBe(true);
    expect(text).toContain('\n> Personal site of Sam Ainsworth');
    expect(text).toContain('\n## Posts\n');
  });

  it('writes every list item as a markdown link', async () => {
    vi.resetModules();
    mockPosts();
    const { GET } = await import('@/app/llms.txt/route');
    const text = await (await GET()).text();

    // The bug that started this: bare `- Name: https://...` entries left a
    // parser looking for [text](url) with no links in the whole file.
    const items = text.split('\n').filter((line) => line.startsWith('- '));
    expect(items.length).toBeGreaterThan(0);
    for (const item of items) {
      expect(item).toMatch(/^- \[[^\]]+\]\(https:\/\/[^)]+\)/);
    }
  });

  it('lists a link per post, newest first, dated', async () => {
    vi.resetModules();
    mockPosts();
    const { GET } = await import('@/app/llms.txt/route');
    const text = await (await GET()).text();

    expect(text).toContain(
      '- [Hello World](https://ainsworth.dev/blog/hello-world): A first post Published January 1, 2024.',
    );
    expect(text.indexOf('/blog/second')).toBeLessThan(
      text.indexOf('/blog/hello-world'),
    );
    // Only the post carrying updatedAt says it was revised.
    expect(text).toContain(', updated August 25, 2026.');
    expect(text.match(/, updated /g)).toHaveLength(1);
  });

  it('survives a title with brackets and a summary across lines', async () => {
    vi.resetModules();
    mockPosts([
      {
        slug: 'awkward',
        metadata: {
          title: 'A [bracketed] title',
          publishedAt: '2024-03-03',
          summary: 'Wrapped\nacross   lines',
        },
        content: '<p>Body.</p>',
      },
    ] as typeof posts);
    const { GET } = await import('@/app/llms.txt/route');
    const text = await (await GET()).text();

    // An unescaped ] would close the link text early and the URL would render
    // as prose; a raw newline would end the list item mid-summary.
    expect(text).toContain(
      '- [A \\[bracketed\\] title](https://ainsworth.dev/blog/awkward): Wrapped across lines Published March 3, 2024.',
    );
  });
});
