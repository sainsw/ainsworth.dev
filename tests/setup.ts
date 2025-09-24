import '@testing-library/jest-dom'
import React from 'react'

// Mock React cache function
vi.mock('react', async () => {
  const actual = await vi.importActual('react')
  return {
    ...actual,
    cache: (fn: any) => fn, // Simple pass-through for cache
  }
})

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
  notFound: vi.fn(),
  useServerInsertedHTML: () => {},
  redirect: vi.fn(),
}))

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: (props: any) => React.createElement('img', props),
}))

// Mock Next.js Link component: filter non-DOM props like `prefetch`
vi.mock('next/link', () => ({
  default: ({ children, prefetch, ...props }: any) => React.createElement('a', props, children),
}))

// Mock react-dom server actions helpers used in forms
vi.mock('react-dom', async () => {
  const actual: any = await vi.importActual('react-dom')
  return {
    ...actual,
    useFormStatus: () => ({ pending: false }),
  }
})

// Mock problematic components
vi.mock('app/components/tweet', () => ({
  TweetComponent: () => React.createElement('div', null, 'Tweet Component'),
}))

vi.mock('app/components/sandpack', () => ({
  LiveCode: () => React.createElement('div', null, 'Live Code'),
}))

// Mock database functions
vi.mock('app/db/queries', () => ({
  getViewsCount: vi.fn().mockResolvedValue([]),
}))

vi.mock('app/db/actions', () => ({
  increment: vi.fn().mockResolvedValue(undefined),
  submitContact: vi.fn().mockResolvedValue({ success: true, message: 'ok' }),
}))

vi.mock('app/db/blog', () => ({
  getBlogPosts: vi.fn().mockReturnValue([
    {
      slug: 'test-post',
      metadata: {
        title: 'Test Post',
        publishedAt: '2024-01-01',
        summary: 'A test post',
      },
      content: 'Test content',
    },
  ]),
}))
