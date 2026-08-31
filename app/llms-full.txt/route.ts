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
 * wants the prose, so prose comes out stripped to text. Code blocks do not:
 * they keep their language, their fence and their indentation, because
 * flattening a yaml sample to column zero loses the only structure it has.
 * Diagrams ride along inside that rule. They are mermaid in the source, and
 * mermaid is a compact, readable description of a picture, so it ships as a
 * ```mermaid fence rather than being dropped.
 */

/** The block shape components/blog-content.tsx highlights and renders. */
const CODE_BLOCK =
  /<pre><code class="language-(\w+)">([\s\S]*?)<\/code><\/pre>/g;

const NAMED_ENTITIES: Record<string, string> = {
  nbsp: ' ',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
};

/**
 * Named and numeric escapes both, because the posts carry `&#x3C;`, `&#x26;`
 * and `&#x60;` alongside the named ones, and an undecoded `&#x26;` in the
 * middle of a code sample is worse than useless to a reader.
 */
function decodeEntities(value: string): string {
  return (
    value
      .replace(
        /&(nbsp|lt|gt|quot|apos);/g,
        (match, name: string) => NAMED_ENTITIES[name] ?? match,
      )
      .replace(/&#(x[0-9a-fA-F]+|\d+);/g, (match, code: string) => {
        const point =
          code[0] === 'x' || code[0] === 'X'
            ? Number.parseInt(code.slice(1), 16)
            : Number.parseInt(code, 10);
        // 38 is the ampersand, held back for the pass below. Anything out of
        // range would throw, so it stays as it was written.
        if (point === 38 || !(point >= 0 && point <= 0x10ffff)) return match;
        return String.fromCodePoint(point);
      })
      // Last, so `&amp;lt;` decodes to the text `&lt;` rather than being
      // re-decoded into `<`.
      .replace(/&amp;|&#38;|&#x26;/gi, '&')
  );
}

/** Tags out, then entities, then the whitespace a reader will not miss. */
function proseToText(html: string): string {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(
        /<\/(?:p|div|section|article|li|tr|h[1-6]|pre|blockquote)>/gi,
        '\n',
      )
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, ''),
  )
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .split('\n')
    .map((line) => line.trim())
    .join('\n')
    .trim();
}

/** Fenced and left alone: no space collapsing, no per-line trim. */
function codeToText(lang: string, code: string): string {
  const body = decodeEntities(code).replace(/^\n+/, '').replace(/\s+$/, '');
  return `\`\`\`${lang}\n${body}\n\`\`\``;
}

function htmlToText(html: string): string {
  const parts: string[] = [];
  let lastIndex = 0;

  for (const match of html.matchAll(CODE_BLOCK)) {
    const index = match.index ?? 0;
    parts.push(proseToText(html.slice(lastIndex, index)));
    parts.push(codeToText(match[1], match[2]));
    lastIndex = index + match[0].length;
  }
  parts.push(proseToText(html.slice(lastIndex)));

  return parts.filter(Boolean).join('\n\n');
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

Code is fenced with its language. A \`\`\`mermaid fence is a diagram: the post
renders it as a picture, and the source is the description of that picture.

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
