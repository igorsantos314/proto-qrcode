import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App navigation', () => {
  it('defaults to the QR Code section and exposes both sections', () => {
    render(<App />)
    expect(
      screen.getByRole('heading', { name: 'Gerar QR code' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'QR Code' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Orçamentos' })).toBeInTheDocument()
  })

  it('navigates to the budgets section and back to QR codes', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('link', { name: 'Orçamentos' }))
    expect(
      screen.getByRole('heading', { name: 'Orçamentos' }),
    ).toBeInTheDocument()
    expect(
      screen.getByLabelText('Tipo de material'),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: 'QR Code' }))
    expect(
      screen.getByRole('heading', { name: 'Gerar QR code' }),
    ).toBeInTheDocument()
  })

  it('keeps the generated QR code when switching sections', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByLabelText('Conteúdo do QR code'), 'persistente')
    await user.click(screen.getByRole('button', { name: 'Gerar' }))
    expect(screen.getByTestId('qr-canvas')).toHaveAttribute(
      'data-value',
      'persistente',
    )

    await user.click(screen.getByRole('link', { name: 'Orçamentos' }))
    await user.click(screen.getByRole('link', { name: 'QR Code' }))

    expect(screen.getByTestId('qr-canvas')).toHaveAttribute(
      'data-value',
      'persistente',
    )
  })
})
