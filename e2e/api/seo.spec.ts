import { expect, test } from '@playwright/test';
import { PAGE_ROUTES, POSTS } from '../helpers';

const SITE = 'https://ainsworth.dev';

test('sitemap.xml lists every page route and every published post', async ({
  request,
}) => {
  const res = await request.get('/sitemap.xml');
  expect(res.status()).toBe(200);
  expect(res.headers()['content-type'] || '').toMatch(/xml/);

  const body = await res.text();
  for (const route of PAGE_ROUTES) {
    const path = route === '/' ? '' : route;
    expect(body, route).toContain(`<loc>${SITE}${path}</loc>`);
  }
  // app/sitemap.ts enumerates posts via getBlogPosts() — assert all of them,
  // so a post that fails to parse cannot silently drop out of the sitemap.
  for (const post of POSTS) {
    expect(body, post.slug).toContain(`<loc>${SITE}/blog/${post.slug}</loc>`);
  }
  // /uses was removed — regression guard
  expect(body).not.toContain('/uses</loc>');
});

test('sitemap entries all carry a lastModified date', async ({ request }) => {
  const body = await (await request.get('/sitemap.xml')).text();
  const urls = body.match(/<url>[\s\S]*?<\/url>/g) ?? [];

  expect(urls.length).toBe(PAGE_ROUTES.length + POSTS.length);
  for (const url of urls) {
    expect(url).toMatch(/<lastmod>\d{4}-\d{2}-\d{2}/);
  }
});

test('robots.txt points at the sitemap and allows crawling', async ({
  request,
}) => {
  const res = await request.get('/robots.txt');
  expect(res.status()).toBe(200);
  expect(res.headers()['content-type'] || '').toMatch(/text\/plain/);

  const body = await res.text();
  expect(body).toMatch(/User-Agent:\s*\*/i);
  expect(body).toContain(`Sitemap: ${SITE}/sitemap.xml`);
  expect(body).toContain(`Host: ${SITE}`);

  // No blanket disallow for general crawlers — the site is meant to be indexed.
  // Only the wildcard groups matter: in production Cloudflare prepends a
  // Managed robots.txt block that deliberately disallows named AI crawlers
  // (GPTBot, ClaudeBot, Amazonbot, ...), which must not fail this check.
  let wildcardGroup = false;
  for (const raw of body.split('\n')) {
    const line = raw.trim();
    if (/^user-agent:/i.test(line)) {
      wildcardGroup = line.split(':')[1].trim() === '*';
      continue;
    }
    if (wildcardGroup) {
      expect(line, 'blanket disallow under User-agent: *').not.toMatch(
        /^Disallow:\s*\/$/i,
      );
    }
  }
});

test('every page route is indexable and titled', async ({ request }) => {
  for (const route of PAGE_ROUTES) {
    const html = await (await request.get(route)).text();

    const title = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '';
    expect(title.length, `${route} <title>`).toBeGreaterThan(0);
    // Root layout applies the "%s | Sam Ainsworth" template to every child page.
    if (route !== '/') {
      expect(title, route).toContain('Sam Ainsworth');
    }

    const description = html.match(
      /<meta name="description" content="([^"]*)"/,
    )?.[1];
    expect(description?.length ?? 0, `${route} description`).toBeGreaterThan(0);

    // Google truncates around 160 chars — a regression guard on the dynamic
    // description built in app/layout.tsx.
    expect(description?.length ?? 0, `${route} description`).toBeLessThan(160);

    expect(html, `${route} robots`).not.toMatch(
      /<meta name="robots" content="[^"]*noindex/,
    );
  }
});

test('layout emits Person and WebSite structured data on every page', async ({
  request,
}) => {
  for (const route of PAGE_ROUTES) {
    const html = await (await request.get(route)).text();
    const blocks = [
      ...html.matchAll(
        /<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g,
      ),
    ].map((m) => JSON.parse(m[1]));

    const graph = blocks.find((b) => b['@graph'])?.['@graph'];
    expect(graph, `${route} @graph`).toBeDefined();

    const person = graph.find(
      (node: { '@type': string }) => node['@type'] === 'Person',
    );
    expect(person?.name, route).toBe('Sam Ainsworth');
    expect(person?.url, route).toBe(SITE);
    expect(person?.worksFor?.name, route).toBe('IBM');

    const website = graph.find(
      (node: { '@type': string }) => node['@type'] === 'WebSite',
    );
    expect(website?.url, route).toBe(SITE);
    expect(website?.inLanguage, route).toBe('en-GB');
  }
});
