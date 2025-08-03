import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { CustomMDX } from '../app/components/mdx'

describe('CustomMDX Component', () => {
  it('should render markdown content from source prop', () => {
    const markdownContent = '# Test Heading\n\nTest paragraph'
    
    render(<CustomMDX source={markdownContent} />)
    
    expect(screen.getByText('Test Heading')).toBeInTheDocument()
    expect(screen.getByText('Test paragraph')).toBeInTheDocument()
  })

  it('should render children when no source prop', () => {
    const markdownContent = '## Children Content'
    
    render(<CustomMDX>{markdownContent}</CustomMDX>)
    
    expect(screen.getByText('Children Content')).toBeInTheDocument()
  })

  it('should handle empty content gracefully', () => {
    // Should not throw when rendering with no content
    expect(() => {
      render(<CustomMDX />)
    }).not.toThrow()
    
    expect(() => {
      render(<CustomMDX source="" />)
    }).not.toThrow()
  })

  it('should not throw React Promise errors', () => {
    // This was the main issue - async components throwing Promise errors
    expect(() => {
      render(<CustomMDX source="# Test content" />)
    }).not.toThrow()
  })

  it('should render markdown links correctly', () => {
    const markdownWithLink = '[Test Link](https://example.com)'
    
    render(<CustomMDX source={markdownWithLink} />)
    
    const link = screen.getByRole('link', { name: 'Test Link' })
    expect(link).toHaveAttribute('href', 'https://example.com')
    expect(link).toHaveAttribute('target', '_blank')
  })
})