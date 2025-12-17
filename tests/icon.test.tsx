import { render, screen } from '@testing-library/react'
import React from 'react'
import Icon from '../components/icon'

describe('Icon component', () => {
  it('renders PNG/WebP logos (westhill alias)', () => {
    render(<Icon id="westhill" size={24} />)
    const img = screen.getByRole('img', { name: /westhill logo/i }) as HTMLImageElement
    expect(img).toBeInTheDocument()
    expect(img.src).toContain('/images/logos/wh.png')
  })

  it('renders ASFC via sprite', () => {
    const { container } = render(<Icon id="asfc" size={20} />)
    const svg = container.querySelector('svg')!
    expect(svg).toBeInTheDocument()
    const use = svg.querySelector('use')!
    const href = use.getAttribute('href') || use.getAttribute('xlink:href')
    expect(href).toMatch(/\/sprite\.svg\?v=.*#asfc/)
  })

  it('renders UoL via themed SVG files', () => {
    const { container } = render(<Icon id="uol" size={18} />)
    const img = screen.getByRole('img', { name: /uol logo/i }) as HTMLImageElement
    expect(img.src).toContain('/images/logos/uol_light_mode.svg')
    const source = container.querySelector('source')
    expect(source?.getAttribute('srcset')).toContain('/images/logos/uol_dark_mode.svg')
  })

  it('renders brand colour logos (azure and dotnet)', () => {
    const { rerender, container } = render(<Icon id="azure" size={16} />)
    let img = container.querySelector('img') as HTMLImageElement
    expect(img.src).toContain('/images/logos/azure.ico')

    rerender(<Icon id="dotnet" size={16} />)
    img = container.querySelector('img') as HTMLImageElement
    expect(img.src).toContain('/images/logos/dotnet.jpg')
  })

  it('renders sprite-based SVG with versioned href', () => {
    const { container } = render(<Icon id="ibm" size={32} />)
    const svg = container.querySelector('svg')!
    expect(svg).toBeInTheDocument()
    const use = svg.querySelector('use')!
    const href = use.getAttribute('href') || use.getAttribute('xlink:href')
    expect(href).toMatch(/\/sprite\.svg\?v=.*#ibm/)
  })

  it('computes missing dimension from aspect ratio (ibm)', () => {
    const { container } = render(<Icon id="ibm" width={58} />)
    const svg = container.querySelector('svg')!
    expect(svg.getAttribute('width')).toBe('58')
    // ibm ratio 58/23 => height should be 23 when width=58
    expect(svg.getAttribute('height')).toBe('23')
  })
})
