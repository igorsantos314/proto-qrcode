import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { downloadCanvas } from '../lib/qr/downloadPng'
import type { GeneratedConfig } from '../lib/qr/sameConfig'
import { QrPreview } from './QrPreview'

vi.mock('../lib/qr/downloadPng', () => ({
  downloadCanvas: vi.fn(),
  buildQrFilename: () => 'qrcode.png',
}))

const generated: GeneratedConfig = {
  payload: 'Olá',
  background: 'none',
  logoDataUrl: null,
}

type PreviewProps = Parameters<typeof QrPreview>[0]

function setup(overrides: Partial<PreviewProps> = {}) {
  const props: PreviewProps = {
    generated,
    background: 'none',
    logoDataUrl: null,
    borderWidth: 0,
    borderRadius: 0,
    stale: false,
    onBackgroundChange: vi.fn(),
    onBorderWidthChange: vi.fn(),
    onBorderRadiusChange: vi.fn(),
    onLogoSelect: vi.fn(),
    onLogoRemove: vi.fn(),
    ...overrides,
  }
  render(<QrPreview {...props} />)
  return props
}

describe('QrPreview', () => {
  it('shows a placeholder until a QR is generated', () => {
    setup({ generated: null })
    expect(screen.getByText(/Preencha os campos ao lado/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Baixar PNG' })).toBeDisabled()
  })

  it('renders the generated QR with its payload', () => {
    setup()
    const canvas = screen.getByTestId('qr-canvas')
    expect(canvas).toHaveAttribute('data-value', 'Olá')
    expect(canvas).toHaveAttribute('data-bgcolor', 'rgba(0,0,0,0)')
  })

  it('defaults to the without-background option', () => {
    setup()
    expect(screen.getByRole('radio', { name: 'Sem fundo' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
    expect(screen.getByRole('radio', { name: 'Com fundo' })).toHaveAttribute(
      'aria-checked',
      'false',
    )
  })

  it('notifies the background change', async () => {
    const user = userEvent.setup()
    const props = setup()
    await user.click(screen.getByRole('radio', { name: 'Com fundo' }))
    expect(props.onBackgroundChange).toHaveBeenCalledWith('white')
  })

  it('defaults border and corner radius to zero', () => {
    setup()
    expect(screen.getByLabelText('Borda (px)')).toHaveValue(0)
    expect(screen.getByLabelText('Raio dos cantos (px)')).toHaveValue(0)
  })

  it('notifies border width changes', () => {
    const props = setup()
    fireEvent.change(screen.getByLabelText('Borda (px)'), {
      target: { value: '8' },
    })
    expect(props.onBorderWidthChange).toHaveBeenLastCalledWith(8)
  })

  it('notifies corner radius changes', () => {
    const props = setup()
    fireEvent.change(screen.getByLabelText('Raio dos cantos (px)'), {
      target: { value: '12' },
    })
    expect(props.onBorderRadiusChange).toHaveBeenLastCalledWith(12)
  })

  it('applies border and corner radius to the rendered canvas', () => {
    setup({ borderWidth: 6, borderRadius: 10 })
    const canvas = screen.getByTestId('qr-canvas') as HTMLCanvasElement
    expect(canvas.style.borderWidth).toBe('6px')
    expect(canvas.style.borderStyle).toBe('solid')
    expect(canvas.style.borderRadius).toBe('10px')
  })

  it('shows the stale hint when the config changed', () => {
    setup({ stale: true })
    expect(screen.getByText(/Configuração alterada/)).toBeInTheDocument()
  })

  it('does not show the stale hint when current', () => {
    setup({ stale: false })
    expect(screen.queryByText(/Configuração alterada/)).not.toBeInTheDocument()
  })

  it('downloads the current canvas when generated', async () => {
    const user = userEvent.setup()
    setup()
    const button = screen.getByRole('button', { name: 'Baixar PNG' })
    expect(button).toBeEnabled()
    await user.click(button)
    expect(downloadCanvas).toHaveBeenCalledTimes(1)
  })

  it('uploads a logo through the file input', () => {
    const props = setup()
    const file = new File(['logo'], 'logo.png', { type: 'image/png' })
    const input = screen.getByLabelText('Escolher imagem')
    fireEvent.change(input, { target: { files: [file] } })
    expect(props.onLogoSelect).toHaveBeenCalledWith(file)
  })

  it('shows the logo preview and removes it', async () => {
    const user = userEvent.setup()
    const props = setup({ logoDataUrl: 'data:image/png;base64,AAAA' })
    expect(screen.getByRole('img', { name: 'Logomarca selecionada' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Remover' }))
    expect(props.onLogoRemove).toHaveBeenCalled()
  })
})