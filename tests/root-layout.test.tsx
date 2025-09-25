import { render, screen } from '@testing-library/react'
import React from 'react'

vi.mock('@vercel/speed-insights/next', () => ({
  SpeedInsights: () => React.createElement('div', { 'data-testid': 'speed' }),
}))

describe('RootLayout', () => {
  it('renders children, navbar, and cookie banner, and preloads assets', async () => {
    vi.resetModules()
    vi.doMock('geist/font/sans', () => ({ GeistSans: { variable: 'geist-sans' } }))
    vi.doMock('geist/font/mono', () => ({ GeistMono: { variable: 'geist-mono' } }))
    vi.doMock('app/components/footer', () => ({ Footer: () => React.createElement('footer', { 'data-testid': 'footer' }) }))
    const RootLayout = (await import('../app/layout')).default
    render(<RootLayout><div data-testid="child">content</div></RootLayout>)

    // Child content present
    expect(screen.getByTestId('child')).toBeInTheDocument()

    // Navbar link present
    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument()

    // Cookie banner text appears in test env
    expect(screen.getByText(/I use cookies to analyse traffic and provide features/i)).toBeInTheDocument()

    // Preload links in <head>
    const spritePreload = document.querySelector('link[rel="preload"][href="/sprite.svg"]')
    expect(spritePreload).not.toBeNull()
    // Avatar preload is now scoped to the Home page only
  })
})
