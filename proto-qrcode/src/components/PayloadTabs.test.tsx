import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { PayloadTabs } from './PayloadTabs'

vi.mock('../lib/qr/downloadPng', () => ({
  downloadCanvas: vi.fn(),
  buildQrFilename: () => 'qrcode.png',
}))

describe('PayloadTabs', () => {
  it('renders the five tab types', () => {
    render(<PayloadTabs active="text" onChange={() => undefined} />)
    for (const label of ['Texto', 'Pix', 'Instagram', 'WiFi', 'Facebook']) {
      expect(screen.getByRole('tab', { name: label })).toBeInTheDocument()
    }
  })

  it('marks the active tab as selected', () => {
    render(<PayloadTabs active="wifi" onChange={() => undefined} />)
    expect(screen.getByRole('tab', { name: 'WiFi' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.getByRole('tab', { name: 'Texto' })).toHaveAttribute(
      'aria-selected',
      'false',
    )
  })

  it('reports tab changes', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<PayloadTabs active="text" onChange={onChange} />)
    await user.click(screen.getByRole('tab', { name: 'Pix' }))
    expect(onChange).toHaveBeenCalledWith('pix')
  })
})