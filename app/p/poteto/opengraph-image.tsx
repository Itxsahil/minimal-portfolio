import { ImageResponse } from 'next/og'
import { OgTemplate, ogSize } from '@/app/og-util'

export const alt = 'poteto — a Hyprland desktop built around a dynamic island'
export const size = ogSize
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(<OgTemplate title="poteto" />, size)
}
