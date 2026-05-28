import { ImageResponse } from 'next/og'
import { OgTemplate, ogSize } from '@/app/og-util'

export const alt = '6 Sneaky JavaScript Patterns to Cut Boilerplate'
export const size = ogSize
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    <OgTemplate title="6 Sneaky JavaScript Patterns to Cut Boilerplate" />,
    size,
  )
}
