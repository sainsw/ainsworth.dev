import { describe, it, expect, vi } from 'vitest'

describe('OG Image Route', () => {
  it('returns 404 when post not found', async () => {
    vi.doMock('../app/db/blog', () => ({ getBlogPosts: vi.fn(() => []) }))
    const { GET } = await import('../app/api/og/[slug]/route')

    const res = await GET({} as any, { params: Promise.resolve({ slug: 'missing' }) } as any)
    expect((res as Response).status).toBe(404)
  })

  it('returns a non-404 response when post exists', async () => {
    vi.doMock('../app/db/blog', () => ({
      getBlogPosts: vi.fn(() => [{
        slug: 'hello',
        metadata: { title: 'Hello', summary: 'World', publishedAt: '2024-08-01' },
        content: '',
        tweetIds: [],
      }]),
    }))

    const { GET } = await import('../app/api/og/[slug]/route')
    const res: any = await GET({} as any, { params: Promise.resolve({ slug: 'hello' }) } as any)
    expect(res).toBeTruthy()
  })
})
