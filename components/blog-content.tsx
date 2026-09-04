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
      // The anchor renders as a glyph with no text, so without a label a
      // screen reader announces it as an unnamed link, once per heading.
      anchor.setAttribute(
        'aria-label',
        `Permalink to “${heading.textContent?.trim() ?? id}”`,
      );
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

/** Names the language for the code block's accessible name. */
const LANGUAGE_NAMES: Record<string, string> = {
  bash: 'Shell',
  css: 'CSS',
  diff: 'Diff',
  html: 'HTML',
  js: 'JavaScript',
  json: 'JSON',
  jsx: 'JSX',
  latex: 'LaTeX',
  md: 'Markdown',
  py: 'Python',
  python: 'Python',
  sh: 'Shell',
  sql: 'SQL',
  swift: 'Swift',
  ts: 'TypeScript',
  tsx: 'TSX',
  txt: 'Text',
  yaml: 'YAML',
  yml: 'YAML',
};

function highlightCodeBlocks(html: string): string {
  return html.replace(
    /<pre><code class="language-(\w+)">([\s\S]*?)<\/code><\/pre>/g,
    (_match, lang, code) => {
      if (lang === 'mermaid') {
        return _match;
      }
      const highlighted = highlight(decodeEntities(code));
      // A long line makes the block scroll sideways, and a scrollable box with
      // nothing focusable inside it cannot be scrolled from the keyboard.
      // Chromium focuses such scrollers by itself; Firefox and Safari do not,
      // so the tabindex is what makes the rest of the line reachable there at
      // all. The role and label stop it landing as an unnamed stop.
      const label = LANGUAGE_NAMES[lang] ?? lang;
      return `<pre tabindex="0" role="group" aria-label="${label} code"><code class="language-${lang}">${highlighted}</code></pre>`;
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

/**
 * Mermaid gives the SVG `aria-roledescription="flowchart-v2"` and no name at
 * all, so a screen reader reached it as an unnamed document and then read the
 * node labels as a flat run of paragraphs with no hint of what they belonged
 * to. Naming the figure at least announces that a diagram starts here and lets
 * the reader skip it. It is not a text alternative: the diagrams still need a
 * written description each, and only their author can write one.
 */
function diagramLabel(ordinal: number) {
  return `Diagram ${ordinal}`;
}

export function BlogContent({ source }: { source: string }) {
  let processed = addHeadingAnchors(source);
  processed = highlightCodeBlocks(processed);

  const segments = splitContent(processed);

  const hasOnlyHtml = segments.length === 1 && segments[0].type === 'html';
  if (hasOnlyHtml) {
    return <div dangerouslySetInnerHTML={{ __html: processed }} />;
  }

  // Counts diagrams, not segments: the label has to match what a reader would
  // count down the page, and most segments are prose.
  let diagramOrdinal = 0;

  return (
    <div>
      {segments.map((segment, i) => {
        switch (segment.type) {
          case 'html':
            return (
              <div key={i} dangerouslySetInnerHTML={{ __html: segment.html }} />
            );
          case 'mermaid': {
            diagramOrdinal += 1;
            return (
              // `not-prose` keeps the typography plugin's own figure margins
              // off it, so naming the diagram does not move it.
              <figure
                key={i}
                className="my-6 not-prose"
                aria-label={diagramLabel(diagramOrdinal)}
              >
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
              </figure>
            );
          }
          case 'avatar-demo':
            return <AvatarDemo key={i} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
