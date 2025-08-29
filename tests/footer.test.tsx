import { render, screen } from '@testing-library/react'
import React from 'react'
import { Footer } from '../app/components/footer'

describe('Footer', () => {
  it('renders copyright with correct year format', async () => {
    const currentYear = new Date().getFullYear()
    const expectedRange = currentYear > 2024 ? `2024 - ${currentYear}` : `${currentYear}`

    render(await Footer())
    const text = screen.getByText(/© Sam Ainsworth/)
    expect(text.textContent).toContain(expectedRange)
    expect(text.textContent).toContain('All Rights Reserved')
  })
})

