import fs from 'node:fs';
import path from 'node:path';
import { parseHTML } from 'linkedom';
import { highlight } from 'sugar-high';
import {
  DIAGRAM_DIR,
  decodeEntities,
  diagramHash,
  MERMAID_BLOCK_SOURCE,
} from '@/lib/content/mermaid.mjs';
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
  const { document } = parseHTML(`<div id="blog-content-root">${html}</div>`);
  const root = document.querySelector('#blog-content-root');
  if (!root) {
    return html;
  }

  const usedIds = new Set<string>();
  for (const heading of Array.from(
    root.querySelectorAll('h1, h2, h3, h4, h5, h6'),
  )) {
    const baseId = heading.id || slugify(heading.textContent) || 'section';
    let id = baseId;
    let duplicateIndex = 2;
    while (usedIds.has(id)) {
      id = `${baseId}-${duplicateIndex}`;
      duplicateIndex += 1;
    }
    usedIds.add(id);
    heading.id = id;

    if (!heading.querySelector(':scope > a.anchor')) {
      const anchor = document.createElement('a');
      anchor.setAttribute('href', `#${id}`);
      anchor.setAttribute('class', 'anchor');
      heading.prepend(anchor);
    }
  }

  return root.innerHTML;
}

const diagramCache = new Map<string, string>();

/**
 * Diagrams are drawn once by scripts/render-mermaid.mjs and committed, so a
 * post ships the finished SVG rather than the ~196KB of mermaid it used to
 * take to draw it in the reader's browser.
 *
 * A missing file means someone edited a chart without re-running the renderer.
 * That has to fail the build: falling back to an empty box would ship a post
 * with a hole in it, and there is no longer a client renderer to cover for it.
 */
function loadDiagram(chart: string): string {
  const hash = diagramHash(chart);
  const cached = diagramCache.get(hash);
  if (cached) return cached;

  const file = path.join(process.cwd(), DIAGRAM_DIR, `${hash}.svg`);
  let svg: string;
  try {
    svg = fs.readFileSync(file, 'utf8');
  } catch {
    throw new Error(
      `No pre-rendered diagram for chart ${hash}.\n` +
        `Run \`npm run render-diagrams\` and commit ${DIAGRAM_DIR}/.`,
    );
  }

  diagramCache.set(hash, svg);
  return svg;
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
  const pattern = new RegExp(
    `${MERMAID_BLOCK_SOURCE}|<avatar-demo><\\/avatar-demo>`,
    'g',
  );
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
            return (
              <div key={i} className="my-6">
                {/* The SVG carries its own viewBox and width:100%/height:auto,
                    so it takes its final height on the first layout pass. */}
                <div
                  className="mermaid-diagram flex justify-center"
                  data-testid="mermaid"
                  data-chart={segment.chart}
                  dangerouslySetInnerHTML={{
                    __html: loadDiagram(segment.chart),
                  }}
                />
              </div>
            );
          case 'avatar-demo':
            return <AvatarDemo key={i} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
