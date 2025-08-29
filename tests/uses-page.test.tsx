import { render, screen } from '@testing-library/react'
import React from 'react'
import UsesPage from '../app/uses/page'

describe('Uses Page', () => {
  it('renders heading and sections', () => {
    render(<UsesPage />)
    expect(screen.getByRole('heading', { name: /here's my setup/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /computer \/ office/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /coding/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /audio \/ video/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /software/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /music/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /other tech/i })).toBeInTheDocument()
  })
})

