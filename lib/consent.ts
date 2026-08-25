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

// The cookie is the whole mechanism. Zaraz used to be signalled here too, but
// it was switched off at the edge on 2026-08-25 and the call went with it.
// What consent still gates is components/deferred-analytics.tsx, which reads
// this status before loading Vercel Analytics and Speed Insights.
export function accept() {
  writeCookie('accepted');
  setStatus('accepted');
}

export function decline() {
  writeCookie('declined');
  setStatus('declined');
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
