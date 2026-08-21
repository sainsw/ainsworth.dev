import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { BlogRow } from '@/app/blog/blog-row';

// RelativeDate is an async server component: it awaits a cached clock, which
// testing-library cannot render. The date it produces has its own tests in
// tests/date.test.ts; what matters here is the row around it.
vi.mock('@/app/blog/relative-date', () => ({
  RelativeDate: ({ date }: { date: string }) => <span>{date}</span>,
}));

const post = {
  slug: 'first-post',
  metadata: { title: 'First Blog Post', publishedAt: '2024-01-15' },
};

describe('BlogRow', () => {
  it('links to the post', () => {
    render(<BlogRow post={post} />);

    expect(
      screen.getByRole('link', { name: /First Blog Post/ }),
    ).toHaveAttribute('href', '/blog/first-post');
  });

  it('shows the count once it has arrived', () => {
    render(<BlogRow post={post} viewCount={1234} />);

    expect(screen.getByText('1,234 views')).toBeInTheDocument();
  });

  it('shows zero views for a post nobody has read', () => {
    render(<BlogRow post={post} viewCount={0} />);

    expect(screen.getByText('0 views')).toBeInTheDocument();
  });

  it('says nothing when the counter is unavailable', () => {
    render(<BlogRow post={post} viewCount={null} />);

    expect(screen.queryByText(/views$/)).not.toBeInTheDocument();
    expect(screen.getByText('First Blog Post')).toBeInTheDocument();
  });

  it('says nothing while the counts are still in flight', () => {
    render(<BlogRow post={post} />);

    expect(screen.queryByText(/views$/)).not.toBeInTheDocument();
  });
});
