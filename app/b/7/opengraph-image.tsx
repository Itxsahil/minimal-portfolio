import { ImageResponse } from 'next/og'
import { OgTemplate, ogSize } from '@/app/og-util'

export const alt = 'Why a MacBook Sometimes Outperforms a Laptop With a Dedicated GPU'
export const size = ogSize
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    <OgTemplate title="Why a MacBook Sometimes Outperforms a Laptop With a Dedicated GPU" />,
    size,
  )
}
