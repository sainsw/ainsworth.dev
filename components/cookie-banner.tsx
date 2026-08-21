'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useConsent } from '@/lib/consent';

export function CookieConsent() {
  const { status, accept, decline } = useConsent();
  const [isOpen, setIsOpen] = useState(false);
  const [hide, setHide] = useState(status !== 'pending');
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (status !== 'pending') {
      setHide(true);
      return;
    }
    if (process.env.NODE_ENV === 'test') {
      setShouldRender(true);
      setIsOpen(true);
      return;
    }
    const timer = setTimeout(() => {
      setShouldRender(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsOpen(true);
        });
      });
    }, 2000);
    return () => clearTimeout(timer);
  }, [status]);

  const handleAccept = useCallback(() => {
    setIsOpen(false);
    accept();
    if (process.env.NODE_ENV === 'test') {
      setHide(true);
    } else {
      setTimeout(() => setHide(true), 700);
    }
  }, [accept]);

  const handleDecline = useCallback(() => {
    setIsOpen(false);
    decline();
    if (process.env.NODE_ENV === 'test') {
      setHide(true);
    } else {
      setTimeout(() => setHide(true), 700);
    }
  }, [decline]);

  if (!shouldRender || hide) {
    return null;
  }

  return (
    <div
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
            <Button
              size="sm"
              variant="outline"
              onClick={handleDecline}
              aria-label="Decline"
            >
              Decline
            </Button>
            <Button size="sm" onClick={handleAccept} aria-label="Accept">
              Accept
            </Button>
            <a
              href="/privacy"
              className="ms-auto text-xs underline underline-offset-2 text-foreground hover:text-muted-foreground transition-colors"
              aria-label="Privacy policy"
            >
              Privacy policy
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
