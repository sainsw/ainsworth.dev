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
    // Ensure overrides align on the same major React version
    expect(pkg.overrides.react).toMatch(/^\^19\./)
    expect(pkg.overrides['react-dom']).toMatch(/^\^19\./)
    expect(pkg.overrides['react-is']).toMatch(/^\^19\./)
  })
})
