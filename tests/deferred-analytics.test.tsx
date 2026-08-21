import { render } from '@testing-library/react';
import React from 'react';
import { vi } from 'vitest';

let mockStatus: 'pending' | 'accepted' | 'declined' = 'pending';

vi.mock('@/lib/consent', () => ({
  useConsent: () => ({
    status: mockStatus,
    accept: vi.fn(),
    decline: vi.fn(),
  }),
}));

vi.mock('@vercel/analytics/react', () => ({
  Analytics: () => React.createElement('div', { 'data-testid': 'analytics' }),
}));

import { DeferredAnalytics } from '@/components/deferred-analytics';

describe('DeferredAnalytics', () => {
  beforeEach(() => {
    mockStatus = 'pending';
  });

  it('does not render when consent is pending', () => {
    const { queryByTestId } = render(<DeferredAnalytics />);
    expect(queryByTestId('analytics')).toBeNull();
  });

  it('renders when consent is accepted', () => {
    mockStatus = 'accepted';
    const { getByTestId } = render(<DeferredAnalytics />);
    expect(getByTestId('analytics')).toBeInTheDocument();
  });

  it('does not render when consent is declined', () => {
    mockStatus = 'declined';
    const { queryByTestId } = render(<DeferredAnalytics />);
    expect(queryByTestId('analytics')).toBeNull();
  });
});
