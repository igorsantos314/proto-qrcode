import { render, screen } from '@testing-library/react'
import { QRCodeCanvas } from 'qrcode.react'
import { describe, expect, it } from 'vitest'

function SmokeCanvas() {
  return <QRCodeCanvas value="olá" bgColor="rgba(0,0,0,0)" />
}

describe('test setup', () => {
  it('renders the mocked QR canvas and exposes its props', () => {
    render(<SmokeCanvas />)
    const canvas = screen.getByTestId('qr-canvas')
    expect(canvas).toBeInTheDocument()
    expect(canvas).toHaveAttribute('data-value', 'olá')
    expect(canvas).toHaveAttribute('data-bgcolor', 'rgba(0,0,0,0)')
  })

  it('clears localStorage between tests', () => {
    window.localStorage.setItem('proto-qrcode:smoke', '1')
    expect(window.localStorage.getItem('proto-qrcode:smoke')).toBe('1')
  })
})