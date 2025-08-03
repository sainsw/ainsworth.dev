import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import { CookieConsent } from '../app/components/cookie-banner'

// Mock document.cookie
Object.defineProperty(document, 'cookie', {
  writable: true,
  value: '',
})

describe('CookieConsent', () => {
  beforeEach(() => {
    // Clear cookies before each test
    document.cookie = ''
    // Clear localStorage
    localStorage.clear()
  })

  it('renders when no consent cookie exists', () => {
    render(<CookieConsent variant="mini" />)
    
    expect(screen.getByText(/We use cookies to enhance/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /accept/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /decline/i })).toBeInTheDocument()
  })

  it('does not render when consent cookie exists', () => {
    // Set cookie to accepted
    document.cookie = 'cookie-consent=accepted'
    
    render(<CookieConsent variant="mini" />)
    
    expect(screen.queryByText(/We use cookies to enhance/)).not.toBeInTheDocument()
  })

  it('sets cookie and hides banner when accept is clicked', () => {
    render(<CookieConsent variant="mini" />)
    
    const acceptButton = screen.getByRole('button', { name: /accept/i })
    fireEvent.click(acceptButton)
    
    expect(document.cookie).toContain('cookie-consent=accepted')
    expect(screen.queryByText(/We use cookies to enhance/)).not.toBeInTheDocument()
  })

  it('sets cookie and hides banner when decline is clicked', () => {
    render(<CookieConsent variant="mini" />)
    
    const declineButton = screen.getByRole('button', { name: /decline/i })
    fireEvent.click(declineButton)
    
    expect(document.cookie).toContain('cookie-consent=declined')
    expect(screen.queryByText(/We use cookies to enhance/)).not.toBeInTheDocument()
  })

  it('dispatches custom event when accept is clicked', () => {
    const mockDispatchEvent = vi.spyOn(window, 'dispatchEvent')
    
    render(<CookieConsent variant="mini" />)
    
    const acceptButton = screen.getByRole('button', { name: /accept/i })
    fireEvent.click(acceptButton)
    
    expect(mockDispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'cookie-consent-accepted'
      })
    )
    
    mockDispatchEvent.mockRestore()
  })
})