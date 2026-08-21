import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ViewCounter from '../app/blog/view-counter';

describe('ViewCounter Component', () => {
  it('should display the given count', () => {
    render(<ViewCounter count={150} />);

    expect(screen.getByText('150 views')).toBeInTheDocument();
  });

  it('should display 0 views', () => {
    render(<ViewCounter count={0} />);

    expect(screen.getByText('0 views')).toBeInTheDocument();
  });

  it('should format large numbers with locale formatting', () => {
    render(<ViewCounter count={1234567} />);

    const viewText = screen.getByText(/1,234,567 views|1.234.567 views/);
    expect(viewText).toBeInTheDocument();
  });
});
