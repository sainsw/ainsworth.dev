import { fullName } from '@/lib/bio';
import { getBlogPosts, sortByPublishedAt } from '@/lib/content/blog';
import { postUrl } from '@/lib/content/post-links';
import { parsePostDate } from '@/lib/date';
import { SITE_URL } from '@/lib/site';

const FEED_TITLE = `${fullName} - Blog`;
const FEED_DESCRIPTION =
  'Notes on software development, side projects, and the things I learn building them.';

/** `&` first, or it re-escapes the ampersands the other replacements just wrote. */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const posts = sortByPublishedAt(getBlogPosts());

  const items = posts
    .map((post) => {
      const url = postUrl(post);
      const date = parsePostDate(
        post.metadata.updatedAt ?? post.metadata.publishedAt,
      );
      return `    <item>
      <title>${escapeXml(post.metadata.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(post.metadata.summary)}</description>
      <pubDate>${date.toUTCString()}</pubDate>
    </item>`;
    })
    .join('\n');

  // No lastBuildDate: it would be a wall-clock read in a cached response, and
  // it would change on every deploy whether or not a post did. The newest
  // post's date is the honest answer to "when did this feed last change".
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(FEED_TITLE)}</title>
    <link>${SITE_URL}/blog</link>
    <description>${escapeXml(FEED_DESCRIPTION)}</description>
    <language>en-GB</language>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, must-revalidate',
    },
  });
}
