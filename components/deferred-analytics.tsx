'use client';

import { Analytics } from '@vercel/analytics/react';
import { useConsent } from '@/lib/consent';

export function DeferredAnalytics() {
  const { status } = useConsent();

  if (status !== 'accepted') {
    return null;
  }

  return <Analytics />;
}
