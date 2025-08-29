import { describe, it, expect } from 'vitest'

describe('robots', () => {
  it('returns proper rules, sitemap and host', async () => {
    const robots = (await import('../app/robots')).default
    const res = robots()
    expect(res.rules).toEqual([{ userAgent: '*' }])
    expect(res.sitemap).toBe('https://ainsworth.dev/sitemap.xml')
    expect(res.host).toBe('https://ainsworth.dev')
  })
})

