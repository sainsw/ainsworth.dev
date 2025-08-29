import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const origEnv = { ...process.env }

beforeEach(() => {
  vi.resetModules()
  process.env = { ...origEnv }
})

afterEach(() => {
  process.env = { ...origEnv }
  vi.restoreAllMocks()
})

describe('db/actions increment', () => {
  it('no-ops when DATABASE_URL is missing', async () => {
    delete process.env.DATABASE_URL
    vi.doMock('app/db/postgres', () => ({ sql: vi.fn(async () => {}) }))
    vi.doMock('app/auth', () => ({ auth: vi.fn(async () => ({ user: { email: 'stub' } })) }))
    vi.doMock('../app/db/actions', async (importOriginal) => {
      const actual = await importOriginal<any>()
      return { ...actual }
    })
    const { increment } = await import('../app/db/actions')
    await expect(increment('slug-1')).resolves.toBeUndefined()
    const { sql } = await import('app/db/postgres') as any
    expect(sql).not.toHaveBeenCalled()
  })

  it('logs and does not throw on SQL error', async () => {
    process.env.DATABASE_URL = 'postgres://test'
    const sql = vi.fn(async () => { throw new Error('db down') })
    vi.doMock('app/db/postgres', () => ({ sql }))
    vi.doMock('next/cache', () => ({ unstable_noStore: () => {}, revalidatePath: vi.fn() }))
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.doMock('app/auth', () => ({ auth: vi.fn(async () => ({ user: { email: 'stub' } })) }))
    vi.doMock('../app/db/actions', async (importOriginal) => {
      const actual = await importOriginal<any>()
      return { ...actual }
    })
    const { increment } = await import('../app/db/actions')
    await expect(increment('slug-2')).resolves.toBeUndefined()
    expect(sql).toHaveBeenCalled()
    expect(errSpy).toHaveBeenCalled()
  })
})

describe('db/actions saveGuestbookEntry', () => {
  it('throws Unauthorized when no session', async () => {
    vi.doMock('app/auth', () => ({ auth: vi.fn(async () => null) }))
    vi.doMock('../app/db/actions', async (importOriginal) => {
      const actual = await importOriginal<any>()
      return { ...actual }
    })
    const { saveGuestbookEntry } = await import('../app/db/actions')
    await expect(saveGuestbookEntry(new FormData())).rejects.toThrow('Unauthorized')
  })

  it('creates entry and sends email on success', async () => {
    process.env.DATABASE_URL = 'postgres://test'
    process.env.RESEND_SECRET = 'x'
    vi.doMock('app/auth', () => ({ auth: vi.fn(async () => ({ user: { email: 'a@b.c', name: 'Alice' } })) }))
    vi.doMock('app/db/postgres', () => ({ sql: vi.fn(async () => {}) }))
    vi.doMock('next/cache', () => ({ unstable_noStore: () => {}, revalidatePath: vi.fn() }))
    vi.spyOn(global, 'fetch').mockResolvedValue({ json: async () => ({ statusCode: 0, id: 'ok' }) } as any)

    vi.doMock('../app/db/actions', async (importOriginal) => {
      const actual = await importOriginal<any>()
      return { ...actual }
    })
    const { saveGuestbookEntry } = await import('../app/db/actions')
    const fd = new FormData()
    fd.set('entry', 'Hello there!')
    await expect(saveGuestbookEntry(fd)).resolves.toBeUndefined()
    expect(global.fetch).toHaveBeenCalled()
  })
})

describe('db/actions sendEmail', () => {
  it('throws with message when Resend returns error', async () => {
    process.env.RESEND_SECRET = 'x'
    vi.spyOn(global, 'fetch').mockResolvedValue({ json: async () => ({ statusCode: 400, message: 'Bad' }) } as any)
    vi.doMock('../app/db/actions', async (importOriginal) => {
      const actual = await importOriginal<any>()
      return { ...actual }
    })
    const { sendEmail } = await import('../app/db/actions')
    const fd = new FormData(); fd.set('message', 'm'); fd.set('email', 'e')
    await expect(sendEmail(fd)).rejects.toThrow('Bad')
  })

  it('returns response on success', async () => {
    process.env.RESEND_SECRET = 'x'
    vi.spyOn(global, 'fetch').mockResolvedValue({ json: async () => ({ statusCode: 0, id: '123' }) } as any)
    vi.doMock('../app/db/actions', async (importOriginal) => {
      const actual = await importOriginal<any>()
      return { ...actual }
    })
    const { sendEmail } = await import('../app/db/actions')
    const fd = new FormData(); fd.set('message', 'm'); fd.set('email', 'e')
    await expect(sendEmail(fd)).resolves.toEqual({ statusCode: 0, id: '123' })
  })
})

describe('db/actions deleteGuestbookEntries', () => {
  it('throws Unauthorized for non-admin', async () => {
    vi.doMock('app/auth', () => ({ auth: vi.fn(async () => ({ user: { email: 'user@ex.com' } })) }))
    vi.doMock('../app/db/actions', async (importOriginal) => {
      const actual = await importOriginal<any>()
      return { ...actual }
    })
    const { deleteGuestbookEntries } = await import('../app/db/actions')
    await expect(deleteGuestbookEntries(['1'])).rejects.toThrow('Unauthorized')
  })

  it('deletes entries and revalidates cache for admin', async () => {
    process.env.DATABASE_URL = 'postgres://test'
    vi.doMock('app/auth', () => ({ auth: vi.fn(async () => ({ user: { email: 's.ainsworth@me.com' } })) }))
    const sql = vi.fn(async () => {})
    vi.doMock('app/db/postgres', () => ({ sql }))
    const revalidatePath = vi.fn()
    vi.doMock('next/cache', () => ({ unstable_noStore: () => {}, revalidatePath }))
    vi.doMock('../app/db/actions', async (importOriginal) => {
      const actual = await importOriginal<any>()
      return { ...actual }
    })
    const { deleteGuestbookEntries } = await import('../app/db/actions')
    await deleteGuestbookEntries(['1','2'])
    expect(sql).toHaveBeenCalled()
    expect(revalidatePath).toHaveBeenCalledTimes(2)
  })
})
