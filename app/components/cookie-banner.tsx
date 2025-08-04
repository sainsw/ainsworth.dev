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
  const [isVisible, setIsVisible] = useState(false)

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
      if (document.cookie.includes('cookie-consent=') && !demo) {
        setIsOpen(false)
        setHide(true)
        return
      }
      
      // Show banner after 2 seconds delay like Vercel
      const timer = setTimeout(() => {
        setIsOpen(true)
        // Trigger slide animation after DOM update
        requestAnimationFrame(() => {
          setIsVisible(true)
        })
      }, 2000)
      
      return () => clearTimeout(timer)
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
        className={`fixed z-50 transition-all duration-700 ease-out left-4 bottom-4 max-w-sm ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
        style={{
          transform: isVisible ? 'translateY(0)' : 'translateY(100%)',
          transition: 'all 0.7s ease-out'
        }}
      >
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-lg p-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {description}
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleDecline}
                className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 rounded-full transition-colors"
              >
                Deny
              </button>
              <button
                onClick={handleAccept}
                className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 rounded-full transition-colors"
              >
                Accept all
              </button>
              <button
                onClick={handleAccept}
                className="px-6 py-2 text-sm font-medium text-white rounded-full transition-colors"
                style={{
                  backgroundColor: '#000000',
                  color: '#ffffff'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1f1f1f'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#000000'
                }}
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