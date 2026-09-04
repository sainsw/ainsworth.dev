import fs from 'node:fs';
import path from 'node:path';
import { parseHTML } from 'linkedom';
import { highlight } from 'sugar-high';
import {
  type DiagramGraph,
  type DiagramText,
  stepDomId,
  toDiagramText,
} from '@/lib/content/diagram-text';
import {
  DIAGRAM_DIR,
  decodeEntities,
  diagramGraphFile,
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

const graphCache = new Map<string, DiagramText>();

/**
 * The parsed graph beside the SVG. Missing is not fatal the way a missing SVG
 * is: the drawing still renders, it just has no text equivalent, and failing
 * the build over it would block a post on a file that only assistive
 * technology reads. The renderer writes both in the same pass, so it only
 * happens if one was deleted by hand.
 */
function loadDiagramText(chart: string): DiagramText {
  const hash = diagramHash(chart);
  const cached = graphCache.get(hash);
  if (cached) return cached;

  const file = path.join(process.cwd(), DIAGRAM_DIR, diagramGraphFile(hash));
  let text: DiagramText;
  try {
    text = toDiagramText(
      JSON.parse(fs.readFileSync(file, 'utf8')) as DiagramGraph,
    );
  } catch {
    text = { kind: 'none' };
  }

  graphCache.set(hash, text);
  return text;
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

/** One edge, as a link the reader can actually follow to the other node. */
function EdgeLink({
  hash,
  link,
  verb,
}: {
  hash: string;
  link: { id: string; label: string; edgeLabel: string; dashed: boolean };
  verb: 'Go to' | 'Reached from';
}) {
  return (
    <li>
      {verb} <a href={`#${stepDomId(hash, link.id)}`}>{link.label}</a>
      {link.edgeLabel ? `, when ${link.edgeLabel}` : null}
      {/* Reported, not interpreted. The line style is something the author
          drew and it distinguishes these edges from the others, but what it
          means is not in the source. */}
      {link.dashed ? ' (drawn as a dashed line)' : null}
    </li>
  );
}

/**
 * The walkable equivalent. In a <details> so it is available to everyone
 * rather than hidden behind a screen reader, which is what the W3C complex
 * images guidance asks for.
 */
function DiagramTextEquivalent({
  hash,
  ordinal,
  text,
}: {
  hash: string;
  ordinal: number;
  text: DiagramText;
}) {
  if (text.kind === 'none') return null;

  return (
    <details className="diagram-text">
      <summary>{`${diagramLabel(ordinal)} as text`}</summary>
      <p>{text.summary}</p>

      {text.kind === 'sequence' ? (
        <ol>
          {text.messages.map((message, i) => (
            <li key={`${message.from}-${message.to}-${i}`}>
              {`${message.from} to ${message.to}: ${message.text}`}
            </li>
          ))}
        </ol>
      ) : (
        <ul>
          {text.steps.map((step) => (
            <li key={step.id} id={stepDomId(hash, step.id)}>
              <p>
                {step.isDecision ? 'Decision: ' : null}
                {step.label}
                {step.group ? ` (inside ${step.group})` : null}
                {step.isStart ? ' (a starting point)' : null}
              </p>

              {/* Both directions in one list, so a screen reader announces a
                  single item count for the step rather than two. */}
              <ul>
                {step.outgoing.map((link) => (
                  <EdgeLink
                    key={`out-${link.id}-${link.edgeLabel}`}
                    hash={hash}
                    link={link}
                    verb="Go to"
                  />
                ))}
                {step.isEnd ? <li>Nothing leads out of this step.</li> : null}
                {step.incoming.map((link) => (
                  <EdgeLink
                    key={`in-${link.id}-${link.edgeLabel}`}
                    hash={hash}
                    link={link}
                    verb="Reached from"
                  />
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </details>
  );
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
            const label = diagramLabel(diagramOrdinal);
            return (
              // `not-prose` keeps the typography plugin's own figure margins
              // off it, so the drawing does not move. The figure is what
              // announces that a diagram is here; the details below it is what
              // a reader walks. No <figcaption>, because a figcaption becomes
              // the figure's accessible name and the whole equivalent would
              // have become the name.
              <figure key={i} className="my-6 not-prose" aria-label={label}>
                {/* Hidden outright rather than role="img": Chrome does not
                    prune the descendants of role="img" on an inline SVG, so
                    mermaid's labels stayed in the tree and were read as a
                    jumble ("Yes No No Yes Yes No, Page Load, ...") alongside
                    the equivalent. Everything the drawing conveys is in the
                    list below it.

                    The SVG carries its own viewBox and width:100%/height:auto,
                    so it takes its final height on the first layout pass. */}
                <div
                  className="mermaid-diagram flex justify-center"
                  aria-hidden="true"
                  data-testid="mermaid"
                  data-chart={segment.chart}
                  dangerouslySetInnerHTML={{
                    __html: loadDiagram(segment.chart),
                  }}
                />
                <DiagramTextEquivalent
                  hash={diagramHash(segment.chart)}
                  ordinal={diagramOrdinal}
                  text={loadDiagramText(segment.chart)}
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
