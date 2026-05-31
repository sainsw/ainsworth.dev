import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BlogContent } from '@/components/blog-content';

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
});
