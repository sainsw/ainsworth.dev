import { render } from '@testing-library/react'
import React from 'react'
import { ArrowIcon } from '../app/components/arrow-icon'

describe('ArrowIcon', () => {
  it('renders svg with path and dimensions', () => {
    const { container } = render(<ArrowIcon />)
    const svg = container.querySelector('svg')!
    expect(svg).toBeInTheDocument()
    expect(svg.getAttribute('width')).toBe('12')
    expect(svg.getAttribute('height')).toBe('12')
    const path = container.querySelector('path')
    expect(path).toBeInTheDocument()
  })
})

