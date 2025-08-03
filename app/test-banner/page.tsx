'use client'

import { CookieConsent } from '../components/cookie-banner'
import { useEffect, useState } from 'react'

export default function TestBannerPage() {
  const [cookies, setCookies] = useState('')

  useEffect(() => {
    setCookies(document.cookie)
  }, [])

  const clearConsent = () => {
    document.cookie = 'cookie-consent=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    setCookies(document.cookie)
    window.location.reload()
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Cookie Banner Test Page</h1>
      <p className="mb-4">This page tests the cookie banner component.</p>
      <p className="mb-4">Check the bottom-left corner for the cookie banner.</p>
      
      <div className="mt-8 p-4 border rounded">
        <h2 className="text-lg font-semibold mb-2">Debug Info</h2>
        <p className="mb-2">Current cookies: {cookies || 'No cookies'}</p>
        <button 
          onClick={clearConsent}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Clear Cookie Consent & Reload
        </button>
      </div>
      
      <CookieConsent variant="mini" learnMoreHref="/privacy" />
    </div>
  )
}