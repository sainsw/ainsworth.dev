import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const origEnv = { ...process.env };
const cookieStore = {
  has: vi.fn(() => false),
  set: vi.fn(),
};

beforeEach(() => {
  vi.resetModules();
  vi.doUnmock('app/db/actions');
  vi.doUnmock('../app/db/actions');
  process.env = {
    ...origEnv,
    RESEND_SECRET: 'resend-secret',
    TURNSTILE_SECRET_KEY: 'turnstile-secret',
  };
  cookieStore.has.mockReturnValue(false);
  cookieStore.set.mockClear();
  vi.doMock('next/headers', () => ({
    cookies: vi.fn(async () => cookieStore),
  }));
});

afterEach(() => {
  process.env = { ...origEnv };
  vi.restoreAllMocks();
});

function createFormData({
  email = 'sam@example.com',
  message = 'hello',
  token = 'turnstile-token',
} = {}) {
  const formData = new FormData();
  formData.set('email', email);
  formData.set('message', message);
  formData.set('cf-turnstile-response', token);
  return formData;
}

describe('submitContact', () => {
  it('rejects submissions without a Turnstile token', async () => {
    const { submitContact } = await import('../app/db/actions');
    const result = await submitContact(
      undefined,
      createFormData({ token: '' }),
    );

    expect(result.success).toBe(false);
    expect(result.message).toMatch(/verification challenge/i);
  });

  it('rejects invalid email addresses after verification', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ success: true }), { status: 200 }),
    );
    const { submitContact } = await import('../app/db/actions');
    const result = await submitContact(
      undefined,
      createFormData({ email: 'not-an-email' }),
    );

    expect(result.success).toBe(false);
    expect(result.message).toMatch(/valid email/i);
  });

  it('sends verified submissions and applies a cooldown cookie', async () => {
    const fetchSpy = vi
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ success: true }), { status: 200 }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ id: 'email-id' }), { status: 200 }),
      );
    const { submitContact } = await import('../app/db/actions');
    const result = await submitContact(undefined, createFormData());

    expect(result.success).toBe(true);
    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(cookieStore.set).toHaveBeenCalledWith(
      'contact-submitted',
      '1',
      expect.objectContaining({ httpOnly: true, maxAge: 60 }),
    );
  });

  it('rejects submissions during the cooldown period', async () => {
    cookieStore.has.mockReturnValue(true);
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ success: true }), { status: 200 }),
    );
    const { submitContact } = await import('../app/db/actions');
    const result = await submitContact(undefined, createFormData());

    expect(result.success).toBe(false);
    expect(result.message).toMatch(/wait a minute/i);
  });
});
