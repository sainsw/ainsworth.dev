import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ReactDebug } from '../app/components/react-debug'
import React from 'react'

describe('React Debug Component', () => {
  it('shows React version in development', () => {
    // Mock development environment
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'
    
    render(<ReactDebug />)
    
    expect(screen.getByText(`React Version: ${React.version}`)).toBeInTheDocument()
    expect(screen.getByText(`Import React: ${React.version}`)).toBeInTheDocument()
    
    // Restore environment
    process.env.NODE_ENV = originalEnv
  })

  it('does not render in production', () => {
    // Mock production environment
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'
    
    const { container } = render(<ReactDebug />)
    
    expect(container.firstChild).toBeNull()
    
    // Restore environment
    process.env.NODE_ENV = originalEnv
  })

  it('detects multiple React instances', () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'
    
    // Mock window.React to simulate multiple instances
    const mockWindowReact = { version: '17.0.0' }
    Object.defineProperty(window, 'React', {
      value: mockWindowReact,
      writable: true,
      configurable: true,
    })
    
    render(<ReactDebug />)
    
    expect(screen.getByText('Window React: 17.0.0')).toBeInTheDocument()
    expect(screen.getByText(`Import React: ${React.version}`)).toBeInTheDocument()
    
    // Clean up
    Object.defineProperty(window, 'React', {
      value: undefined,
      writable: true,
      configurable: true,
    })
    process.env.NODE_ENV = originalEnv
  })
})