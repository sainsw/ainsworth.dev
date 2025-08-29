import { render } from '@testing-library/react'
import React from 'react'
import { DeferredAnalytics } from '../app/components/deferred-analytics'

// Mock the Analytics component to a simple marker div
vi.mock('@vercel/analytics/react', () => ({
  Analytics: () => React.createElement('div', { 'data-testid': 'analytics' }),
}))

// Polyfill requestIdleCallback/cancelIdleCallback
beforeAll(() => {
  // @ts-ignore
  global.requestIdleCallback = (cb: any) => setTimeout(() => cb({ didTimeout: false, timeRemaining: () => 50 }), 0)
  // @ts-ignore
  global.cancelIdleCallback = (id: any) => clearTimeout(id)
})

describe('DeferredAnalytics', () => {
  const clearConsent = () => {
    // Expire any existing cookie-consent cookie
    document.cookie = 'cookie-consent=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
  }

  beforeEach(() => {
    clearConsent()
  })

  it('does not render when consent not given', () => {
    const { queryByTestId } = render(<DeferredAnalytics />)
    expect(queryByTestId('analytics')).toBeNull()
  })

  it('renders when consent cookie is accepted', async () => {
    document.cookie = 'cookie-consent=accepted'
    const { findByTestId } = render(<DeferredAnalytics />)
    expect(await findByTestId('analytics')).toBeInTheDocument()
  })

  it('renders after consent acceptance event', async () => {
    const { queryByTestId, findByTestId } = render(<DeferredAnalytics />)
    // Ensure no cookie prior to event
    expect(document.cookie.includes('cookie-consent=accepted')).toBe(false)
    expect(queryByTestId('analytics')).toBeNull()

    // Simulate user accepting cookies and dispatch event
    document.cookie = 'cookie-consent=accepted'
    window.dispatchEvent(new Event('cookie-consent-accepted'))
    expect(await findByTestId('analytics')).toBeInTheDocument()
  })
})
