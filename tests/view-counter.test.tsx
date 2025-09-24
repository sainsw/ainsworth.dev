import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import ViewCounter from '../app/blog/view-counter'

describe('ViewCounter Component', () => {
  it('should display view count for existing slug', () => {
    const mockViews = [
      { slug: 'post-1', count: 150 },
      { slug: 'post-2', count: 75 },
    ]

    render(<ViewCounter slug="post-1" allViews={mockViews} />)

    expect(screen.getByText('150 views')).toBeInTheDocument()
  })

  it('should display 0 views for non-existent slug', () => {
    const mockViews = [
      { slug: 'post-1', count: 150 },
    ]

    render(<ViewCounter slug="non-existent" allViews={mockViews} />)

    expect(screen.getByText('0 views')).toBeInTheDocument()
  })

  it('should handle empty views array', () => {
    render(<ViewCounter slug="any-slug" allViews={[]} />)

    expect(screen.getByText('0 views')).toBeInTheDocument()
  })

  it('should format large numbers with locale formatting', () => {
    const mockViews = [
      { slug: 'popular-post', count: 1234567 },
    ]

    render(<ViewCounter slug="popular-post" allViews={mockViews} />)

    // Should format with commas (or locale-appropriate separators)
    const viewText = screen.getByText(/1,234,567 views|1.234.567 views/)
    expect(viewText).toBeInTheDocument()
  })

  it('should handle null/undefined allViews gracefully', () => {
    render(<ViewCounter slug="test" allViews={null as any} />)

    expect(screen.getByText('0 views')).toBeInTheDocument()
  })

  it('should apply correct CSS classes', () => {
    const mockViews = [{ slug: 'test', count: 42 }]
    
    const { container } = render(<ViewCounter slug="test" allViews={mockViews} />)
    
    const paragraph = container.querySelector('p')
    expect(paragraph).toHaveClass('text-gray-600', 'dark:text-gray-400')
  })
})
