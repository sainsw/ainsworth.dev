import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const origEnv = { ...process.env };

beforeEach(() => {
  vi.resetModules();
  process.env = { ...origEnv };
});

afterEach(() => {
  process.env = { ...origEnv };
  vi.restoreAllMocks();
});

describe('db/actions increment', () => {
  it('no-ops when DATABASE_URL is missing', async () => {
    delete process.env.DATABASE_URL;
    vi.doMock('app/db/postgres', () => ({ sql: vi.fn(async () => {}) }));
    vi.doMock('../app/db/actions', async (importOriginal) => {
      const actual = await importOriginal<any>();
      return { ...actual };
    });
    const { increment } = await import('../app/db/actions');
    await expect(increment('slug-1')).resolves.toBeUndefined();
    const { sql } = (await import('app/db/postgres')) as any;
    expect(sql).not.toHaveBeenCalled();
  });

  it('logs and does not throw on SQL error', async () => {
    process.env.DATABASE_URL = 'postgres://test';
    const sql = vi.fn(async () => {
      throw new Error('db down');
    });
    vi.doMock('app/db/postgres', () => ({ sql }));
    vi.doMock('next/cache', () => ({ revalidatePath: vi.fn() }));
    vi.doMock('next/server', () => ({ connection: async () => {} }));
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.doMock('../app/db/actions', async (importOriginal) => {
      const actual = await importOriginal<any>();
      return { ...actual };
    });
    const { increment } = await import('../app/db/actions');
    await expect(increment('slug-2')).resolves.toBeUndefined();
    expect(sql).toHaveBeenCalled();
    expect(errSpy).toHaveBeenCalled();
  });
});

describe('db/actions sendEmail', () => {
  it('throws with message when Resend returns error', async () => {
    process.env.RESEND_SECRET = 'x';
    vi.spyOn(global, 'fetch').mockResolvedValue({
      json: async () => ({ statusCode: 400, message: 'Bad' }),
    } as any);
    vi.doMock('../app/db/actions', async (importOriginal) => {
      const actual = await importOriginal<any>();
      return { ...actual };
    });
    const { sendEmail } = await import('../app/db/actions');
    const fd = new FormData();
    fd.set('message', 'm');
    fd.set('email', 'e');
    await expect(sendEmail(fd)).rejects.toThrow('Bad');
  });

  it('returns response on success', async () => {
    process.env.RESEND_SECRET = 'x';
    vi.spyOn(global, 'fetch').mockResolvedValue({
      json: async () => ({ statusCode: 0, id: '123' }),
    } as any);
    vi.doMock('../app/db/actions', async (importOriginal) => {
      const actual = await importOriginal<any>();
      return { ...actual };
    });
    const { sendEmail } = await import('../app/db/actions');
    const fd = new FormData();
    fd.set('message', 'm');
    fd.set('email', 'e');
    await expect(sendEmail(fd)).resolves.toEqual({ statusCode: 0, id: '123' });
  });
});
