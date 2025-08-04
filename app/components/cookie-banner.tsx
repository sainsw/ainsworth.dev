'use client'

import { useState, useEffect } from 'react'

interface CookieConsentProps {
  variant?: 'default' | 'small' | 'mini'
  onAcceptCallback?: () => void
  onDeclineCallback?: () => void
  description?: string
  learnMoreHref?: string
}

export function CookieConsent({
  variant = 'mini',
  onAcceptCallback,
  onDeclineCallback,
  description = 'We use cookies to ensure you get the best experience on our website. For more information on how we use cookies, please see our cookie policy.',
  learnMoreHref = '/privacy'
}: CookieConsentProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [hide, setHide] = useState(false)

  useEffect(() => {
    // Check if user has already made a choice
    const cookieConsent = document.cookie
      .split('; ')
      .find(row => row.startsWith('cookie-consent='))

    if (!cookieConsent) {
      setIsOpen(true)
    }
  }, [])

  const acceptCookies = () => {
    // Set cookie for 1 year
    const expiryDate = new Date()
    expiryDate.setFullYear(expiryDate.getFullYear() + 1)
    document.cookie = `cookie-consent=accepted; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`
    
    setIsOpen(false)
    setHide(true)
    
    // Notify analytics component
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cookie-consent-accepted'))
    }
    
    // Enable Cloudflare Zaraz tracking
    if (typeof window !== 'undefined' && window.zaraz) {
      window.zaraz.consent.granted()
    }
    
    onAcceptCallback?.()
  }

  const declineCookies = () => {
    // Set cookie for 1 year
    const expiryDate = new Date()
    expiryDate.setFullYear(expiryDate.getFullYear() + 1)
    document.cookie = `cookie-consent=declined; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`
    
    setIsOpen(false)
    setHide(true)
    
    // Ensure Zaraz tracking stays disabled
    if (typeof window !== 'undefined' && window.zaraz) {
      window.zaraz.consent.revoked()
    }
    
    onDeclineCallback?.()
  }

  if (!isOpen || hide) {
    return null
  }

  if (variant === 'mini') {
    return (
      <div 
        className="fixed bottom-4 left-4 z-[9999] max-w-sm"
        style={{ 
          position: 'fixed',
          bottom: '1rem',
          left: '1rem',
          zIndex: 9999
        }}
      >
        <div className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg backdrop-blur-sm p-4">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-3">
                {description}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={acceptCookies}
                  className="px-4 py-2 bg-neutral-900 dark:bg-neutral-50 text-white dark:text-neutral-900 text-sm rounded-md hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors font-medium"
                >
                  Accept
                </button>
                <button
                  onClick={declineCookies}
                  className="px-4 py-2 border border-neutral-200 dark:border-neutral-700 bg-transparent text-sm text-neutral-700 dark:text-neutral-300 rounded-md hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors font-medium"
                >
                  Decline
                </button>
              </div>
            </div>
            <button
              onClick={declineCookies}
              className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1"
              aria-label="Close"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {learnMoreHref && (
            <a
              href={learnMoreHref}
              className="text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors mt-2 inline-block underline underline-offset-2"
            >
              cookie policy
            </a>
          )}
        </div>
      </div>
    )
  }

  // Default/small variants can be added here if needed
  return null
}

// Type declaration for Zaraz
declare global {
  interface Window {
    zaraz?: {
      consent: {
        granted: () => void
        revoked: () => void
      }
      track: (event: string, properties?: Record<string, any>) => void
    }
  }
}