import { render, screen } from '@testing-library/react'
import React from 'react'
import HomePage from '../app/page'

describe('Home Page', () => {
  it('renders heading and key links', () => {
    render(<HomePage />)
    expect(screen.getByRole('heading', { name: /hello, i'm sam/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /get in touch/i })).toHaveAttribute('href', '/contact')
    expect(screen.getByRole('link', { name: /work/i })).toHaveAttribute('href', '/work')
  })
})

