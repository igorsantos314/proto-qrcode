import { forwardRef } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import type { QrBackground } from '../types'

interface QrCanvasProps {
  value: string
  background: QrBackground
  logoDataUrl: string | null
  borderWidth?: number
  borderRadius?: number
  size?: number
  resolution?: number
}

export const QrCanvas = forwardRef<HTMLCanvasElement, QrCanvasProps>(
  function QrCanvas(
    {
      value,
      background,
      logoDataUrl,
      borderWidth = 0,
      borderRadius = 0,
      size = 256,
      resolution,
    },
    ref,
  ) {
    const renderSize = resolution ?? size
    const imageSettings = logoDataUrl
      ? {
          src: logoDataUrl,
          height: Math.round(renderSize * 0.15),
          width: Math.round(renderSize * 0.15),
          excavate: true,
        }
      : undefined

    const border = Math.max(0, borderWidth)
    const radius = Math.max(0, borderRadius)

    return (
      <QRCodeCanvas
        ref={ref}
        value={value}
        size={renderSize}
        bgColor={background === 'white' ? '#ffffff' : 'rgba(0,0,0,0)'}
        fgColor="#000000"
        level={logoDataUrl ? 'H' : 'M'}
        marginSize={4}
        imageSettings={imageSettings}
        style={{
          boxSizing: 'border-box',
          width: size,
          height: size,
          border: border > 0 ? `${border}px solid #000000` : undefined,
          borderRadius: radius > 0 ? `${radius}px` : undefined,
        }}
      />
    )
  },
)
