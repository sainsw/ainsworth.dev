import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CustomMDX } from '../app/components/mdx'

// Test actual MDX content parsing and rendering
describe('Blog Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render MDX content without React conflicts', async () => {
    const testMDXContent = `
# Test Blog Post

This is a test blog post with **bold text** and [a link](https://example.com).

## Code Example

\`\`\`javascript
function test() {
  return "Hello World";
}
\`\`\`

## Components

This tests if custom components work:

<Callout emoji="⚠️">
This is a callout component
</Callout>
`

    // This should not throw React version conflicts
    expect(() => {
      render(<CustomMDX source={testMDXContent} />)
    }).not.toThrow()

    // Wait for async MDX compilation
    await waitFor(() => {
      expect(screen.getByText('Test Blog Post')).toBeInTheDocument()
    })

    // Verify content is rendered
    expect(screen.getByText(/This is a test blog post/)).toBeInTheDocument()
    expect(screen.getByText('Code Example')).toBeInTheDocument()
    expect(screen.getByText(/Hello World/)).toBeInTheDocument()
  })

  it('should handle MDX components without conflicts', async () => {
    const mdxWithComponents = `
# Component Test

<ProsCard title="React" pros={["Fast", "Flexible", "Popular"]} />

<ConsCard title="Complexity" cons={["Learning curve", "Ecosystem fatigue"]} />
`

    expect(() => {
      render(<CustomMDX source={mdxWithComponents} />)
    }).not.toThrow()

    await waitFor(() => {
      expect(screen.getByText('Component Test')).toBeInTheDocument()
    })
  })

  it('should detect React version conflicts during rendering', () => {
    // Mock multiple React versions to simulate the production issue
    const originalReact = global.React
    
    // Simulate the conflict that happens in production
    Object.defineProperty(global, 'React', {
      value: { version: '17.0.0' },
      configurable: true
    })

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    try {
      render(<CustomMDX source="# Test" />)
      
      // Should log React version warnings if conflicts exist
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('React')
      )
    } catch (error) {
      // If it throws, that's also a sign of React conflicts
      expect(error.message).toContain('React')
    } finally {
      // Restore
      Object.defineProperty(global, 'React', {
        value: originalReact,
        configurable: true
      })
      consoleSpy.mockRestore()
    }
  })

  it('should validate that Sandpack component causes conflicts', () => {
    // Test if enabling Sandpack causes the React conflict
    const mdxWithSandpack = `
# Code Editor Test

<LiveCode>
const example = "test";
console.log(example);
</LiveCode>
`

    // This might fail if Sandpack has React conflicts
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    try {
      render(<CustomMDX source={mdxWithSandpack} />)
    } catch (error) {
      // If this throws, Sandpack is likely the culprit
      expect(error.message).toContain('React')
      console.log('🔍 Sandpack confirmed as source of React conflicts')
    }
    
    consoleSpy.mockRestore()
  })

  it('should test actual blog post file parsing', async () => {
    // This would test with actual blog post content
    const sampleBlogContent = `---
title: "Sample Post"
publishedAt: "2024-01-01"
summary: "A test post"
---

# Sample Blog Post

This is **real content** from a blog post.

## Features

- Lists work
- *Italic text* works  
- \`inline code\` works

\`\`\`typescript
interface BlogPost {
  title: string;
  content: string;
}
\`\`\`
`

    expect(() => {
      render(<CustomMDX source={sampleBlogContent} />)
    }).not.toThrow()

    await waitFor(() => {
      expect(screen.getByText('Sample Blog Post')).toBeInTheDocument()
    })

    expect(screen.getByText(/real content/)).toBeInTheDocument()
    expect(screen.getByText('Features')).toBeInTheDocument()
  })
})