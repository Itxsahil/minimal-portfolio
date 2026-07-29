import { ImageResponse } from 'next/og'
import { OgTemplate, ogSize } from './og-util'

export const alt = 'Sahil Khan — Full-Stack Developer & Technical Writer'
export const size = ogSize
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    <OgTemplate title="Sahil Khan" />,
    size,
  )
}
