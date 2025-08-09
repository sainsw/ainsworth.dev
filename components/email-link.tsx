'use client'

import React from 'react'

export function EmailLink({
  user,
  domain,
  label = 'Email',
  subject,
  className = '',
}: {
  user: string
  domain: string
  label?: string
  subject?: string
  className?: string
}) {
  const onClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const addr = `${user}@${domain}`
    const href = `mailto:${addr}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`
    window.location.href = href
  }

  return (
    <a href="#" onClick={onClick} className={className} aria-label={`Email ${user} at ${domain}`}>
      {label}
      <noscript>
        {/* No-JS fallback: use contact page instead of exposing email */}
        <span> (enable JavaScript to email, or use the contact form)</span>
      </noscript>
    </a>
  )
}

