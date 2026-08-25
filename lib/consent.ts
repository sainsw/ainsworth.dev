import { useSyncExternalStore } from 'react';

export type ConsentStatus = 'pending' | 'accepted' | 'declined';

const COOKIE_NAME = 'cookie-consent';

let status: ConsentStatus = 'pending';
const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) {
    listener();
  }
}

function readCookie(): ConsentStatus {
  if (typeof document === 'undefined') return 'pending';
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${COOKIE_NAME}=`));
  const value = match?.split('=')[1];
  if (value === 'accepted') return 'accepted';
  if (value === 'declined') return 'declined';
  return 'pending';
}

function writeCookie(value: 'accepted' | 'declined') {
  const secure =
    typeof window !== 'undefined' && window.location.protocol === 'https:'
      ? '; Secure'
      : '';
  document.cookie = `${COOKIE_NAME}=${value}; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/; SameSite=Lax${secure}`;
}

function setStatus(next: ConsentStatus) {
  if (status !== next) {
    status = next;
    notify();
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (status === 'pending') {
    const cookie = readCookie();
    if (cookie !== 'pending') {
      status = cookie;
    }
  }
  return () => listeners.delete(listener);
}

function getSnapshot(): ConsentStatus {
  if (status === 'pending') {
    const cookie = readCookie();
    if (cookie !== 'pending') {
      status = cookie;
    }
  }
  return status;
}

function getServerSnapshot(): ConsentStatus {
  return 'pending';
}

/**
 * Zaraz loads on every page, but `zaraz.consent` only exists when the Zaraz
 * consent platform is switched on in the Cloudflare dashboard, and it is not.
 * Guarding on `window.zaraz` alone therefore passed and then threw a
 * TypeError on the next line, on every accept and every decline. Guard on the
 * thing being called, and let the optional `consent` in the type below keep it
 * that way.
 */
export function accept() {
  writeCookie('accepted');
  setStatus('accepted');
  if (typeof window !== 'undefined') {
    window.zaraz?.consent?.granted();
  }
}

export function decline() {
  writeCookie('declined');
  setStatus('declined');
  if (typeof window !== 'undefined') {
    window.zaraz?.consent?.revoked();
  }
}

export function useConsent() {
  const current = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  return { status: current, accept, decline } as const;
}

export function resetForTesting() {
  status = 'pending';
  listeners.clear();
}

declare global {
  interface Window {
    zaraz?: {
      // Optional: present only when the Cloudflare consent platform is on.
      consent?: {
        granted: () => void;
        revoked: () => void;
      };
      track: (event: string, properties?: Record<string, unknown>) => void;
    };
  }
}
