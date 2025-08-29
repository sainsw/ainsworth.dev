import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'
import { SignIn, SignOut } from '../app/guestbook/buttons'

vi.mock('next-auth/react', () => ({
  signIn: vi.fn(),
  signOut: vi.fn(),
}))

describe('Guestbook buttons', () => {
  it('SignIn triggers GitHub sign-in', async () => {
    const { signIn } = await import('next-auth/react')
    render(<SignIn />)
    const btn = screen.getByRole('button', { name: /sign in with github/i })
    fireEvent.click(btn)
    expect(signIn).toHaveBeenCalledWith('github')
  })

  it('SignOut triggers signOut', async () => {
    const { signOut } = await import('next-auth/react')
    render(<SignOut />)
    const btn = screen.getByRole('button', { name: /sign out/i })
    fireEvent.click(btn)
    expect(signOut).toHaveBeenCalled()
  })
})

