import { getBlogPosts, sortByPublishedAt } from '@/lib/content/blog';
import { postUrl } from '@/lib/content/post-links';
import { formatLongDate } from '@/lib/date';
import { SITE_URL } from '@/lib/site';

/**
 * Every post's full text in one response, so an agent can read the site in a
 * single request instead of crawling fifteen URLs. Companion to /llms.txt,
 * which is the index: the same posts as links, with a summary each.
 *
 * Posts are authored as HTML, and the tags are noise to a model that only
 * wants the prose, so they come out stripped. Code blocks keep their content
 * (that is often the point of the post) but lose their markup like everything
 * else.
 */
function htmlToText(html: string): string {
  return (
    html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      // Diagrams are inlined SVG at render time; in source they are mermaid
      // fences, and neither is worth shipping as prose.
      .replace(/<svg[\s\S]*?<\/svg>/gi, '')
      .replace(
        /<\/(?:p|div|section|article|li|tr|h[1-6]|pre|blockquote)>/gi,
        '\n',
      )
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      // Last, so it cannot re-decode the entities above.
      .replace(/&amp;/g, '&')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .split('\n')
      .map((line) => line.trim())
      .join('\n')
      .trim()
  );
}

export async function GET() {
  const posts = sortByPublishedAt(getBlogPosts());

  const body = posts
    .map((post) => {
      const updated = post.metadata.updatedAt
        ? `\nLast updated: ${formatLongDate(post.metadata.updatedAt)}`
        : '';
      return `## ${post.metadata.title}

URL: ${postUrl(post)}
Published: ${formatLongDate(post.metadata.publishedAt)}${updated}
Summary: ${post.metadata.summary}

${htmlToText(post.content)}`;
    })
    .join('\n\n---\n\n');

  const text = `# ainsworth.dev - full content

Personal site of Sam Ainsworth. Every blog post below in full, newest first.
Index and key pages: ${SITE_URL}/llms.txt

When citing, attribute to the specific post URL rather than the domain.

---

${body}
`;

  return new Response(text, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, must-revalidate',
    },
  });
}
