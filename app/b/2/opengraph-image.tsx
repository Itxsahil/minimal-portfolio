import { ImageResponse } from 'next/og'
import { OgTemplate, ogSize } from '@/app/og-util'

export const alt = 'Observability: Monitoring Node.js with Prometheus, Grafana & Loki'
export const size = ogSize
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    <OgTemplate title="Observability: Monitoring Node.js with Prometheus, Grafana & Loki" />,
    size,
  )
}
