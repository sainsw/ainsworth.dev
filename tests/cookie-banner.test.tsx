import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

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

describe('CookieConsent', () => {
  beforeEach(() => {
    mockStatus = 'pending';
    mockAccept.mockClear();
    mockDecline.mockClear();
  });

  it('renders when consent is pending', () => {
    render(<CookieConsent />);

    expect(
      screen.getByText(/I use cookies to analyse traffic and provide features/),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /accept/i })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /decline/i }),
    ).toBeInTheDocument();
  });

  it('does not render when consent is already accepted', () => {
    mockStatus = 'accepted';

    render(<CookieConsent />);

    expect(
      screen.queryByText(
        /I use cookies to analyse traffic and provide features/,
      ),
    ).not.toBeInTheDocument();
  });

  it('calls accept() when accept button is clicked', () => {
    render(<CookieConsent />);

    fireEvent.click(screen.getByRole('button', { name: /accept/i }));

    expect(mockAccept).toHaveBeenCalled();
  });

  it('calls decline() when decline button is clicked', () => {
    render(<CookieConsent />);

    fireEvent.click(screen.getByRole('button', { name: /decline/i }));

    expect(mockDecline).toHaveBeenCalled();
  });
});
