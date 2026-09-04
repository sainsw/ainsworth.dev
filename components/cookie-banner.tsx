'use client';

import { useCallback } from 'react';
import { useRevealTimer } from '@/app/hooks/use-reveal-timer';
import { Button } from '@/components/ui/button';
import { useConsent } from '@/lib/consent';

const REVEAL_DELAY_MS = 2000;
// Must match the duration-700 class below, which is what actually animates.
const EXIT_DURATION_MS = 700;

export function CookieConsent() {
  const { status, accept, decline } = useConsent();
  const { shouldRender, isOpen, dismiss } = useRevealTimer({
    enabled: status === 'pending',
    delayMs: REVEAL_DELAY_MS,
    exitMs: EXIT_DURATION_MS,
  });

  const handleAccept = useCallback(() => {
    accept();
    dismiss();
  }, [accept, dismiss]);

  const handleDecline = useCallback(() => {
    decline();
    dismiss();
  }, [decline, dismiss]);

  if (!shouldRender) {
    return null;
  }

  return (
    // A named region, not a bare div. The banner renders last in <body>, so
    // outside every landmark: axe flags the content as unreachable by landmark
    // navigation, and there was nothing to tell a screen reader user what the
    // two buttons at the end of the page were for.
    <section
      aria-label="Cookie consent"
      className={`transition-all duration-700 ease-out max-w-sm transform-gpu ${
        isOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      }`}
      style={{
        position: 'fixed',
        left: '1rem',
        bottom: '1rem',
        zIndex: 9999,
        willChange: 'transform, opacity',
        WebkitBackfaceVisibility: 'hidden',
        backfaceVisibility: 'hidden',
      }}
    >
      <div className="bg-card border border-border rounded-none ring-1 ring-foreground/10 p-4 sm:p-5">
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground leading-relaxed">
            I use cookies to analyse traffic and provide features
          </p>
          <div className="flex items-center flex-wrap gap-3 mt-4">
            {/* No aria-label: the visible text is already the name, and a
                label that duplicates it only goes stale. */}
            <Button size="sm" variant="outline" onClick={handleDecline}>
              Decline
            </Button>
            <Button size="sm" onClick={handleAccept}>
              Accept
            </Button>
            <a
              href="/privacy"
              className="ms-auto text-xs underline underline-offset-2 text-foreground hover:text-muted-foreground transition-colors"
            >
              Privacy policy
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
