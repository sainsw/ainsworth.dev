import { fireEvent, render, screen } from '@testing-library/react';
import { EmailLink } from '../components/email-link';

describe('EmailLink', () => {
  it('constructs mailto with subject and updates window.location.href', () => {
    const originalHref = window.location.href;
    delete (window as any).location;
    (window as any).location = { href: originalHref };

    render(
      <EmailLink
        user="sam"
        domain="example.com"
        subject="Hello There"
        label="Email me"
      />,
    );

    const link = screen.getByRole('link', {
      name: /email sam at example.com/i,
    });
    fireEvent.click(link);

    expect(window.location.href).toBe(
      'mailto:sam@example.com?subject=Hello%20There',
    );

    // Restore
    (window as any).location = { href: originalHref };
  });
});
