import { render, screen } from '@testing-library/react'
import React from 'react'
import Form from '../app/guestbook/form'

// Server action is referenced but not executed in these tests
vi.mock('../app/db/actions', () => ({ saveGuestbookEntry: vi.fn(async () => {}) }))

describe('Guestbook Form', () => {
  it('renders message input and submit button', () => {
    const { container } = render(<Form />)
    expect(screen.getByLabelText(/your message/i)).toBeInTheDocument()
    const button = container.querySelector('button[type="submit"]')
    expect(button).toBeInTheDocument()
    expect(button?.textContent).toMatch(/sign/i)
  })
})

