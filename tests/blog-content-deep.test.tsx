import fs from 'node:fs';
import path from 'node:path';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BlogContent } from '@/components/blog-content';
import { diagramHash, extractCharts } from '@/lib/content/mermaid.mjs';

describe('BlogContent deep rendering', () => {
  it('renders code blocks with syntax highlighting', () => {
    const html = '<pre><code class="language-js">console.log(123)</code></pre>';
    const { container } = render(<BlogContent source={html} />);
    const code = container.querySelector('code')!;
    expect(code).toBeInTheDocument();
    expect(code.innerHTML).toMatch(/console/);
    expect(code.innerHTML).toMatch(/123/);
  });

  it('renders plain HTML content without client wrapper when no mermaid/avatar-demo', () => {
    const html = '<p>Simple content</p><h2>Section</h2>';
    const { container } = render(<BlogContent source={html} />);
    expect(container.querySelector('h2')?.id).toBe('section');
    expect(screen.getByText('Simple content')).toBeInTheDocument();
  });

  describe('mermaid diagrams', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'content/seasonal-avatar-borders.html'),
      'utf-8',
    );
    const chart = extractCharts(source)[0];

    it('inlines the pre-rendered SVG rather than loading a renderer', () => {
      const html = `<pre><code class="language-mermaid">${chart
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')}</code></pre>`;
      const { container } = render(<BlogContent source={html} />);

      const svg = container.querySelector('svg');
      // Synchronously present: this is what removes the shift, so a diagram
      // that only appears after an effect would be a regression.
      expect(svg).not.toBeNull();
      expect(svg?.id).toBe(`mermaid-${diagramHash(chart)}`);
      // Sizes itself from its own viewBox, with no fixed width to shift from.
      expect(svg?.getAttribute('viewBox')).toBeTruthy();
      expect(svg?.hasAttribute('width')).toBe(false);
      expect(container.querySelector('[data-testid="mermaid"]')).not.toBeNull();
    });

    it('carries both themes so switching needs no JavaScript', () => {
      const html = `<pre><code class="language-mermaid">${chart
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')}</code></pre>`;
      const { container } = render(<BlogContent source={html} />);
      const style = container.querySelector('svg style')?.textContent ?? '';

      expect(style).toContain('@media (prefers-color-scheme: dark)');
      // The palette fills mermaid writes inline can only follow the theme if
      // they were lifted into custom properties.
      expect(container.innerHTML).toContain('var(--mmd-c0)');
    });

    it('fails loudly when a chart has no committed SVG', () => {
      const html =
        '<pre><code class="language-mermaid">flowchart TD\n  A --&gt; B</code></pre>';
      // Silently rendering nothing would ship a post with a hole in it.
      expect(() => render(<BlogContent source={html} />)).toThrow(
        /npm run render-diagrams/,
      );
    });
  });
});
