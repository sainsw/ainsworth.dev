'use client';

import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { useEffect, useState } from 'react';

export function DeferredAnalytics() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Defer analytics loading until after initial render and layout
    const loadAnalytics = () => {
      setMounted(true);
    };

    // Use requestIdleCallback if available, otherwise fallback to setTimeout
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      const idleCallback = window.requestIdleCallback(loadAnalytics, { timeout: 500 });
      return () => window.cancelIdleCallback(idleCallback);
    } else {
      const timer = setTimeout(loadAnalytics, 200);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}