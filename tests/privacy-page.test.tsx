import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import PrivacyPage from '@/app/privacy/page';

afterEach(() => {
  vi.useRealTimers();
});

function renderLastUpdatedAt(when: string) {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(when));
  const { unmount } = render(<PrivacyPage />);
  const text = screen.getByText(/Last updated:/).textContent ?? '';
  unmount();
  return text;
}

describe('the privacy policy last-updated date', () => {
  it('does not move with the clock', () => {
    // It used to render `new Date()`, so the policy claimed to have been updated
    // today, every day, however long it had actually sat unchanged. That is a
    // false statement on a legal page, not merely a stale one.
    expect(renderLastUpdatedAt('2027-01-01T12:00:00Z')).toBe(
      renderLastUpdatedAt('2031-06-30T12:00:00Z'),
    );
  });

  it('still shows a real date', () => {
    expect(screen.queryByText(/Last updated:/)).toBeNull();
    render(<PrivacyPage />);
    expect(screen.getByText(/Last updated:/)).toHaveTextContent(
      /Last updated: \d{1,2} \w+ \d{4}$/,
    );
  });
});
