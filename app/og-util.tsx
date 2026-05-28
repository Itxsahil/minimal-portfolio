import { ImageResponse } from 'next/og'

export function OgTemplate({ title }: { title: string }) {
  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#171717',
        padding: '0 80px',
        textAlign: 'center',
      }}
    >
      <p
        style={{
          fontSize: 56,
          fontWeight: 600,
          color: '#f5f5f5',
          margin: 0,
          lineHeight: 1.2,
          letterSpacing: '-0.02em',
        }}
      >
        {title}
      </p>
      <div
        style={{
          marginTop: 40,
          fontSize: 18,
          color: '#525252',
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          borderTop: '2px solid #262626',
          paddingTop: 32,
          display: 'flex',
        }}
      >
        sahilkhan.site
      </div>
    </div>
  )
}

export const ogSize = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'
