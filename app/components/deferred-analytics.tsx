'use client';

import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { useEffect, useState } from 'react';

export function DeferredAnalytics() {
  const [mounted, setMounted] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);

  useEffect(() => {
    // Check for cookie consent
    const checkConsent = () => {
      const cookieConsent = document.cookie
        .split('; ')
        .find(row => row.startsWith('cookie-consent='));
      
      const consentValue = cookieConsent?.split('=')[1];
      return consentValue === 'accepted';
    };

    // Defer analytics loading until after initial render and layout
    const loadAnalytics = () => {
      if (checkConsent()) {
        setConsentGiven(true);
        setMounted(true);
      }
    };

    // Initial check
    loadAnalytics();

    // Listen for consent changes
    const handleConsentChange = () => {
      loadAnalytics();
    };

    // Listen for custom consent events
    window.addEventListener('cookie-consent-accepted', handleConsentChange);
    
    // Use requestIdleCallback if available, otherwise fallback to setTimeout
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      const idleCallback = window.requestIdleCallback(loadAnalytics, { timeout: 500 });
      return () => {
        window.removeEventListener('cookie-consent-accepted', handleConsentChange);
        window.cancelIdleCallback(idleCallback);
      };
    } else {
      const timer = setTimeout(loadAnalytics, 200);
      return () => {
        window.removeEventListener('cookie-consent-accepted', handleConsentChange);
        clearTimeout(timer);
      };
    }
  }, []);

  // Only render analytics if consent is given and component is mounted
  if (!mounted || !consentGiven) {
    return null;
  }

  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
