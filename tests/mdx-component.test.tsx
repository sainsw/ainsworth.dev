import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { BlogContent } from '../app/components/blog-content'

describe('BlogContent Component', () => {
  it('should render HTML content', () => {
    render(<BlogContent source="<h1>Test Heading</h1><p>Test paragraph</p>" />)

    expect(screen.getByText('Test Heading')).toBeInTheDocument()
    expect(screen.getByText('Test paragraph')).toBeInTheDocument()
  })

  it('should handle empty content gracefully', () => {
    expect(() => {
      render(<BlogContent source="" />)
    }).not.toThrow()
  })

  it('should render links correctly', () => {
    render(<BlogContent source='<a href="https://example.com">Test Link</a>' />)

    const link = screen.getByRole('link', { name: 'Test Link' })
    expect(link).toHaveAttribute('href', 'https://example.com')
  })

  it('should add heading anchors with IDs', () => {
    const { container } = render(<BlogContent source="<h2>My Section</h2>" />)
    const h2 = container.querySelector('h2')
    expect(h2).toBeInTheDocument()
    expect(h2?.id).toBe('my-section')
    expect(h2?.querySelector('a.anchor')).toBeInTheDocument()
  })
})
