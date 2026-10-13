#!/usr/bin/env node
// Renders every ```mermaid block in content/ to a static SVG committed under
// content/diagrams/, so posts ship the finished drawing instead of ~196KB of
// mermaid that redraws it in the reader's browser. That JS was also the CLS:
// the placeholder was ~86px and the diagram it became is 855px on mobile and
// 1829px at 1280px wide, so everything below it jumped once mermaid resolved.
//
// Diagrams are theme-sensitive, and the site follows the system preference with
// no toggle, so each chart is rendered twice. Only colours differ between the
// two — verified, and re-verified here on every run: the geometry is asserted
// identical and the run fails if it ever stops being. So the output keeps one
// copy of the drawing, mermaid's light stylesheet as the base, and its dark one
// under @media (prefers-color-scheme: dark). Switching themes is then a repaint
// rather than the full re-render the old client component did.
//
// Run via `npm run render-diagrams` after adding or editing a diagram; the SVGs
// are committed, the same way the CV build commits its output.
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import {
  DIAGRAM_DIR,
  diagramGraphFile,
  diagramHash,
  extractCharts,
} from '../lib/content/mermaid.mjs';

const require = createRequire(import.meta.url);
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT_DIR = path.join(ROOT, 'content');
const OUT_DIR = path.join(ROOT, DIAGRAM_DIR);

const MERMAID_DIST = path.dirname(require.resolve('mermaid/package.json'));
// geist's exports map has no entry for the font files themselves, so this
// reaches for them directly rather than through require.resolve.
const FONT_FILE = path.join(
  ROOT,
  'node_modules/geist/dist/fonts/geist-mono/GeistMono-Variable.woff2',
);
if (!fs.existsSync(FONT_FILE)) {
  // Label metrics come from this file; falling back to a system mono would lay
  // every diagram out at the wrong size.
  throw new Error(`Geist Mono not found at ${FONT_FILE} — run npm install`);
}

// Mermaid emits these as inline `style="fill:… !important"` on the shape, which
// beats the site's stylesheet, so they are the one part of the drawing that
// cannot be restyled by CSS afterwards. Rendering each theme with its own
// palette lets the merge below lift them into custom properties.
const PALETTE = {
  '#e1f5fe': '#0c4a6e', // sky-50      → sky-900
  '#e8f5e8': '#064e3b', // green-50    → emerald-900
  '#fff3e0': '#713f12', // amber-50    → amber-900
  '#f3e5f5': '#6d28d9', // fuchsia-50  → violet-700
  '#ff69b4': '#86198f', // hot pink    → fuchsia-800
};

/** The component's themedChart transform, kept so output matches what shipped. */
function applyPalette(chart, isDark) {
  if (!isDark) return chart;
  let out = chart;
  for (const [light, dark] of Object.entries(PALETTE)) {
    out = out.replace(new RegExp(`fill:${light}`, 'gi'), `fill:${dark}`);
  }
  return out;
}

