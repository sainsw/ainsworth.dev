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
  description = 'We use cookies to enhance your experience, analyze traffic, and for marketing.',
  learnMoreHref = '/privacy'
}: CookieConsentProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [hide, setHide] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)

  const handleAccept = useCallback(() => {
    setIsOpen(false)
    document.cookie = 'cookie-consent=accepted; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/; SameSite=Lax'
    if (process.env.NODE_ENV === 'test') {
      setHide(true)
    } else {
      setTimeout(() => {
        setHide(true)
      }, 700)
    }
    
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
    if (process.env.NODE_ENV === 'test') {
      setHide(true)
    } else {
      setTimeout(() => {
        setHide(true)
      }, 700)
    }
    
    // Ensure Zaraz tracking stays disabled
    if (typeof window !== 'undefined' && window.zaraz) {
      window.zaraz.consent.revoked()
    }
    
    onDeclineCallback()
  }, [onDeclineCallback])


  useEffect(() => {
    try {
      if (document.cookie.includes('cookie-consent=') && !demo) {
        setIsOpen(false)
        setHide(true)
        return
      }
      // In tests, show banner immediately without delay
      if (process.env.NODE_ENV === 'test') {
        setShouldRender(true)
        setIsOpen(true)
        return
      }
      // Show banner after 2 seconds delay like Vercel
      const timer = setTimeout(() => {
        setShouldRender(true)
        // Trigger animation after DOM render
        requestAnimationFrame(() => {
          setIsOpen(true)
        })
      }, 2000)
      return () => clearTimeout(timer)
    } catch (e) {
      console.log('Error checking cookies:', e)
    }
  }, [])

  if (!shouldRender || hide) {
    return null
  }

  if (variant === 'mini') {
    return (
      <div 
        className={`transition-all duration-700 ease-out max-w-sm ${
          isOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
        style={{
          position: 'fixed',
          left: '1rem', 
          bottom: '1rem',
          zIndex: 9999
        }}
      >
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-lg p-4 sm:p-5">
          <div className="space-y-3">
            <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
              {description}
              {learnMoreHref && (
                <>
                  {' '}<a
                    href={learnMoreHref}
                    className="underline underline-offset-2 text-neutral-900 dark:text-neutral-100 hover:opacity-80"
                  >
                    Learn more
                  </a>
                </>
              )}
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleDecline}
                className="px-4 py-2 text-sm font-medium rounded-full border border-neutral-300 text-neutral-800 bg-white hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 transition-colors"
                aria-label="Decline"
              >
                Decline
              </button>
              <button
                onClick={handleAccept}
                className="px-5 py-2 text-sm font-medium rounded-full text-white bg-black hover:bg-neutral-900 transition-colors"
                aria-label="Accept"
              >
                Accept
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
