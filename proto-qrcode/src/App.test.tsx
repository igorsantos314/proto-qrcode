import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import App from './App'
import { convertLogoToBlackAndWhite } from './lib/qr/logoBlackAndWhite'

const STORAGE_KEY = 'proto-qrcode:saved:v1'

vi.mock('./lib/qr/logoBlackAndWhite', () => ({
  convertLogoToBlackAndWhite: vi.fn(
    async () => 'data:image/png;base64,LOGO',
  ),
}))

const mockedConvert = vi.mocked(convertLogoToBlackAndWhite)

function storedRecords(): Array<Record<string, unknown>> {
  const raw = localStorage.getItem(STORAGE_KEY)
  return raw ? (JSON.parse(raw) as Array<Record<string, unknown>>) : []
}

async function generateText(text: string) {
  const user = userEvent.setup()
  await user.type(screen.getByLabelText('Conteúdo do QR code'), text)
  await user.click(screen.getByRole('button', { name: 'Gerar' }))
}

async function saveCurrent() {
  const user = userEvent.setup()
  await user.click(screen.getByRole('button', { name: /salvar/i }))
  const dialog = screen.getByRole('dialog', { name: 'QR code salvo' })
  expect(dialog.textContent).toContain('salvo localmente')
  await user.click(within(dialog).getByRole('button', { name: 'Entendi' }))
}

