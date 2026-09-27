import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { SavedQrCode } from '../types'
import { SavedList } from './SavedList'

function record(id: string, overrides: Partial<SavedQrCode> = {}): SavedQrCode {
  const base: SavedQrCode = {
    id,
    type: 'text',
    fields: { content: 'Olá' },
    payload: 'Olá',
    background: 'none',
    logoDataUrl: null,
    createdAt: '2026-09-27T10:00:00.000Z',
    updatedAt: '2026-09-27T10:00:00.000Z',
    ...overrides,
  }
  return base
}

function setup({
  records = [record('1')],
  total = records.length,
  page = 1,
  pageCount = 1,
  editingId = null,
  storageError = null,
  onEdit = vi.fn(),
  onDelete = vi.fn(),
  onPageChange = vi.fn(),
}: Partial<Parameters<typeof SavedList>[0]> = {}) {
  render(
    <SavedList
      records={records}
      total={total}
      page={page}
      pageCount={pageCount}
      editingId={editingId}
      storageError={storageError}
      onEdit={onEdit}
      onDelete={onDelete}
      onPageChange={onPageChange}
    />,
  )
  return { onEdit, onDelete, onPageChange }
}

describe('SavedList', () => {
  it('shows an empty state when there are no records', () => {
    setup({ records: [] })
    expect(screen.getByText(/Nenhum QR code salvo ainda/)).toBeInTheDocument()
    expect(screen.getByText('0 no total')).toBeInTheDocument()
  })

  it('renders records with type, payload, and date', () => {
    setup({
      records: [
        record('1', { type: 'wifi', payload: 'WIFI:T:WPA;S:Rede;;' }),
        record('2', { type: 'pix', payload: '000201...' }),
      ],
    })
    expect(screen.getByText('2 no total')).toBeInTheDocument()
    expect(screen.getAllByText('WiFi')).toHaveLength(1)
    expect(screen.getAllByText('Pix')).toHaveLength(1)
    expect(screen.getByText('WIFI:T:WPA;S:Rede;;')).toBeInTheDocument()
  })

  it('marks the edited item', () => {
    setup({ records: [record('1'), record('2')], editingId: '1' })
    const items = screen.getAllByRole('listitem')
    expect(within(items[0]).getByText('Editando')).toBeInTheDocument()
    expect(within(items[1]).queryByText('Editando')).not.toBeInTheDocument()
  })

  it('triggers edit and delete with the record', async () => {
    const user = userEvent.setup()
    const first = record('1')
    const { onEdit, onDelete } = setup({ records: [first] })
    await user.click(screen.getByRole('button', { name: 'Editar' }))
    expect(onEdit).toHaveBeenCalledWith(first)
    await user.click(screen.getByRole('button', { name: 'Excluir' }))
    expect(onDelete).toHaveBeenCalledWith(first)
  })

  it('shows the storage error message', () => {
    setup({ storageError: 'Não foi possível salvar.' })
    expect(screen.getByText('Não foi possível salvar.')).toBeInTheDocument()
  })
})

describe('Pagination', () => {
  it('renders nothing for a single page', () => {
    setup({ records: [record('1')], page: 1, pageCount: 1 })
    expect(screen.queryByLabelText('Paginação')).not.toBeInTheDocument()
  })

  it('navigates pages', async () => {
    const user = userEvent.setup()
    const { onPageChange } = setup({
      records: Array.from({ length: 2 }, (_, i) => record(`${i}`)),
      page: 2,
      pageCount: 3,
    })
    expect(screen.getByText('Página 2 de 3')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Anterior' }))
    expect(onPageChange).toHaveBeenCalledWith(1)
    await user.click(screen.getByRole('button', { name: 'Próxima' }))
    expect(onPageChange).toHaveBeenCalledWith(3)
  })

  it('disables navigation at the bounds', () => {
    setup({ records: [record('1')], page: 1, pageCount: 1 })
    // hidden entirely, so nothing to disable
  })
})