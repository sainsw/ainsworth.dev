import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

// Unmock the blog module for integration testing
vi.unmock('../app/db/blog')
import { getBlogPosts } from '../app/db/blog'

describe('Integration Tests', () => {
  it('should load real blog posts from content directory', () => {
    const posts = getBlogPosts()
    
    // Should find actual MDX files
    expect(posts.length).toBeGreaterThan(0)
    
    // Check structure of first post
    const firstPost = posts[0]
    expect(firstPost).toHaveProperty('metadata')
    expect(firstPost).toHaveProperty('slug')
    expect(firstPost).toHaveProperty('content')
    expect(firstPost).toHaveProperty('tweetIds')
    
    // Metadata should have required fields
    expect(firstPost.metadata).toHaveProperty('title')
    expect(firstPost.metadata).toHaveProperty('publishedAt')
    expect(firstPost.metadata).toHaveProperty('summary')
    
    // Should include hello-world post
    const helloPost = posts.find(p => p.slug === 'hello-world')
    expect(helloPost).toBeDefined()
    expect(helloPost?.metadata.title).toBe('Hello, World!')
    expect(helloPost?.content).toContain('The blog lives, long live the blog.')
  })
  
  it('should load all expected blog posts', () => {
    const posts = getBlogPosts()
    const slugs = posts.map(p => p.slug).sort()
    
    expect(slugs).toContain('hello-world')
    expect(slugs).toContain('api-design') 
    expect(slugs).toContain('ios-shortcuts')
  })
})