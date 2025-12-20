'use client';

import { useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback?: (token: string) => void;
          'expired-callback'?: () => void;
          'error-callback'?: () => void;
          theme?: 'light' | 'dark' | 'auto';
          size?: 'normal' | 'compact' | 'flexible';
          execution?: 'render' | 'execute';
        }
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
      execute: (container: HTMLElement | string, options?: object) => void;
    };
    onTurnstileLoad?: () => void;
  }
}

export interface TurnstileRef {
  execute: () => Promise<string>;
  reset: () => void;
}

interface TurnstileProps {
  onVerify?: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
  theme?: 'light' | 'dark' | 'auto';
  invisible?: boolean;
  className?: string;
}

export const Turnstile = forwardRef<TurnstileRef, TurnstileProps>(
  function Turnstile(
    {
      onVerify,
      onExpire,
      onError,
      theme = 'auto',
      invisible = false,
      className,
    },
    ref
  ) {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);
    const scriptLoadedRef = useRef(false);
    const resolveTokenRef = useRef<((token: string) => void) | null>(null);

    const handleVerify = useCallback(
      (token: string) => {
        onVerify?.(token);
        // Resolve any pending execute() promise
        if (resolveTokenRef.current) {
          resolveTokenRef.current(token);
          resolveTokenRef.current = null;
        }
      },
      [onVerify]
    );

    const renderWidget = useCallback(() => {
      if (!containerRef.current || !window.turnstile || widgetIdRef.current) {
        return;
      }

      const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
      if (!siteKey) {
        console.error('Turnstile site key not configured');
        return;
      }

      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: handleVerify,
        'expired-callback': onExpire,
        'error-callback': onError,
        theme,
        // Note: "invisible" mode is determined by the sitekey type in Cloudflare dashboard,
        // not by size parameter. Use execution: 'execute' for on-demand triggering.
        execution: invisible ? 'execute' : 'render',
      });
    }, [handleVerify, onExpire, onError, theme, invisible]);

    // Expose execute() and reset() methods via ref
    useImperativeHandle(
      ref,
      () => ({
        execute: () => {
          return new Promise<string>((resolve, reject) => {
            if (!window.turnstile || !widgetIdRef.current) {
              reject(new Error('Turnstile not ready'));
              return;
            }
            resolveTokenRef.current = resolve;
            window.turnstile.execute(widgetIdRef.current);
          });
        },
        reset: () => {
          if (window.turnstile && widgetIdRef.current) {
            window.turnstile.reset(widgetIdRef.current);
          }
        },
      }),
      []
    );

    useEffect(() => {
      // If turnstile is already loaded, render immediately
      if (window.turnstile) {
        renderWidget();
        return;
      }

      // Check if script is already in the document
      if (document.querySelector('script[src*="turnstile"]')) {
        window.onTurnstileLoad = renderWidget;
        return;
      }

      // Load the Turnstile script
      if (!scriptLoadedRef.current) {
        scriptLoadedRef.current = true;
        const script = document.createElement('script');
        script.src =
          'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad';
        script.async = true;
        script.defer = true;
        window.onTurnstileLoad = renderWidget;
        document.head.appendChild(script);
      }

      return () => {
        if (widgetIdRef.current && window.turnstile) {
          window.turnstile.remove(widgetIdRef.current);
          widgetIdRef.current = null;
        }
      };
    }, [renderWidget]);

    return <div ref={containerRef} className={className} />;
  }
);
