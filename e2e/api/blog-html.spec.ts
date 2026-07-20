import { expect, test } from '@playwright/test';
import { POSTS } from '../helpers';

// Sweeps the served HTML of every post so a metadata regression cannot hide in
// the one post nobody opens. Rendering behaviour is covered in the browser
// specs against a representative few.

const SITE = 'https://ainsworth.dev';

const decode = (s: string) =>
  s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'");

const meta = (html: string, attr: 'property' | 'name', key: string) =>
  html.match(new RegExp(`<meta ${attr}="${key}" content="([^"]*)"`))?.[1] as
    | string
    | undefined;

for (const post of POSTS) {
  test(`post "${post.slug}" exposes complete metadata`, async ({ request }) => {
    const res = await request.get(`/blog/${post.slug}`);
    expect(res.status()).toBe(200);
    const html = await res.text();

    // Title and canonical
    const title = decode(html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '');
    expect(title).toBe(`${post.title} | Sam Ainsworth`);
    expect(html.match(/<link rel="canonical" href="([^"]*)"/)?.[1]).toBe(
      `${SITE}/blog/${post.slug}`,
    );

    // Description comes from the post summary, not the site-wide default.
    expect(decode(meta(html, 'name', 'description') ?? '')).toBe(post.summary);

    // OpenGraph
    expect(decode(meta(html, 'property', 'og:title') ?? '')).toBe(post.title);
    expect(meta(html, 'property', 'og:type')).toBe('article');
    expect(meta(html, 'property', 'og:url')).toBe(`${SITE}/blog/${post.slug}`);
    expect(meta(html, 'property', 'og:image')).toBe(
      `${SITE}/api/og/${post.slug}`,
    );
    expect(meta(html, 'property', 'article:published_time')).toBe(
      post.publishedAt,
    );

    // Twitter
    expect(meta(html, 'name', 'twitter:card')).toBe('summary_large_image');
    expect(decode(meta(html, 'name', 'twitter:title') ?? '')).toBe(post.title);

    // The visible title must match the metadata title.
    const h1 = decode(
      html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1].replace(/<[^>]*>/g, '') ??
        '',
    );
    expect(h1.trim()).toBe(post.title);
  });

  test(`post "${post.slug}" emits BlogPosting structured data`, async ({
    request,
  }) => {
    const html = await (await request.get(`/blog/${post.slug}`)).text();

    const blocks = [
      ...html.matchAll(
        /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g,
      ),
    ]
      .map((m) => {
        try {
          return JSON.parse(m[1]);
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    const posting = blocks.find((b) => b['@type'] === 'BlogPosting');
    expect(posting, 'BlogPosting block').toBeDefined();
    expect(posting.headline).toBe(post.title);
    expect(posting.description).toBe(post.summary);
    expect(posting.datePublished).toBe(post.publishedAt);
    expect(posting.url).toBe(`${SITE}/blog/${post.slug}`);
    expect(posting.image).toBe(`${SITE}/api/og/${post.slug}`);
    expect(posting.author?.name).toBe('Sam Ainsworth');
  });
}

test('the blog index links to every post, newest first', async ({
  request,
}) => {
  const html = await (await request.get('/blog')).text();

  const linked = [...html.matchAll(/href="\/blog\/([a-z0-9-]+)"/g)].map(
    (m) => m[1],
  );
  const seen = linked.filter((slug, i) => linked.indexOf(slug) === i);

  // POSTS is sorted newest-first, matching the sort in app/blog/page.tsx.
  expect(seen).toEqual(POSTS.map((p) => p.slug));
});

test('cross-links between posts all resolve', async ({ request }) => {
  // Posts link to each other by hand-written href; a renamed slug would
  // otherwise leave a 404 buried mid-article.
  const targets = new Set<string>();
  for (const post of POSTS) {
    for (const m of post.content.matchAll(/href="(\/[^"#]*)"/g)) {
      targets.add(m[1]);
    }
  }

  expect(targets.size).toBeGreaterThan(0);
  for (const target of targets) {
    expect((await request.get(target)).status(), target).toBe(200);
  }
});
