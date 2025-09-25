import { render, screen } from '@testing-library/react'
import React from 'react'
import { CustomMDX } from '../app/components/mdx'

describe('CustomMDX deep rendering', () => {
  it('renders fenced code blocks with highlighted innerHTML', () => {
    const md = '```js\nconsole.log(123)\n```'
    const { container } = render(<CustomMDX source={md} />)
    const code = container.querySelector('code')!
    expect(code).toBeInTheDocument()
    // sugar-high injects HTML; at minimum we should see the source text
    expect(code.innerHTML).toMatch(/console/)
    expect(code.innerHTML).toMatch(/123/)
  })

  it('renders internal and external links appropriately', () => {
    const md = '[ext](https://example.com) and [home](/)'
    render(<CustomMDX source={md} />)
    const ext = screen.getByRole('link', { name: 'ext' })
    expect(ext).toHaveAttribute('href', 'https://example.com')
    expect(ext).toHaveAttribute('target', '_blank')
    const home = screen.getByRole('link', { name: 'home' })
    expect(home).toHaveAttribute('href', '/')
    expect(home.getAttribute('target')).toBeNull()
  })

  it('inlines AvatarDemo via [AVATAR_DEMO] marker', () => {
    const md = 'Before\n\n[AVATAR_DEMO]\n\nAfter'
    const { container } = render(<CustomMDX source={md} />)
    // AvatarDemo renders two pictures; check one is present
    const pics = container.querySelectorAll('picture')
    expect(pics.length).toBeGreaterThan(0)
  })

  it('renders mermaid code block via dynamic component (stub)', async () => {
    vi.resetModules()
    vi.doMock('next/dynamic', () => ({
      default: (_loader: any, _opts: any) => (props: any) => React.createElement('div', { 'data-testid': 'mermaid', ...props }),
    }))
    const { CustomMDX: FreshMDX } = await import('../app/components/mdx')
    const md = '```mermaid\ngraph TD; A-->B;\n```'
    render(<FreshMDX source={md} />)
    const el = screen.getByTestId('mermaid')
    expect(el).toBeInTheDocument()
    expect(el.getAttribute('data-chart')).toContain('graph TD')
  })
})
