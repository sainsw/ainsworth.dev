import { beforeEach, describe, expect, it, vi } from 'vitest';

const incrementView = vi.fn(async () => {});

beforeEach(() => {
  vi.resetModules();
  incrementView.mockClear();
  vi.doMock('../lib/content/blog', () => ({
    getBlogPosts: vi.fn(() => [{ slug: 'hello-world' }]),
  }));
  vi.doMock('../app/db/views', () => ({ incrementView }));
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
    expect(incrementView).not.toHaveBeenCalled();
  });

  it('increments a known post and sets an HttpOnly throttle cookie', async () => {
    const { POST } = await import('../app/api/views/[slug]/route');
    const response = await POST(createRequest() as any, {
      params: Promise.resolve({ slug: 'hello-world' }),
    });

    expect(response.status).toBe(204);
    expect(incrementView).toHaveBeenCalledWith('hello-world');
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
    expect(incrementView).not.toHaveBeenCalled();
  });
});
