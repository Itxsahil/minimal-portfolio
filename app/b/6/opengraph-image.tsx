import { ImageResponse } from 'next/og'
import { OgTemplate, ogSize } from '@/app/og-util'

export const alt = 'The Beauty of Small Code: Why Overengineering Is an Addiction'
export const size = ogSize
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    <OgTemplate title="The Beauty of Small Code: Why Overengineering Is an Addiction" />,
    size,
  )
}
