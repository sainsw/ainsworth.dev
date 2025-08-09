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

  it('applies hover styles on Accept button via mouse events', () => {
    render(<CookieConsent variant="mini" />)

    const acceptButton = screen.getByRole('button', { name: /accept/i })
    // Initially not hovered
    expect(acceptButton).not.toHaveClass('bg-black')
    expect(acceptButton).not.toHaveClass('text-white')

    // Simulate hover
    fireEvent.mouseEnter(acceptButton)
    expect(acceptButton).toHaveClass('bg-black')
    expect(acceptButton).toHaveClass('text-white')

    // Simulate leaving hover
    fireEvent.mouseLeave(acceptButton)
    expect(acceptButton).not.toHaveClass('bg-black')
    expect(acceptButton).not.toHaveClass('text-white')
  })

  it('applies hover styles on Decline button via mouse events', () => {
    render(<CookieConsent variant="mini" />)

    const declineButton = screen.getByRole('button', { name: /decline/i })
    // Initially not hovered
    expect(declineButton).not.toHaveClass('bg-black')
    expect(declineButton).not.toHaveClass('text-white')

    // Simulate hover
    fireEvent.mouseEnter(declineButton)
    expect(declineButton).toHaveClass('bg-black')
    expect(declineButton).toHaveClass('text-white')

    // Simulate leaving hover
    fireEvent.mouseLeave(declineButton)
    expect(declineButton).not.toHaveClass('bg-black')
    expect(declineButton).not.toHaveClass('text-white')
  })
})
