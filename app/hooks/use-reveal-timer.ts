'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type RevealTimer = {
  /** False until the delay elapses, and false again once the exit finishes. */
  shouldRender: boolean;
  /** Drives the enter and exit transition. False for the first paint. */
  isOpen: boolean;
  /** Starts the exit transition. Unmounts after exitMs. */
  dismiss: () => void;
};

/**
 * The choreography behind a thing that slides in a while after load and slides
 * out when dismissed. It knows about time and nothing about what it is
 * revealing, so the caller keeps one obvious line of `accept(); dismiss();`.
 *
 * `enabled` gates the start only. Once the sequence is running, dismissal is
 * the caller's to trigger — otherwise accepting would flip `enabled` false and
 * tear the element off screen mid-transition.
 */
export function useRevealTimer({
  enabled,
  delayMs,
  exitMs,
}: {
  enabled: boolean;
  delayMs: number;
  exitMs: number;
}): RevealTimer {
  const [shouldRender, setShouldRender] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const exitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let enterFrame: number | undefined;
    let openFrame: number | undefined;

    const revealTimer = setTimeout(() => {
      setShouldRender(true);
      // Two frames, not one. The first paints the element at its closed
      // position; the second moves it. Opening in the same frame as the mount
      // gives the browser nothing to transition from and it simply appears.
      enterFrame = requestAnimationFrame(() => {
        openFrame = requestAnimationFrame(() => setIsOpen(true));
      });
    }, delayMs);

    return () => {
      clearTimeout(revealTimer);
      if (enterFrame !== undefined) cancelAnimationFrame(enterFrame);
      if (openFrame !== undefined) cancelAnimationFrame(openFrame);
    };
  }, [enabled, delayMs]);

  useEffect(
    () => () => {
      if (exitTimer.current) clearTimeout(exitTimer.current);
    },
    [],
  );

  const dismiss = useCallback(() => {
    setIsOpen(false);
    exitTimer.current = setTimeout(() => setShouldRender(false), exitMs);
  }, [exitMs]);

  return { shouldRender, isOpen, dismiss };
}
