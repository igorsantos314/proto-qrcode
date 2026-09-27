import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CheckIcon, TrashIcon } from './icons'
import { ConfirmDialog } from './ConfirmDialog'

function setup(overrides: Partial<Parameters<typeof ConfirmDialog>[0]> = {}) {
  const onConfirm = vi.fn()
  const onClose = vi.fn()
  render(
    <ConfirmDialog
      open
      title="Título"
      description="Descrição do diálogo"
      variant="success"
      icon={<CheckIcon />}
      confirmLabel="Confirmar"
      cancelLabel="Cancelar"
      showCancel
      onConfirm={onConfirm}
      onClose={onClose}
      {...overrides}
    />,
  )
  return { onConfirm, onClose }
}

describe('ConfirmDialog', () => {
  it('renders nothing when closed', () => {
    setup({ open: false })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders title, description, and icon', () => {
    setup({ icon: <TrashIcon /> })
    const dialog = screen.getByRole('dialog', { name: 'Título' })
    expect(dialog.textContent).toContain('Descrição do diálogo')
    expect(dialog.querySelector('svg')).toBeInTheDocument()
  })

  it('uses the danger variant for destructive actions', () => {
    setup({ variant: 'danger', confirmLabel: 'Excluir' })
    expect(screen.getByRole('button', { name: 'Excluir' })).toHaveAttribute(
      'data-variant',
      'danger',
    )
  })

  it('uses the success variant for save actions', () => {
    setup({ variant: 'success', confirmLabel: 'Entendi' })
    expect(screen.getByRole('button', { name: 'Entendi' })).toHaveAttribute(
      'data-variant',
      'success',
    )
  })

  it('calls onConfirm and onClose', async () => {
    const user = userEvent.setup()
    const { onConfirm, onClose } = setup()
    await user.click(screen.getByRole('button', { name: 'Confirmar' }))
    expect(onConfirm).toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()
  })

  it('calls onClose via the cancel button', async () => {
    const user = userEvent.setup()
    const { onClose } = setup()
    await user.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onClose).toHaveBeenCalled()
  })

  it('hides the cancel button when showCancel is false', () => {
    setup({ showCancel: false, confirmLabel: 'Entendi' })
    expect(screen.queryByRole('button', { name: 'Cancelar' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Entendi' })).toBeInTheDocument()
  })

  it('closes via the Escape key', () => {
    const { onClose } = setup()
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).toHaveBeenCalled()
  })

  it('closes when the overlay is clicked', async () => {
    const user = userEvent.setup()
    const { onClose } = setup()
    await user.click(screen.getByTestId('confirm-dialog-overlay'))
    expect(onClose).toHaveBeenCalled()
  })
})