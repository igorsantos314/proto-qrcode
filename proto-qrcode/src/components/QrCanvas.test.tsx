import { createRef } from 'react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { QrCanvas } from './QrCanvas'

describe('QrCanvas', () => {
  it('uses a transparent background by default (none)', () => {
    render(<QrCanvas value="olá" background="none" logoDataUrl={null} />)
    expect(screen.getByTestId('qr-canvas')).toHaveAttribute(
      'data-bgcolor',
      'rgba(0,0,0,0)',
    )
  })

  it('uses a white background when enabled', () => {
    render(<QrCanvas value="olá" background="white" logoDataUrl={null} />)
    expect(screen.getByTestId('qr-canvas')).toHaveAttribute(
      'data-bgcolor',
      '#ffffff',
    )
  })

  it('passes the value to the QR renderer', () => {
    render(<QrCanvas value="WIFI:T:WPA;S:Rede;;" background="none" logoDataUrl={null} />)
    expect(screen.getByTestId('qr-canvas')).toHaveAttribute(
      'data-value',
      'WIFI:T:WPA;S:Rede;;',
    )
  })

  it('does not pass imageSettings when there is no logo', () => {
    render(<QrCanvas value="x" background="none" logoDataUrl={null} />)
    expect(screen.getByTestId('qr-canvas')).toHaveAttribute(
      'data-imagesettings',
      '',
    )
  })

  it('passes a centered imageSettings when a logo is provided', () => {
    render(
      <QrCanvas
        value="x"
        background="none"
        logoDataUrl="data:image/png;base64,AAAA"
        size={256}
      />,
    )
    const raw = screen.getByTestId('qr-canvas').getAttribute('data-imagesettings')
    expect(raw).toBeTruthy()
    const settings = JSON.parse(raw ?? '') as Record<string, unknown>
    expect(settings.src).toBe('data:image/png;base64,AAAA')
    expect(settings.excavate).toBe(true)
    expect(settings.width).toBe(38)
    expect(settings.height).toBe(38)
  })

  it('forwards the canvas ref to the underlying element', () => {
    const ref = createRef<HTMLCanvasElement>()
    render(
      <QrCanvas
        ref={ref}
        value="x"
        background="none"
        logoDataUrl={null}
      />,
    )
    expect(ref.current).toBe(screen.getByTestId('qr-canvas'))
  })
})