describe('App integration flows', () => {
  it('starts on the text tab by default and shows the generator', () => {
    render(<App />)
    expect(screen.getByRole('tab', { name: 'Texto' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.getByRole('tab', { name: 'Pix' })).toHaveAttribute(
      'aria-selected',
      'false',
    )
    expect(screen.getByText('Proto QR Code')).toBeInTheDocument()
    expect(screen.getByText(/Nenhum QR code salvo ainda/)).toBeInTheDocument()
  })

  it('generates a QR code without persisting and saves it on Salvar (6.1)', async () => {
    render(<App />)
    await generateText('Olá mundo')

    const canvas = screen.getByTestId('qr-canvas')
    expect(canvas).toHaveAttribute('data-value', 'Olá mundo')
    expect(canvas).toHaveAttribute('data-bgcolor', 'rgba(0,0,0,0)')

    expect(storedRecords()).toHaveLength(0)
    expect(screen.getByText(/Nenhum QR code salvo ainda/)).toBeInTheDocument()

    await saveCurrent()

    const records = storedRecords()
    expect(records).toHaveLength(1)
    expect(records[0].type).toBe('text')
    expect(records[0].payload).toBe('Olá mundo')
    expect((records[0].fields as Record<string, string>).content).toBe(
      'Olá mundo',
    )
    expect(records[0].background).toBe('none')
    expect(screen.getByTitle('Olá mundo')).toBeInTheDocument()
  })

  it('only saves when clicking Salvar (5.7)', async () => {
    render(<App />)
    await generateText('sem salvar')
    expect(storedRecords()).toHaveLength(0)
    await userEvent.click(screen.getByRole('button', { name: /salvar/i }))
    expect(storedRecords()).toHaveLength(1)
  })

  it('updates an existing record when saving while editing (6.2)', async () => {
    render(<App />)
    await generateText('primeira versão')
    await saveCurrent()
    expect(storedRecords()).toHaveLength(1)

    await userEvent.click(screen.getByRole('button', { name: 'Editar' }))
    const textarea = screen.getByLabelText('Conteúdo do QR code')
    expect(textarea).toHaveValue('primeira versão')
    expect(screen.getByText('Editando')).toBeInTheDocument()

    await userEvent.clear(textarea)
    await userEvent.type(textarea, 'versão editada')
    await saveCurrent()

    const records = storedRecords()
    expect(records).toHaveLength(1)
    expect(records[0].payload).toBe('versão editada')
    expect(screen.queryByText('Editando')).not.toBeInTheDocument()
  })

  it('deletes a record after confirmation (6.3)', async () => {
    render(<App />)
    await generateText('para excluir')
    await saveCurrent()
    expect(storedRecords()).toHaveLength(1)

    await userEvent.click(screen.getByRole('button', { name: 'Excluir' }))
    const dialog = screen.getByRole('dialog', { name: 'Excluir QR code?' })
    expect(dialog.textContent).toContain('removido permanentemente')

    await userEvent.click(within(dialog).getByRole('button', { name: 'Excluir' }))
    expect(storedRecords()).toHaveLength(0)
    expect(screen.getByText(/Nenhum QR code salvo ainda/)).toBeInTheDocument()
  })

  it('keeps the record when the delete dialog is cancelled', async () => {
    render(<App />)
    await generateText('manter')
    await saveCurrent()

    await userEvent.click(screen.getByRole('button', { name: 'Excluir' }))
    const dialog = screen.getByRole('dialog', { name: 'Excluir QR code?' })
    await userEvent.click(within(dialog).getByRole('button', { name: 'Cancelar' }))

    expect(storedRecords()).toHaveLength(1)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('keeps records across remounts and repopulates the form identically (6.4)', async () => {
    const { unmount } = render(<App />)
    await generateText('persistido')
    await saveCurrent()
    expect(storedRecords()).toHaveLength(1)
    unmount()

    render(<App />)
    expect(screen.getByTitle('persistido')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Editar' }))
    const textarea = screen.getByLabelText('Conteúdo do QR code')
    expect(textarea).toHaveValue('persistido')
    expect(screen.getByRole('radio', { name: 'Sem fundo' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
  })

  it('round-trips background and logo along with the text (6.4)', async () => {
    render(<App />)
    await userEvent.click(screen.getByRole('radio', { name: 'Com fundo' }))
    const input = screen.getByLabelText('Escolher imagem')
    fireEvent.change(input, { target: { files: [new File(['x'], 'logo.png')] } })
    expect(mockedConvert).toHaveBeenCalled()
    expect(
      await screen.findByRole('img', { name: 'Logomarca selecionada' }),
    ).toBeInTheDocument()

    await generateText('com logo e fundo')
    await saveCurrent()

    const record = storedRecords()[0]
    expect(record.background).toBe('white')
    expect(record.logoDataUrl).toBe('data:image/png;base64,LOGO')
  })

  it('flags the QR as stale on change and clears it on regenerate (4.5)', async () => {
    render(<App />)
    await generateText('v1')
    expect(screen.queryByText(/Configuração alterada/)).not.toBeInTheDocument()

    const textarea = screen.getByLabelText('Conteúdo do QR code')
    await userEvent.type(textarea, '!')
    expect(screen.getByText(/Configuração alterada/)).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Gerar' }))
    expect(screen.queryByText(/Configuração alterada/)).not.toBeInTheDocument()
    expect(screen.getByTestId('qr-canvas')).toHaveAttribute('data-value', 'v1!')
  })

  it('shows validation errors and does not generate or save empty text', async () => {
    render(<App />)
    await userEvent.click(screen.getByRole('button', { name: 'Gerar' }))
    expect(screen.getByText('Informe o texto do QR code.')).toBeInTheDocument()
    expect(screen.queryByTestId('qr-canvas')).not.toBeInTheDocument()
    expect(storedRecords()).toHaveLength(0)

    await userEvent.click(screen.getByRole('button', { name: /salvar/i }))
    expect(storedRecords()).toHaveLength(0)
  })

  it('builds a wifi payload, shows its preview, and saves it', async () => {
    render(<App />)
    await userEvent.click(screen.getByRole('tab', { name: 'WiFi' }))

    expect(
      screen.queryByText('Conteúdo do QR code (prévia)'),
    ).toBeInTheDocument()

    await userEvent.type(screen.getByLabelText('Nome da rede (SSID)'), 'MinhaRede')
    await userEvent.type(screen.getByLabelText('Senha'), 'segredo')
    await userEvent.click(screen.getByRole('button', { name: 'Gerar' }))

    const canvas = screen.getByTestId('qr-canvas')
    expect(canvas).toHaveAttribute(
      'data-value',
      'WIFI:T:WPA;S:MinhaRede;P:segredo;H:false;;',
    )
    expect(
      screen.getByText('WIFI:T:WPA;S:MinhaRede;P:segredo;H:false;;'),
    ).toBeInTheDocument()

    await saveCurrent()
    expect(storedRecords()[0].type).toBe('wifi')
  })

  it('shows the payload preview on non-text tabs and hides it on text (5.6)', async () => {
    render(<App />)
    expect(screen.queryByText('Conteúdo do QR code (prévia)')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('tab', { name: 'Pix' }))
    expect(
      screen.getByText('Conteúdo do QR code (prévia)'),
    ).toBeInTheDocument()

    await userEvent.type(screen.getByLabelText('Chave Pix'), 'chave@exemplo.com')
    await userEvent.type(screen.getByLabelText('Nome do recebedor'), 'Fulano')
    await userEvent.type(screen.getByLabelText('Cidade'), 'Sao Paulo')

    const preview = screen.getByText(/000201/).textContent ?? ''
    expect(preview).toContain('br.gov.bcb.pix')
    expect(preview).toContain('chave@exemplo.com')

    await userEvent.click(screen.getByRole('tab', { name: 'Texto' }))
    expect(screen.queryByText('Conteúdo do QR code (prévia)')).not.toBeInTheDocument()
  })

  it('shows the save confirmation dialog and dismisses it (6.6)', async () => {
    render(<App />)
    await generateText('com dialog')
    await userEvent.click(screen.getByRole('button', { name: /salvar/i }))

    const dialog = screen.getByRole('dialog', { name: 'QR code salvo' })
    expect(dialog.textContent).toContain('limpar o cache do navegador')
    expect(dialog.textContent).toContain('todos os QR codes salvos serão perdidos')

    await userEvent.click(within(dialog).getByRole('button', { name: 'Entendi' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(storedRecords()).toHaveLength(1)
  })

  it('paginates the saved list at 50 items per page', async () => {
    const seed = Array.from({ length: 55 }, (_, i) => ({
      id: `seed-${i}`,
      type: 'text',
      fields: { content: `item ${i}` },
      payload: `item ${i}`,
      background: 'none',
      logoDataUrl: null,
      createdAt: new Date(Date.UTC(2026, 0, 1, 0, 0, i + 1)).toISOString(),
      updatedAt: new Date(Date.UTC(2026, 0, 1, 0, 0, i + 1)).toISOString(),
    }))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))

    render(<App />)
    expect(screen.getByText('55 no total')).toBeInTheDocument()
    expect(screen.getByText('Página 1 de 2')).toBeInTheDocument()
    const list = screen.getByRole('list')
    expect(within(list).getAllByRole('listitem')).toHaveLength(50)

    await userEvent.click(screen.getByRole('button', { name: 'Próxima' }))
    expect(screen.getByText('Página 2 de 2')).toBeInTheDocument()
    const list2 = screen.getByRole('list')
    expect(within(list2).getAllByRole('listitem')).toHaveLength(5)
  })
})