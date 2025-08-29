import { render, screen } from '@testing-library/react'
import React from 'react'

describe('Contact Page', () => {
  it('renders inputs and submit button (idle state)', async () => {
    vi.doMock('react-dom', async () => {
      const actual: any = await vi.importActual('react-dom')
      return { ...actual, useFormStatus: () => ({ pending: false }) }
    })
    const Page = (await import('../app/contact/page')).default
    render(<Page />)
    expect(screen.getByLabelText(/your email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/your message/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument()
  })

  it('shows pending label when submitting', async () => {
    vi.resetModules()
    vi.doMock('react-dom', async () => {
      const actual: any = await vi.importActual('react-dom')
      return { ...actual, useFormStatus: () => ({ pending: true }) }
    })
    const Page = (await import('../app/contact/page')).default
    const { container } = render(<Page />)
    const button = container.querySelector('button[type="submit"]')!
    expect(button.textContent).toBe('...')
  })
})
