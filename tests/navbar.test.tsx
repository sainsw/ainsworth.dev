import { render, screen } from '@testing-library/react'
import React from 'react'
import { Navbar } from '../app/components/nav'

describe('Navbar', () => {
  it('renders expected links with correct hrefs', () => {
    render(<Navbar />)

    const home = screen.getByRole('link', { name: /home/i }) as HTMLAnchorElement
    expect(home).toHaveAttribute('href', '/')

    const work = screen.getByRole('link', { name: /work/i }) as HTMLAnchorElement
    expect(work).toHaveAttribute('href', '/work')

    const blog = screen.getByRole('link', { name: /blog/i }) as HTMLAnchorElement
    expect(blog).toHaveAttribute('href', '/blog')

    const guestbook = screen.getByRole('link', { name: /guestbook/i }) as HTMLAnchorElement
    expect(guestbook).toHaveAttribute('href', '/guestbook')
    // prefetch is a Next.js prop and isn’t observable in DOM here
  })
})
