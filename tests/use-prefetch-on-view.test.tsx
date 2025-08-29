import { render } from '@testing-library/react'
import React from 'react'
import { usePrefetchOnView } from '../app/hooks/use-prefetch-on-view'

// Mock IntersectionObserver
class MockIntersectionObserver {
  cb: IntersectionObserverCallback
  constructor(cb: IntersectionObserverCallback) {
    this.cb = cb
  }
  observe = (el: Element) => {
    // Trigger an intersecting entry immediately
    this.cb([{ isIntersecting: true } as IntersectionObserverEntry], this as any)
  }
  unobserve = () => {}
  disconnect = () => {}
  takeRecords = () => []
  root = null
  rootMargin = ''
  thresholds = []
}

// @ts-ignore
global.IntersectionObserver = MockIntersectionObserver

describe('usePrefetchOnView', () => {
  beforeEach(() => {
    document.head.querySelectorAll('link[rel="prefetch"]').forEach((el) => el.parentElement?.removeChild(el))
    vi.spyOn(global, 'fetch').mockResolvedValue({} as any)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  function TestComp() {
    const ref = usePrefetchOnView('/cv.pdf')
    return <li ref={ref}>item</li>
  }

  it('prefetches via fetch and appends link', async () => {
    render(<TestComp />)
    // fetch called once
    expect(global.fetch).toHaveBeenCalledWith('/cv.pdf', expect.objectContaining({ method: 'GET' }))
    // link element added
    const link = document.head.querySelector('link[rel="prefetch"][href="/cv.pdf"]')
    expect(link).not.toBeNull()
  })
})

