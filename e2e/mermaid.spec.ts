import { expect, test } from '@playwright/test';
import { POSTS_WITH_MERMAID, prepareContext } from './helpers';

// components/mermaid-client.tsx renders each fenced ```mermaid block to an
// inline SVG, and exposes the chart source on data-chart specifically so tests
// can compare the two. Counting <g> and <path> elements only proves "something
// was drawn"; these compare the drawing against what it was asked to draw.

/**
 * Pulls the human-readable labels out of mermaid source.
 *
 * Covers the syntaxes actually used across content/: flowchart and graph node
 * shapes, quoted labels (which may span lines), subgraph titles, edge labels,
 * and sequenceDiagram participants and messages.
 */
function mermaidLabels(source: string): string[] {
  // `%%` starts a comment. Prose inside one is never rendered, and parentheses
  // in it would otherwise be picked up as a node label.
  const body = source.replace(/^\s*%%.*$/gm, '');

  const labels: string[] = [];
  const push = (value?: string) => {
    const text = (value ?? '').trim();
    if (text) labels.push(text);
  };

  // Quoted labels first — they may contain the bracket characters that the
  // unquoted patterns below use as delimiters.
  for (const m of body.matchAll(
    /(?:\[|\(|\{)\s*"([\s\S]*?)"\s*(?:\]|\)|\})/g,
  )) {
    push(m[1]);
  }
  for (const m of body.matchAll(/\[([^[\]"|]+)\]/g)) push(m[1]);
  for (const m of body.matchAll(/\{([^{}"|]+)\}/g)) push(m[1]);
  for (const m of body.matchAll(/\(([^()"|]+)\)/g)) push(m[1]);
  for (const m of body.matchAll(/\|([^|"]+)\|/g)) push(m[1]);
  for (const m of body.matchAll(/^\s*participant\s+(\w+)/gm)) push(m[1]);
  for (const m of body.matchAll(/^\s*\w+\s*-+>>?\s*\w+\s*:\s*(.+)$/gm)) {
    push(m[1]);
  }

  return [...new Set(labels)];
}

const normalise = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]/g, '');

/**
 * Reads each diagram's source alongside the text its SVG actually renders.
 * Labels land in <text>/<tspan> or, for flowchart nodes, inside a
 * <foreignObject>; the injected <style> block is excluded so a label can never
 * "match" against CSS rather than a drawn node.
 *
 * The DOM walk is inlined rather than shared as a stringified function because
 * the site's CSP has no 'unsafe-eval' outside development, so `new Function`
 * would throw against a production build.
 */
async function diagramsOn(page: import('@playwright/test').Page, slug: string) {
  await page.goto(`/blog/${slug}`);

  const diagrams = page.locator('[data-testid="mermaid"]');
  await expect(diagrams.first()).toBeAttached();

  const read = (els: Element[]) =>
    els.map((el) => {
      const svg = el.querySelector('svg');
      const rendered = svg
        ? [...svg.querySelectorAll('text, tspan, foreignObject')]
            .map((node) => node.textContent ?? '')
            .join(' ')
            .trim()
        : '';
      return { source: el.getAttribute('data-chart') ?? '', rendered };
    });

  // Every diagram, not just the first: mermaid inserts the <svg> shell and
  // fills it asynchronously, one instance at a time.
  await expect
    .poll(
      () =>
        diagrams.evaluateAll((els) =>
          els.every((el) => {
            const svg = el.querySelector('svg');
            if (!svg) return false;
            return (
              [...svg.querySelectorAll('text, tspan, foreignObject')]
                .map((node) => node.textContent ?? '')
                .join('')
                .trim().length > 0
            );
          }),
        ),
      { timeout: 40000 },
    )
    .toBe(true);

  return diagrams.evaluateAll(read);
}

test.beforeEach(async ({ context, baseURL }) => {
  await prepareContext(context, baseURL);
});

for (const slug of POSTS_WITH_MERMAID) {
  test(`every diagram in "${slug}" renders the labels its source declares`, async ({
    page,
  }) => {
    const diagrams = await diagramsOn(page, slug);
    expect(diagrams.length, 'diagrams found').toBeGreaterThan(0);

    for (const [index, diagram] of diagrams.entries()) {
      const labels = mermaidLabels(diagram.source);
      // A source that yields no labels would make the assertions below vacuous.
      expect(labels.length, `${slug}#${index} labels parsed`).toBeGreaterThan(
        0,
      );

      const rendered = normalise(diagram.rendered);
      const missing = labels.filter((l) => !rendered.includes(normalise(l)));
      expect(missing, `${slug}#${index} labels missing from the SVG`).toEqual(
        [],
      );
    }
  });
}

test('a diagram that fails to parse surfaces an error instead of an empty box', async ({
  page,
}) => {
  // The renderer catches parse failures and shows the source; silently drawing
  // nothing would be the worse outcome.
  await page.goto(`/blog/${POSTS_WITH_MERMAID[0]}`);
  await expect(page.getByText(/failed to render diagram/i)).toHaveCount(0);
  await expect(page.getByText(/syntax error/i)).toHaveCount(0);
});

test('mermaid blocks are not passed through the syntax highlighter', async ({
  page,
}) => {
  await page.goto('/blog/github-image-sync');

  // highlightCodeBlocks() skips language-mermaid so the client renderer still
  // sees the raw chart source.
  const diagrams = await diagramsOn(page, 'github-image-sync');
  expect(diagrams.length).toBeGreaterThan(0);
  await expect(page.locator('code.language-mermaid')).toHaveCount(0);
  // sugar-high would have wrapped tokens in spans inside the source we read.
  expect(diagrams[0].source).not.toContain('sh__');
});
