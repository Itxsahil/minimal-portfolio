import { ImageResponse } from 'next/og'
import { OgTemplate, ogSize } from '@/app/og-util'

export const alt = 'Writings by Sahil Khan'
export const size = ogSize
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(<OgTemplate title="Writings" />, size)
}
