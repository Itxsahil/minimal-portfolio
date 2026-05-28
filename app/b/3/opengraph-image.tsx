import { ImageResponse } from 'next/og'
import { OgTemplate, ogSize } from '@/app/og-util'

export const alt = 'JavaScript Array Methods: Implementing Core Methods'
export const size = ogSize
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    <OgTemplate title="JavaScript Array Methods: Implementing Core Methods" />,
    size,
  )
}
