'use client'

import { useState, useEffect, useCallback } from 'react'

interface CookieConsentProps {
  variant?: 'default' | 'small' | 'mini'
  demo?: boolean
  onAcceptCallback?: () => void
  onDeclineCallback?: () => void
  description?: string
  learnMoreHref?: string
}

export function CookieConsent({
  variant = 'mini',
  demo = false,
  onAcceptCallback = () => {},
  onDeclineCallback = () => {},
  description = 'This site uses tracking technologies. You may opt in or opt out of the use of these technologies.',
  learnMoreHref = '/privacy'
}: CookieConsentProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [hide, setHide] = useState(false)

  const handleAccept = useCallback(() => {
    setIsOpen(false)
    document.cookie = 'cookie-consent=accepted; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/; SameSite=Lax'
    setTimeout(() => {
      setHide(true)
    }, 700)
    
    // Notify analytics component
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cookie-consent-accepted'))
    }
    
    // Enable Cloudflare Zaraz tracking
    if (typeof window !== 'undefined' && window.zaraz) {
      window.zaraz.consent.granted()
    }
    
    onAcceptCallback()
  }, [onAcceptCallback])

  const handleDecline = useCallback(() => {
    setIsOpen(false)
    document.cookie = 'cookie-consent=declined; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/; SameSite=Lax'
    setTimeout(() => {
      setHide(true)
    }, 700)
    
    // Ensure Zaraz tracking stays disabled
    if (typeof window !== 'undefined' && window.zaraz) {
      window.zaraz.consent.revoked()
    }
    
    onDeclineCallback()
  }, [onDeclineCallback])

  useEffect(() => {
    try {
      setIsOpen(true)
      if (document.cookie.includes('cookie-consent=') && !demo) {
        setIsOpen(false)
        setHide(true)
      }
    } catch (e) {
      console.log('Error checking cookies:', e)
    }
  }, [])

  if (!isOpen || hide) {
    return null
  }

  if (variant === 'mini') {
    return (
      <div 
        className={`fixed z-50 transition-all duration-700 ${
          isOpen ? 'bottom-0 left-0 right-0 sm:left-4 sm:bottom-4' : 'bottom-[-100px]'
        } w-full sm:max-w-md`}
      >
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg m-4 p-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {description}
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleDecline}
                className="flex-1 px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-full transition-colors"
              >
                Deny
              </button>
              <button
                onClick={handleAccept}
                className="flex-1 px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-full transition-colors"
              >
                Accept all
              </button>
              <button
                onClick={handleAccept}
                className="px-6 py-2 text-sm font-medium text-white bg-neutral-900 dark:bg-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 rounded-full transition-colors"
              >
                Consent Settings
              </button>
            </div>
          </div>
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