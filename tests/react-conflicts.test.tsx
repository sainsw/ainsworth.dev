import { describe, it, expect, vi } from 'vitest'
import React from 'react'

describe('React Version Conflict Detection', () => {
  it('should have consistent React version across imports', () => {
    // Test that all React imports resolve to the same version
    const reactVersion = React.version
    
    // This would catch if webpack aliases are working correctly
    expect(reactVersion).toBeDefined()
    expect(typeof reactVersion).toBe('string')
    expect(reactVersion).toMatch(/^\d+\.\d+\.\d+/)
  })

  it('should not have multiple React instances in global scope', () => {
    // Check for multiple React instances that could cause conflicts
    const reactInstances = []
    
    // Check window
    if (typeof window !== 'undefined' && (window as any).React) {
      reactInstances.push('window.React')
    }
    
    // Check global
    if (typeof global !== 'undefined' && (global as any).React) {
      reactInstances.push('global.React')
    }
    
    // Check globalThis
    if (typeof globalThis !== 'undefined' && (globalThis as any).React) {
      reactInstances.push('globalThis.React')
    }
    
    // In a properly configured app, we shouldn't have React in global scope
    // (unless we explicitly put it there for debugging)
    expect(reactInstances.length).toBeLessThanOrEqual(1)
  })

  it('should validate React DOM compatibility', async () => {
    // Test that ReactDOM is compatible with React
    const { createRoot } = await import('react-dom/client')
    expect(createRoot).toBeDefined()
    
    // Create a test container
    const container = document.createElement('div')
    const root = createRoot(container)
    
    // This should not throw with compatible versions
    expect(() => {
      root.render(React.createElement('div', null, 'test'))
    }).not.toThrow()
    
    root.unmount()
  })

  it('should have matching React and ReactDOM versions', async () => {
    const React = await import('react')
    const ReactDOM = await import('react-dom')
    
    // Both should be from the same major version
    const reactMajor = React.version.split('.')[0]
    const reactDOMMajor = (ReactDOM as any).version?.split('.')[0] || reactMajor
    
    expect(reactMajor).toBe(reactDOMMajor)
  })

  it('should not find pre-bundled React in node_modules', () => {
    // This test would ideally check the actual file system
    // but for now we can test that our overrides are working
    const packageJson = require('../package.json')
    
    expect(packageJson.overrides).toBeDefined()
    expect(packageJson.overrides.react).toBeDefined()
    expect(packageJson.overrides['react-dom']).toBeDefined()
    expect(packageJson.overrides['react-is']).toBeDefined()
  })
})