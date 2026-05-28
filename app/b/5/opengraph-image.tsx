import { ImageResponse } from 'next/og'
import { OgTemplate, ogSize } from '@/app/og-util'

export const alt = 'Understanding WebRTC — Real-Time Communication in the Browser'
export const size = ogSize
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    <OgTemplate title="Understanding WebRTC — Real-Time Communication in the Browser" />,
    size,
  )
}
