import { forwardRef } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import type { QrBackground } from '../types'

interface QrCanvasProps {
  value: string
  background: QrBackground
  logoDataUrl: string | null
  size?: number
}

export const QrCanvas = forwardRef<HTMLCanvasElement, QrCanvasProps>(
  function QrCanvas({ value, background, logoDataUrl, size = 256 }, ref) {
    const imageSettings = logoDataUrl
      ? {
          src: logoDataUrl,
          height: Math.round(size * 0.15),
          width: Math.round(size * 0.15),
          excavate: true,
        }
      : undefined

    return (
      <QRCodeCanvas
        ref={ref}
        value={value}
        size={size}
        bgColor={background === 'white' ? '#ffffff' : 'rgba(0,0,0,0)'}
        fgColor="#000000"
        level={logoDataUrl ? 'H' : 'M'}
        marginSize={4}
        imageSettings={imageSettings}
      />
    )
  },
)