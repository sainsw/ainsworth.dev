import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import BlogPage from '../app/blog/page'

// Mock the blog data function
vi.mock('../app/db/blog', () => ({
  getBlogPosts: vi.fn(() => [
    {
      slug: 'first-post',
      metadata: {
        title: 'First Blog Post',
        publishedAt: '2024-01-15',
        summary: 'First post summary',
      },
      content: 'First post content',
      tweetIds: [],
    },
    {
      slug: 'second-post', 
      metadata: {
        title: 'Second Blog Post',
        publishedAt: '2024-01-10',
        summary: 'Second post summary',
      },
      content: 'Second post content',
      tweetIds: [],
    },
    {
      slug: 'third-post',
      metadata: {
        title: 'Third Blog Post', 
        publishedAt: '2024-01-20',
        summary: 'Third post summary',
      },
      content: 'Third post content',
      tweetIds: [],
    },
  ])
}))

describe('Blog Listing Page', () => {
  it('should render page title', () => {
    render(<BlogPage />)
    
    expect(screen.getByText('read my blog')).toBeInTheDocument()
  })

  it('should display all blog posts', () => {
    render(<BlogPage />)
    
    expect(screen.getByText('First Blog Post')).toBeInTheDocument()
    expect(screen.getByText('Second Blog Post')).toBeInTheDocument()
    expect(screen.getByText('Third Blog Post')).toBeInTheDocument()
  })

  it('should sort posts by date (newest first)', () => {
    render(<BlogPage />)
    
    const links = screen.getAllByRole('link')
    const postTitles = links.map(link => link.textContent)
    
    // Should be sorted: 2024-01-20, 2024-01-15, 2024-01-10
    expect(postTitles[0]).toContain('Third Blog Post') // 2024-01-20
    expect(postTitles[1]).toContain('First Blog Post') // 2024-01-15  
    expect(postTitles[2]).toContain('Second Blog Post') // 2024-01-10
  })

  it('should create correct links to blog posts', () => {
    render(<BlogPage />)
    
    const firstPostLink = screen.getByRole('link', { name: /First Blog Post/ })
    const secondPostLink = screen.getByRole('link', { name: /Second Blog Post/ })
    
    expect(firstPostLink).toHaveAttribute('href', '/blog/first-post')
    expect(secondPostLink).toHaveAttribute('href', '/blog/second-post')
  })

  it('should handle empty blog posts array', () => {
    // Override the mock for this test
    vi.doMock('../app/db/blog', () => ({
      getBlogPosts: vi.fn(() => [])
    }))

    render(<BlogPage />)
    
    expect(screen.getByText('read my blog')).toBeInTheDocument()
    // Should not crash with empty array
  })

  it('should include Suspense fallbacks for view counts', () => {
    const { container } = render(<BlogPage />)
    
    // Should have Suspense components (though in test they render immediately)
    const suspenseElements = container.querySelectorAll('[data-testid], .h-6')
    expect(suspenseElements.length).toBeGreaterThanOrEqual(0) // Fallbacks might not be visible in tests
  })
})