'use client';

import type React from 'react';

/**
 * The address is assembled on click so it never appears in the markup, which
 * is the whole point of this component: see the note in app/layout.tsx about
 * keeping it out of the JSON-LD too.
 *
 * It is a <button>, not an <a href="#">. The anchor was announced as a link,
 * but it had no destination to go to: with JavaScript off it jumped to the top
 * of the page, and "copy link address" gave you the current URL. A button is
 * what this actually is, and it needs no lint suppression to say so.
 */
export function EmailLink({
  user,
  domain,
  label = 'Email',
  subject,
  className = '',
}: {
  user: string;
  domain: string;
  label?: string;
  subject?: string;
  className?: string;
}) {
  const onClick = (_e: React.MouseEvent<HTMLButtonElement>) => {
    const addr = `${user}@${domain}`;
    const href = `mailto:${addr}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`;
    window.location.href = href;
  };

  return (
    <button
      type="button"
      onClick={onClick}
      // `inline` and `align-baseline` keep it sitting in the sentence exactly
      // where the anchor did; a button is inline-block by default.
      className={`inline align-baseline cursor-pointer bg-transparent p-0 ${className}`}
      aria-label={`Email ${user} at ${domain}`}
    >
      {label}
      <noscript>
        {/* No-JS fallback: use contact page instead of exposing email */}
        <span> (enable JavaScript to email, or use the contact form)</span>
      </noscript>
    </button>
  );
}
