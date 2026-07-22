import { createHash } from 'node:crypto';

// Shared by the build-time renderer (scripts/render-mermaid.mjs) and the
// server component that inlines its output (components/blog-content.tsx).
// Both have to agree on which blocks are diagrams and what each one hashes to,
// so the pattern and the hash live here rather than in each of them.

/** Matches a fenced ```mermaid block as it appears in content/*.html. */
export const MERMAID_BLOCK_SOURCE =
  '<pre><code class="language-mermaid">([\\s\\S]*?)<\\/code><\\/pre>';

/** Where render-mermaid.mjs writes, relative to the repo root. */
export const DIAGRAM_DIR = 'content/diagrams';

export function decodeEntities(code) {
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

/**
 * Content address for one diagram. Also the SVG's filename and its DOM id, so
 * editing a chart's source orphans its old SVG rather than silently reusing it.
 */
export function diagramHash(chart) {
  return createHash('sha256').update(chart, 'utf8').digest('hex').slice(0, 12);
}

export function diagramId(chart) {
  return `mermaid-${diagramHash(chart)}`;
}

/** Every distinct chart in a content file, in document order. */
export function extractCharts(html) {
  const pattern = new RegExp(MERMAID_BLOCK_SOURCE, 'g');
  const charts = [];
  let match = pattern.exec(html);
  while (match !== null) {
    charts.push(decodeEntities(match[1]));
    match = pattern.exec(html);
  }
  return charts;
}
