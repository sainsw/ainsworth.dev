import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { useRevealTimer } from '@/app/hooks/use-reveal-timer';

const DELAY = 2000;
const EXIT = 700;

// vitest's fake timers stand in for requestAnimationFrame too, so the real
// two-frame sequence runs here rather than being skipped.
beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

const setup = (enabled = true) =>
  renderHook(() => useRevealTimer({ enabled, delayMs: DELAY, exitMs: EXIT }));

const advance = (ms: number) => act(() => vi.advanceTimersByTime(ms));

describe('useRevealTimer', () => {
  it('renders nothing before the delay elapses', () => {
    const { result } = setup();

    advance(DELAY - 1);
    expect(result.current.shouldRender).toBe(false);
  });

  it('mounts closed, then opens on a later frame', () => {
    const { result } = setup();

    advance(DELAY);
    // Mounted, but still at the closed position: this is the paint the
    // transition needs something to move away from.
    expect(result.current.shouldRender).toBe(true);
    expect(result.current.isOpen).toBe(false);

    advance(32);
    expect(result.current.isOpen).toBe(true);
  });

  it('never starts when disabled', () => {
    const { result } = setup(false);

    advance(DELAY + 32);
    expect(result.current.shouldRender).toBe(false);
    expect(result.current.isOpen).toBe(false);
  });

  it('closes immediately on dismiss but stays mounted for the exit', () => {
    const { result } = setup();
    advance(DELAY + 32);

    act(() => result.current.dismiss());
    expect(result.current.isOpen).toBe(false);
    expect(result.current.shouldRender).toBe(true);

    advance(EXIT - 1);
    expect(result.current.shouldRender).toBe(true);

    advance(1);
    expect(result.current.shouldRender).toBe(false);
  });

  it('keeps running once started, even if enabled goes false', () => {
    // Accepting flips the caller's `enabled` to false. If that tore the element
    // down, the exit transition would never play.
    const { result, rerender } = renderHook(
      ({ enabled }) =>
        useRevealTimer({ enabled, delayMs: DELAY, exitMs: EXIT }),
      { initialProps: { enabled: true } },
    );
    advance(DELAY + 32);

    act(() => result.current.dismiss());
    rerender({ enabled: false });

    expect(result.current.shouldRender).toBe(true);
    advance(EXIT);
    expect(result.current.shouldRender).toBe(false);
  });

  it('cancels a pending reveal when unmounted', () => {
    const { result, unmount } = setup();

    advance(DELAY - 1);
    unmount();
    advance(DELAY + 32);

    expect(result.current.shouldRender).toBe(false);
  });
});
