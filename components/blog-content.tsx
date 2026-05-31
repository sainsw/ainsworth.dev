import { highlight } from 'sugar-high';
import MermaidClient from './mermaid-client';
import { AvatarDemo } from './avatar-demo';

function slugify(str: string) {
  return str
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/&/g, '-and-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

function addHeadingAnchors(html: string): string {
  return html.replace(/<(h[1-6])>([\s\S]*?)<\/\1>/g, (_match, tag, content) => {
    const textContent = content.replace(/<[^>]+>/g, '');
    const slug = slugify(textContent);
    return `<${tag} id="${slug}"><a href="#${slug}" class="anchor"></a>${content}</${tag}>`;
  });
}

function decodeEntities(code: string): string {
  return code
    .replace(/&#x3C;/g, '<')
    .replace(/&lt;/g, '<')
    .replace(/&#x3E;/g, '>')
    .replace(/&gt;/g, '>')
    .replace(/&#x26;/g, '&')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function highlightCodeBlocks(html: string): string {
  return html.replace(
    /<pre><code class="language-(\w+)">([\s\S]*?)<\/code><\/pre>/g,
    (_match, lang, code) => {
      if (lang === 'mermaid') {
        return _match;
      }
      const highlighted = highlight(decodeEntities(code));
      return `<pre><code class="language-${lang}">${highlighted}</code></pre>`;
    },
  );
}

type Segment =
  | { type: 'html'; html: string }
  | { type: 'mermaid'; chart: string }
  | { type: 'avatar-demo' };

function splitContent(html: string): Segment[] {
  const pattern =
    /<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>|<avatar-demo><\/avatar-demo>/g;
  const segments: Segment[] = [];
  let lastIndex = 0;
  let match = pattern.exec(html);

  while (match !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'html', html: html.slice(lastIndex, match.index) });
    }

    if (match[0].startsWith('<pre><code')) {
      segments.push({ type: 'mermaid', chart: decodeEntities(match[1]) });
    } else {
      segments.push({ type: 'avatar-demo' });
    }

    lastIndex = match.index + match[0].length;
    match = pattern.exec(html);
  }

  if (lastIndex < html.length) {
    segments.push({ type: 'html', html: html.slice(lastIndex) });
  }

  return segments;
}

export function BlogContent({ source }: { source: string }) {
  let processed = addHeadingAnchors(source);
  processed = highlightCodeBlocks(processed);

  const segments = splitContent(processed);

  const hasOnlyHtml = segments.length === 1 && segments[0].type === 'html';
  if (hasOnlyHtml) {
    return <div dangerouslySetInnerHTML={{ __html: processed }} />;
  }

  return (
    <div>
      {segments.map((segment, i) => {
        switch (segment.type) {
          case 'html':
            return (
              <div key={i} dangerouslySetInnerHTML={{ __html: segment.html }} />
            );
          case 'mermaid':
            return <MermaidClient key={i} chart={segment.chart} />;
          case 'avatar-demo':
            return <AvatarDemo key={i} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
