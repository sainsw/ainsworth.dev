import { render, screen } from '@testing-library/react'
import React from 'react'

// Mock IntersectionObserver used by usePrefetchOnView
class IO {
  constructor(_: any, __: any) {}
  observe() {}
  unobserve() {}
  disconnect() {}
}
// @ts-ignore
global.IntersectionObserver = IO

describe('Work Page', () => {
  it('renders section headings and CV link', async () => {
    const Page = (await import('../app/work/page')).default
    render(<Page />)
    expect(screen.getByRole('heading', { name: /skills & technologies/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /work/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /education/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /non-technical skills/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /hobbies/i })).toBeInTheDocument()

    const link = screen.getByRole('link', { name: /open pdf version/i })
    expect(link).toHaveAttribute('href')
    expect(link.getAttribute('target')).toBe('_blank')
  })
})

