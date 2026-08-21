import { beforeEach, describe, expect, it, vi } from 'vitest';

const recordView = vi.fn(async (_slug: string) => 'recorded' as const);

beforeEach(() => {
  vi.resetModules();
  recordView.mockClear();
  vi.doMock('../lib/content/blog', () => ({
    getBlogPost: vi.fn((slug: string) =>
      slug === 'hello-world' ? { slug: 'hello-world' } : undefined,
    ),
  }));
  vi.doMock('../lib/views', () => ({ recordView }));
});

function createRequest(hasCookie = false) {
  return {
    cookies: {
      has: vi.fn(() => hasCookie),
    },
  };
}

describe('view tracking route', () => {
  it('returns 404 for unknown posts', async () => {
    const { POST } = await import('../app/api/views/[slug]/route');
    const response = await POST(createRequest() as any, {
      params: Promise.resolve({ slug: 'missing' }),
    });

    expect(response.status).toBe(404);
    expect(recordView).not.toHaveBeenCalled();
  });

  it('increments a known post and sets an HttpOnly throttle cookie', async () => {
    const { POST } = await import('../app/api/views/[slug]/route');
    const response = await POST(createRequest() as any, {
      params: Promise.resolve({ slug: 'hello-world' }),
    });

    expect(response.status).toBe(204);
    expect(recordView).toHaveBeenCalledWith('hello-world');
    expect(response.headers.get('set-cookie')).toMatch(
      /viewed-hello-world=1.*HttpOnly.*SameSite=Lax/i,
    );
  });

  it('does not increment a post twice within the cookie window', async () => {
    const { POST } = await import('../app/api/views/[slug]/route');
    const response = await POST(createRequest(true) as any, {
      params: Promise.resolve({ slug: 'hello-world' }),
    });

    expect(response.status).toBe(204);
    expect(recordView).not.toHaveBeenCalled();
  });

  it('answers 503 when the counter is unavailable', async () => {
    recordView.mockResolvedValueOnce('unavailable' as never);
    const { POST } = await import('../app/api/views/[slug]/route');
    const response = await POST(createRequest() as any, {
      params: Promise.resolve({ slug: 'hello-world' }),
    });

    expect(response.status).toBe(503);
    expect(response.headers.get('set-cookie')).toBeNull();
  });
});