const RENDER_PAGE = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face {
  font-family: 'GeistMonoVF';
  src: url('/__font__/mono.woff2') format('woff2');
  font-weight: 100 900;
  font-display: block;
}
:root { --font-geist-mono: 'GeistMonoVF'; }
body { margin: 0; font-family: 'GeistMonoVF', ui-monospace, monospace; }
</style></head><body></body></html>`;

/** Mirrors components/mermaid-client.tsx so pre-rendered output matches. */
function mermaidConfig(isDark) {
  return {
    startOnLoad: false,
    // mermaid 12 moved the defaults to the neo look and the ELK layout, which
    // reflows every diagram. Pin the v11 pair so upgrades don't redraw posts.
    look: 'classic',
    layout: 'dagre',
    theme: isDark ? 'dark' : 'neutral',
    securityLevel: 'loose',
    fontFamily: "var(--font-geist-mono), 'Geist Mono', ui-monospace, monospace",
    maxTextSize: 90000,
    flowchart: {
      useMaxWidth: false,
      htmlLabels: false,
      curve: 'basis',
      padding: 12,
      nodeSpacing: 30,
      rankSpacing: 50,
      diagramPadding: 12,
      // v11's default; mermaid 12 dropped it to 120, which wraps most labels.
      wrappingWidth: 200,
    },
    themeVariables: {
      fontFamily:
        "var(--font-geist-mono), 'Geist Mono', ui-monospace, monospace",
      fontSize: '13px',
      background: 'transparent',
      primaryColor: isDark ? '#111827' : '#e7e1d8',
      primaryTextColor: isDark ? '#e5e7eb' : '#181512',
      primaryBorderColor: isDark ? '#374151' : '#d8d0c4',
      secondaryColor: isDark ? '#1f2937' : '#ece6de',
      secondaryTextColor: isDark ? '#e5e7eb' : '#181512',
      tertiaryColor: isDark ? '#374151' : '#f1ebe3',
      tertiaryTextColor: isDark ? '#e5e7eb' : '#181512',
      lineColor: isDark ? '#6b7280' : '#b7aa9a',
      textColor: isDark ? '#e5e7eb' : '#181512',
      clusterBkg: isDark ? '#0b1220' : '#ece6de',
      clusterBorder: isDark ? '#374151' : '#d8d0c4',
      noteBkgColor: isDark ? '#0f172a' : '#f1ebe3',
      noteTextColor: isDark ? '#e5e7eb' : '#181512',
      edgeLabelBackground: 'transparent',
    },
  };
}

const STYLE_TAG = /<style[^>]*>([\s\S]*?)<\/style>/;
const COLOUR = /#[0-9a-fA-F]{3,8}|rgba?\([^)]*\)|hsla?\([^)]*\)/g;
// The attributes that can carry a colour. Compared position-by-position between
// the two renders, which is only meaningful because the geometry is identical.
const PAINT_ATTR = /(?:style|fill|stroke)="[^"]*"/g;

const stylesheetOf = (svg) => STYLE_TAG.exec(svg)?.[1] ?? '';
const geometryOf = (svg) => svg.replace(STYLE_TAG, '');
const viewBoxOf = (svg) => /viewBox="([^"]+)"/.exec(svg)?.[1] ?? '';

/**
 * mermaid sizes the root in absolute pixels (width="447.2" height="1258.1").
 * The site's stylesheet overrides that to width:100%/height:auto, but a
 * stylesheet is a thing that can arrive late — and a box that is 447px wide for
 * one frame and 648px wide the next is the shift this whole change exists to
 * remove. Carrying the intrinsic ratio on the element itself means the first
 * layout is already the final one, with or without the stylesheet.
 */
function normaliseRoot(svg) {
  return svg.replace(/<svg\b[^>]*>/, (tag) => {
    const keep = tag
      .replace(/\s(?:width|height)="[^"]*"/g, '')
      .replace(/\s*\/?>$/, '');
    return `${keep} preserveAspectRatio="xMidYMin meet" style="width:100%;height:auto">`;
  });
}

/**
 * Folds the two renders into one drawing.
 *
 * Everything theme-dependent lives in mermaid's stylesheet except the inline
 * palette fills, so those become var(--mmd-cN) and get their value from
 * whichever stylesheet is active. Anything else that differs is not something
 * this can express, so it throws rather than silently shipping one theme's
 * colours to both.
 */
function merge({ light, dark, id, label }) {
  const lightGeometry = geometryOf(light);
  const darkGeometry = geometryOf(dark);

  const lightPaint = lightGeometry.match(PAINT_ATTR) ?? [];
  const darkPaint = darkGeometry.match(PAINT_ATTR) ?? [];
  if (lightPaint.length !== darkPaint.length) {
    throw new Error(
      `${label}: light and dark renders have different structure ` +
        `(${lightPaint.length} vs ${darkPaint.length} paint attributes)`,
    );
  }

  const vars = [];
  let geometry = lightGeometry;

  for (const [i, lightAttr] of lightPaint.entries()) {
    const darkAttr = darkPaint[i];
    if (lightAttr === darkAttr) continue;

    const lightColours = lightAttr.match(COLOUR) ?? [];
    const darkColours = darkAttr.match(COLOUR) ?? [];
    // NUL as the sentinel, written as an escape rather than as a literal byte:
    // a real NUL in the source makes git treat this whole file as binary, so it
    // has no diff, blame or review. Any character that cannot occur in the
    // attribute would do; a space would not, since it already appears in one.
    const sameShape =
      lightColours.length === darkColours.length &&
      lightAttr.replace(COLOUR, '\u0000') ===
        darkAttr.replace(COLOUR, '\u0000');
    if (!sameShape || lightColours.length === 0) {
      throw new Error(
        `${label}: cannot express theme difference as a custom property\n` +
          `  light: ${lightAttr}\n  dark:  ${darkAttr}`,
      );
    }

    let replaced = lightAttr;
    for (const [j, lightColour] of lightColours.entries()) {
      const name = `--mmd-c${vars.length}`;
      vars.push({ name, light: lightColour, dark: darkColours[j] });
      replaced = replaced.replace(lightColour, `var(${name})`);
    }
    // Anchored on the exact attribute text, which is unique enough in practice;
    // replace() without /g rewrites only the first occurrence, and identical
    // earlier attributes would have compared equal and been skipped above.
    geometry = geometry.replace(lightAttr, replaced);
  }

  const declare = (theme) =>
    vars.length === 0
      ? ''
      : `#${id}{${vars.map((v) => `${v.name}:${v[theme]};`).join('')}}`;

  const lightCss = stylesheetOf(light) + declare('light');
  // mermaid scopes its stylesheet by the id it was handed, so the dark render's
  // id has to be rewritten to match the one drawing that survives.
  const darkCss =
    stylesheetOf(dark).replaceAll(`${id}-dark`, id) + declare('dark');

  const stylesheet =
    `<style>${lightCss}` +
    `@media (prefers-color-scheme: dark){${darkCss}}</style>`;

  // Straight after the opening tag, so the rules precede the nodes they style.
  return {
    svg: normaliseRoot(geometry).replace(/(<svg\b[^>]*>)/, `$1${stylesheet}`),
    varCount: vars.length,
  };
}

