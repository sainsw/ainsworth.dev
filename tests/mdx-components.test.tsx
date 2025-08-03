import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { useMDXComponents } from '../mdx-components'

// Create test components using the MDX components
function TestComponent() {
  const components = useMDXComponents({})
  const { Callout, ProsCard, ConsCard } = components as any

  return (
    <div>
      <Callout emoji="⚠️">This is a callout</Callout>
      <ProsCard title="React" pros={["Fast", "Popular"]} />
      <ConsCard title="Complexity" cons={["Learning curve", "Setup"]} />
    </div>
  )
}

describe('MDX Components', () => {
  it('should render Callout component', () => {
    render(<TestComponent />)
    
    expect(screen.getByText('This is a callout')).toBeInTheDocument()
    expect(screen.getByText('⚠️')).toBeInTheDocument()
  })

  it('should render ProsCard component', () => {
    render(<TestComponent />)
    
    expect(screen.getByText('You might use React if...')).toBeInTheDocument()
    expect(screen.getByText('Fast')).toBeInTheDocument()
    expect(screen.getByText('Popular')).toBeInTheDocument()
  })

  it('should render ConsCard component', () => {
    render(<TestComponent />)
    
    expect(screen.getByText('You might not use Complexity if...')).toBeInTheDocument()
    expect(screen.getByText('Learning curve')).toBeInTheDocument()
    expect(screen.getByText('Setup')).toBeInTheDocument()
  })

  it('should include standard heading components', () => {
    const components = useMDXComponents({})
    
    expect(components.h1).toBeDefined()
    expect(components.h2).toBeDefined()
    expect(components.h3).toBeDefined()
    expect(components.h4).toBeDefined()
    expect(components.h5).toBeDefined()
    expect(components.h6).toBeDefined()
  })

  it('should include custom link and image components', () => {
    const components = useMDXComponents({})
    
    expect(components.a).toBeDefined()
    expect(components.Image).toBeDefined()
  })

  it('should allow component overrides', () => {
    const customComponents = {
      h1: () => <h1>Custom H1</h1>,
      customComponent: () => <div>Custom</div>
    }
    
    const components = useMDXComponents(customComponents)
    
    expect(components.h1).toBe(customComponents.h1)
    expect(components.customComponent).toBe(customComponents.customComponent)
  })
})