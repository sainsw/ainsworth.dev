import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mockAccept = vi.fn();
const mockDecline = vi.fn();
let mockStatus: 'pending' | 'accepted' | 'declined' = 'pending';

vi.mock('@/lib/consent', () => ({
  useConsent: () => ({
    status: mockStatus,
    accept: mockAccept,
    decline: mockDecline,
  }),
}));

import { CookieConsent } from '@/components/cookie-banner';

const BANNER = /I use cookies to analyse traffic and provide features/;

beforeEach(() => {
  vi.useFakeTimers();
  mockStatus = 'pending';
  mockAccept.mockClear();
  mockDecline.mockClear();
});
afterEach(() => vi.useRealTimers());

/** Runs the real 2s delay and two-frame sequence the banner ships with. */
function reveal() {
  render(<CookieConsent />);
  act(() => vi.advanceTimersByTime(2000 + 32));
}

describe('CookieConsent', () => {
  it('stays hidden for the first two seconds', () => {
    render(<CookieConsent />);

    act(() => vi.advanceTimersByTime(1999));
    expect(screen.queryByText(BANNER)).not.toBeInTheDocument();
  });

  it('reveals once the delay has passed', () => {
    reveal();

    expect(screen.getByText(BANNER)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /accept/i })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /decline/i }),
    ).toBeInTheDocument();
  });

  it('does not appear at all when consent is already accepted', () => {
    mockStatus = 'accepted';
    reveal();

    expect(screen.queryByText(BANNER)).not.toBeInTheDocument();
  });

  it('calls accept() when accept is clicked', () => {
    reveal();

    fireEvent.click(screen.getByRole('button', { name: /accept/i }));

    expect(mockAccept).toHaveBeenCalled();
  });

  it('calls decline() when decline is clicked', () => {
    reveal();

    fireEvent.click(screen.getByRole('button', { name: /decline/i }));

    expect(mockDecline).toHaveBeenCalled();
  });

  it('plays the exit transition before unmounting', () => {
    reveal();

    fireEvent.click(screen.getByRole('button', { name: /accept/i }));
    // Still on screen, sliding out. Unmounting here would skip the animation.
    expect(screen.getByText(BANNER)).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(700));
    expect(screen.queryByText(BANNER)).not.toBeInTheDocument();
  });
});
