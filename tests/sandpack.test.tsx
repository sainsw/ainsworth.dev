import { render, screen } from '@testing-library/react'
import React from 'react'

describe('LiveCode Sandpack', () => {
  it('renders Sandpack for html example', async () => {
    vi.resetModules()
    vi.doMock('@codesandbox/sandpack-react', () => ({
      Sandpack: (props: any) => React.createElement('div', { 'data-testid': 'sandpack', ...props }),
    }))
    vi.doUnmock('app/components/sandpack')
    const { LiveCode } = await import('app/components/sandpack')
    render(<LiveCode example="html" />)
    expect(screen.getByTestId('sandpack')).toBeInTheDocument()
  })

  it('shows fallback when Sandpack throws', async () => {
    vi.resetModules()
    vi.doMock('@codesandbox/sandpack-react', () => ({
      Sandpack: () => { throw new Error('boom') },
    }))
    vi.doUnmock('app/components/sandpack')
    const { LiveCode } = await import('app/components/sandpack')
    render(<LiveCode example="html" />)
    // Fallback text from component
    expect(screen.getByText(/oops, there was an error loading the codesandbox/i)).toBeInTheDocument()
  })
})
