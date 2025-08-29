import { render } from '@testing-library/react'
import React from 'react'
import { AvatarDemo } from '../app/components/avatar-demo'

describe('AvatarDemo', () => {
  it('renders two pictures with images', () => {
    const { container } = render(<AvatarDemo />)
    const pics = container.querySelectorAll('picture')
    expect(pics.length).toBeGreaterThanOrEqual(2)
    const imgs = container.querySelectorAll('img[alt="my face"]')
    expect(imgs.length).toBeGreaterThanOrEqual(2)
  })
})

