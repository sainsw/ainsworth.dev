import { render, screen } from '@testing-library/react'
import React from 'react'
import { PrideAvatar } from '../app/components/pride-avatar'

describe('PrideAvatar', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('applies normal ring outside pride periods', () => {
    vi.setSystemTime(new Date('2024-05-10T12:00:00Z'))
    const { container } = render(
      <PrideAvatar>
        <img alt="avatar" />
      </PrideAvatar>
    )
    const wrapper = container.querySelector('div')!
    expect(wrapper.className).toMatch(/ring-2/)
  })

  it('applies pride rainbow during June', () => {
    vi.setSystemTime(new Date('2024-06-15T12:00:00Z'))
    const { container } = render(
      <PrideAvatar>
        <img alt="avatar" />
      </PrideAvatar>
    )
    // Inner styled element should exist with boxShadow
    const styled = container.querySelector('div[style]') as HTMLDivElement
    expect(styled).toBeInTheDocument()
    expect(styled.getAttribute('style') || '').toMatch(/box-shadow/i)
  })
})
