import { ImageResponse } from 'next/og'
import { OgTemplate, ogSize } from '@/app/og-util'

export const alt = 'Unlocking Metaprogramming in JavaScript: Proxies and Reflect'
export const size = ogSize
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    <OgTemplate title="Unlocking Metaprogramming in JavaScript: Proxies and Reflect" />,
    size,
  )
}
