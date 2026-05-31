import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ViewTracker } from '@/components/view-tracker';

describe('ViewTracker', () => {
  it('tracks a rendered article with a POST request', () => {
    const fetchSpy = vi
      .spyOn(global, 'fetch')
      .mockResolvedValue(new Response());

    render(<ViewTracker slug="hello world" />);

    expect(fetchSpy).toHaveBeenCalledWith('/api/views/hello%20world', {
      method: 'POST',
      keepalive: true,
    });
  });
});