async function main() {
  const files = fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => path.extname(f) === '.html')
    .sort();

  const jobs = [];
  const seen = new Set();
  for (const file of files) {
    const html = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf8');
    for (const [index, chart] of extractCharts(html).entries()) {
      const hash = diagramHash(chart);
      if (seen.has(hash)) continue; // same chart in two posts renders once
      seen.add(hash);
      jobs.push({
        hash,
        chart,
        label: `${path.basename(file, '.html')}#${index}`,
      });
    }
  }

  if (jobs.length === 0) {
    console.log('No mermaid blocks found in content/.');
    return;
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.route('**/__mermaid__/**', (route) => {
    const rel = new URL(route.request().url()).pathname.replace(
      '/__mermaid__/',
      '',
    );
    const file = path.join(MERMAID_DIST, rel);
    if (!file.startsWith(MERMAID_DIST) || !fs.existsSync(file)) {
      return route.fulfill({ status: 404, body: '' });
    }
    return route.fulfill({
      status: 200,
      contentType: 'text/javascript',
      body: fs.readFileSync(file),
    });
  });
  await page.route('**/__font__/**', (route) =>
    route.fulfill({
      contentType: 'font/woff2',
      body: fs.readFileSync(FONT_FILE),
    }),
  );
  await page.route('https://render.local/', (route) =>
    route.fulfill({ contentType: 'text/html', body: RENDER_PAGE }),
  );

  await page.goto('https://render.local/');
  // Label geometry is measured against the real font; without this the first
  // diagram would be laid out with fallback metrics.
  await page.evaluate(() => document.fonts.ready);

  /**
   * Pulls the parsed graph back out of mermaid.
   *
   * The SVG says what the diagram looks like and nothing about what it means:
   * a screen reader gets the node labels in document order with no sense of
   * which leads to which. mermaid has already worked all of that out to draw
   * the thing, so this asks its parser for the same answer and writes it next
   * to the drawing. components/blog-content.tsx turns it into a list a reader
   * can walk. The labels are the author's own, so nothing here is invented.
   */
  const graphOne = (chart) =>
    page.evaluate(
      async ({ chart }) => {
        const mermaid = (await import('/__mermaid__/dist/mermaid.esm.min.mjs'))
          .default;
        const diagram = await mermaid.mermaidAPI.getDiagramFromText(chart);
        const db = diagram.db;
        const asObject = (v) => (v instanceof Map ? Object.fromEntries(v) : v);

        const title = db.getAccTitle?.() || db.getDiagramTitle?.() || '';
        const description = db.getAccDescription?.() || '';

        // A sequence diagram is already a linear walk, so it keeps its own
        // shape rather than being forced into an adjacency list.
        if (typeof db.getMessages === 'function') {
          const actors = asObject(db.getActors?.() ?? {});
          return {
            kind: 'sequence',
            type: diagram.type,
            title,
            description,
            actors: Object.values(actors).map((a) => ({
              id: a.name,
              text: a.description ?? a.name,
            })),
            messages: (db.getMessages?.() ?? []).map((m) => ({
              from: m.from,
              to: m.to,
              text: m.message ?? '',
            })),
          };
        }

        if (typeof db.getVertices !== 'function') {
          return {
            kind: 'unsupported',
            type: diagram.type,
            title,
            description,
          };
        }

        const vertices = asObject(db.getVertices());
        const subgraphs = db.getSubGraphs?.() ?? [];
        const memberOf = new Map();
        for (const group of subgraphs) {
          for (const node of group.nodes ?? []) memberOf.set(node, group.id);
        }

        return {
          kind: 'graph',
          type: diagram.type,
          title,
          description,
          // Declaration order, which is the order the author wrote and reads
          // close to the drawing's own top-to-bottom flow. Not re-sorted: any
          // ordering this invented would be a claim the source does not make.
          nodes: Object.values(vertices).map((v) => ({
            id: v.id,
            text: v.text ?? v.id,
            shape: v.type ?? 'square',
            group: memberOf.get(v.id) ?? null,
          })),
          edges: (db.getEdges?.() ?? []).map((e) => ({
            from: e.start,
            to: e.end,
            label: e.text ?? '',
            stroke: e.stroke ?? 'normal',
          })),
          groups: subgraphs.map((g) => ({
            id: g.id,
            text: g.title ?? g.id,
            nodes: g.nodes ?? [],
          })),
        };
      },
      { chart },
    );

  const renderOne = (chart, id, isDark) =>
    page.evaluate(
      async ({ chart, id, config }) => {
        const mermaid = (await import('/__mermaid__/dist/mermaid.esm.min.mjs'))
          .default;
        mermaid.initialize(config);
        const { svg } = await mermaid.render(id, chart);
        return svg;
      },
      { chart, id, config: mermaidConfig(isDark) },
    );

  let written = 0;
  const kept = new Set();

  for (const job of jobs) {
    const id = `mermaid-${job.hash}`;
    kept.add(`${job.hash}.svg`);
    kept.add(diagramGraphFile(job.hash));

    const light = await renderOne(applyPalette(job.chart, false), id, false);
    const dark = await renderOne(
      applyPalette(job.chart, true),
      `${id}-dark`,
      true,
    );

    // The merge keeps one copy of the drawing, which is only sound if both
    // themes laid it out the same way. Assert rather than assume.
    const lightBox = viewBoxOf(light);
    const darkBox = viewBoxOf(dark);
    if (lightBox !== darkBox) {
      throw new Error(
        `${job.label}: light and dark renders disagree on geometry ` +
          `(viewBox "${lightBox}" vs "${darkBox}")`,
      );
    }

    const { svg, varCount } = merge({ light, dark, id, label: job.label });
    const target = path.join(OUT_DIR, `${job.hash}.svg`);
    const previous = fs.existsSync(target)
      ? fs.readFileSync(target, 'utf8')
      : null;
    if (previous !== svg) {
      fs.writeFileSync(target, svg);
      written += 1;
    }

    // Parsed from the unthemed source: the palette substitution only touches
    // fill colours, and the graph must not depend on which theme rendered it.
    const graph = `${JSON.stringify(await graphOne(job.chart), null, 2)}\n`;
    const graphTarget = path.join(OUT_DIR, diagramGraphFile(job.hash));
    const previousGraph = fs.existsSync(graphTarget)
      ? fs.readFileSync(graphTarget, 'utf8')
      : null;
    if (previousGraph !== graph) {
      fs.writeFileSync(graphTarget, graph);
    }

    const [, , w, h] = lightBox.split(' ').map(Number);
    console.log(
      `${previous === svg ? 'unchanged' : 'rendered '} ${job.label.padEnd(34)} ` +
        `${job.hash}  ${Math.round(w)}x${Math.round(h)}  ` +
        `${String(Math.round(svg.length / 1024)).padStart(3)}KB  ` +
        `${varCount} themed fill${varCount === 1 ? '' : 's'}`,
    );
  }

  await browser.close();

  // A chart that was edited or deleted leaves its old SVG behind; drop it so
  // content/diagrams only ever holds what the current content references.
  let pruned = 0;
  for (const file of fs.readdirSync(OUT_DIR)) {
    if (['.svg', '.json'].includes(path.extname(file)) && !kept.has(file)) {
      fs.unlinkSync(path.join(OUT_DIR, file));
      pruned += 1;
      console.log(`pruned    ${file}`);
    }
  }

  console.log(
    `\n${jobs.length} diagram${jobs.length === 1 ? '' : 's'}: ` +
      `${written} written, ${jobs.length - written} unchanged, ${pruned} pruned`,
  );
}

main().catch((error) => {
  console.error(`\nrender-mermaid failed: ${error.message}`);
  process.exit(1);
});
