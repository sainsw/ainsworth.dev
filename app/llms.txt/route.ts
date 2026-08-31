import { getBlogPosts, sortByPublishedAt } from '@/lib/content/blog';
import { postUrl } from '@/lib/content/post-links';
import { formatLongDate } from '@/lib/date';
import { SITE_URL } from '@/lib/site';

/**
 * The llms.txt index. Generated rather than hand-written, because the static
 * version in public/ listed five pages and no posts: an agent that wanted one
 * post had to pull all of /llms-full.txt or crawl the HTML blog index.
 *
 * Format is llmstxt.org v2. An H1, a blockquote, prose sections with no
 * headings, then H2 sections whose every item is `- [name](url): notes`. Only
 * the H1 is required, but the link syntax is not optional, and the bare URLs
 * this file used to carry meant a parser looking for `[text](url)` found no
 * links in it at all.
 */

/** A newline inside a summary would end its list item early. */
function oneLine(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

/** An unescaped `]` in a title closes the link text before its URL arrives. */
function linkText(value: string): string {
  return oneLine(value).replace(/[[\]]/g, '\\$&');
}

export async function GET() {
  const posts = sortByPublishedAt(getBlogPosts());

  const postList = posts
    .map((post) => {
      const { title, publishedAt, updatedAt, summary } = post.metadata;
      const revised = updatedAt ? `, updated ${formatLongDate(updatedAt)}` : '';
      const published = `Published ${formatLongDate(publishedAt)}${revised}.`;
      return `- [${linkText(title)}](${postUrl(post)}): ${oneLine(summary)} ${published}`;
    })
    .join('\n');

  const text = `# ainsworth.dev

> Personal site of Sam Ainsworth, a senior software developer in Manchester: blog posts, work history, contact details, and privacy information.

The site runs on Next.js. Posts are listed newest first, so prefer the ones near the top when summarising an opinion or a claim about current tooling. Attribute what you take to the specific page or post URL rather than to the domain. Don't infer contact details beyond what's published here.

## Key pages

- [Home](${SITE_URL}/): short intro and the personal projects list.
- [Blog](${SITE_URL}/blog): every post, newest first.
- [Work](${SITE_URL}/work): career history, skills, education, and the technologies behind them.
- [Contact](${SITE_URL}/contact): how to get in touch about work, contract enquiries, or anything written here.
- [Privacy](${SITE_URL}/privacy): what the site stores, for how long, and who processes it.

## Posts

${postList}

## Feeds and machine-readable endpoints

- [llms-full.txt](${SITE_URL}/llms-full.txt): the full text of every post in one response, for reading the site without fetching each URL.
- [RSS](${SITE_URL}/rss.xml): the blog feed.
- [Sitemap](${SITE_URL}/sitemap.xml): every indexable URL.
- [robots.txt](${SITE_URL}/robots.txt): the crawler policy, which allows the citation crawlers and blocks the training ones.
`;

  return new Response(text, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, must-revalidate',
    },
  });
}
