import { describe, it, expect } from 'vitest'

describe('Frontend Testing Setup', () => {
  it('should have working test framework', () => {
    expect(1 + 1).toBe(2)
  })

  it('should have proper React version', () => {
    const React = require('react')
    expect(React.version).toMatch(/^\d+\.\d+\.\d+/)
  })

  it('should validate package.json overrides', () => {
    const pkg = require('../package.json')
    expect(pkg.overrides).toBeDefined()
    expect(pkg.overrides.react).toBe('^18.3.1')
    expect(pkg.overrides['react-dom']).toBe('^18.3.1')
    expect(pkg.overrides['react-is']).toBe('^18.0.0')
  })
})