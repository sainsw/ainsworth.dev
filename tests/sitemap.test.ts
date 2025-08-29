import { describe, it, expect, vi } from 'vitest'

describe('sitemap', () => {
  it('includes base routes and blog posts', async () => {
    vi.doMock('../app/db/blog', () => ({
      getBlogPosts: vi.fn(() => [
        { slug: 'hello-world', metadata: { publishedAt: '2024-01-01' } },
        { slug: 'second', metadata: { publishedAt: '2024-02-02' } },
      ]),
    }))
    const sitemap = (await import('../app/sitemap')).default
    const out = await sitemap()
    const urls = out.map((x: any) => x.url)
    expect(urls).toContain('https://ainsworth.dev')
    expect(urls).toContain('https://ainsworth.dev/blog')
    expect(urls).toContain('https://ainsworth.dev/guestbook')
    expect(urls).toContain('https://ainsworth.dev/uses')
    expect(urls).toContain('https://ainsworth.dev/work')
    expect(urls).toContain('https://ainsworth.dev/blog/hello-world')
    expect(urls).toContain('https://ainsworth.dev/blog/second')
  })
})

