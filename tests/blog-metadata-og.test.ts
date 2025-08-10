import { describe, it, expect } from 'vitest'
import { getBlogPosts } from 'app/db/blog'
import { generateMetadata } from 'app/blog/[slug]/page'

describe('Blog metadata OG tags', () => {
  const posts = getBlogPosts()

  it('has at least one blog post to validate', () => {
    expect(posts.length).toBeGreaterThan(0)
  })

  for (const post of posts) {
    it(`generates correct OpenGraph/Twitter metadata for \'${post.slug}\'`, async () => {
      const meta = await generateMetadata({ params: { slug: post.slug } } as any)

      expect(meta).toBeDefined()
      if (!meta) return

      // Basic fields
      expect(meta.title).toBe(post.metadata.title)
      expect(meta.description).toBe(post.metadata.summary)

      // OpenGraph
      expect(meta.openGraph).toBeDefined()
      expect(meta.openGraph?.title).toBe(post.metadata.title)
      expect(meta.openGraph?.description).toBe(post.metadata.summary)
      expect(meta.openGraph?.url).toBe(`https://ainsworth.dev/blog/${post.slug}`)

      const expectedOg = post.metadata.image
        ? `https://ainsworth.dev${post.metadata.image}`
        : `https://ainsworth.dev/api/og/${post.slug}`

      const ogImages = (meta.openGraph?.images ?? []) as Array<any>
      expect(ogImages.length).toBeGreaterThan(0)
      expect(ogImages[0]).toHaveProperty('url')
      expect(ogImages[0].url).toBe(expectedOg)

      // Twitter
      expect(meta.twitter).toBeDefined()
      expect(meta.twitter?.card).toBe('summary_large_image')
      const twImages = (meta.twitter?.images ?? []) as Array<string>
      expect(twImages.length).toBeGreaterThan(0)
      expect(twImages[0]).toBe(expectedOg)
    })
  }
})
