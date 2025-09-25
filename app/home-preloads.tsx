'use client'

import { useServerInsertedHTML } from 'next/navigation'
import { AVATAR_VERSION } from '../lib/version'

export function HomePreloads() {
  useServerInsertedHTML(() => (
    <>
      <link
        rel="preload"
        href={`/images/home/avatar-${AVATAR_VERSION}.webp`}
        as="image"
        type="image/webp"
      />
    </>
  ))
  return null
}

