import { render, screen } from '@testing-library/react'
import React from 'react'
import PrivacyPage from '../app/privacy/page'

describe('Privacy Page', () => {
  it('renders heading and email links', () => {
    render(<PrivacyPage />)
    expect(screen.getByRole('heading', { name: /privacy policy/i })).toBeInTheDocument()
    // EmailLink uses an aria-label for accessibility
    const links = screen.getAllByRole('link', { name: /Email privacy at ainsworth\.dev/i })
    expect(links.length).toBeGreaterThanOrEqual(1)
  })
})
