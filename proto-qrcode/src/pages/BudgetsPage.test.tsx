import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from '../App'
import { formatCurrency } from '../lib/format'

const STORAGE_KEY = 'lasergest:budgets:v1'

async function openBudgets() {
  const user = userEvent.setup()
  render(<App />)
  await user.click(screen.getByRole('link', { name: 'Orçamentos' }))
  return user
}

function setNumber(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } })
}

function summary() {
  return within(
    screen.getByRole('region', { name: 'Resumo do orçamento' }),
  )
}

function summaryValue(label: string): string {
  const row = summary().getByText(label).parentElement
  return row?.textContent ?? ''
}

function storedBudgets(): Array<Record<string, unknown>> {
  const raw = localStorage.getItem(STORAGE_KEY)
  return raw ? (JSON.parse(raw) as Array<Record<string, unknown>>) : []
}

async function fillKnownBudget(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('Tipo de material'), 'MDF')
  setNumber('Custo do material (R$/m²)', '50')
  setNumber('Largura da peça (mm)', '100')
  setNumber('Altura da peça (mm)', '200')
  setNumber('Quantidade de peças', '10')
  setNumber('Tempo de gravação por peça (h)', '0.1')
  setNumber('Depreciação da máquina (R$/h)', '5')
}

describe('BudgetsPage', () => {
  it('renders every budget field and prefills reusable defaults', async () => {
    await openBudgets()

    expect(screen.getByLabelText('Tipo de material')).toBeInTheDocument()
    expect(screen.getByLabelText('Custo do material (R$/m²)')).toBeInTheDocument()
    expect(screen.getByLabelText('Largura da peça (mm)')).toBeInTheDocument()
    expect(screen.getByLabelText('Altura da peça (mm)')).toBeInTheDocument()
    expect(screen.getByLabelText('Quantidade de peças')).toHaveValue(1)
    expect(
      screen.getByLabelText('Tempo de gravação por peça (h)'),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Custo de energia (R$/kWh)')).toHaveValue(0.75)
    expect(screen.getByLabelText('Consumo da máquina (kWh/h)')).toHaveValue(
      0.005,
    )
    expect(
      screen.getByLabelText('Depreciação da máquina (R$/h)'),
    ).toHaveValue(0)
    expect(screen.getByLabelText('Margem de lucro (%)')).toHaveValue(30)
    expect(screen.getByLabelText('Preço de venda unitário (R$)')).toBeInTheDocument()
  })

  it('blocks saving when required inputs are missing', async () => {
    const user = await openBudgets()
    await user.click(screen.getByRole('button', { name: 'Salvar orçamento' }))

    expect(screen.getByText('Informe o tipo de material.')).toBeInTheDocument()
    expect(
      screen.getByText('Informe largura e altura maiores que zero.'),
    ).toBeInTheDocument()
    expect(storedBudgets()).toHaveLength(0)
  })

  it('shows the live breakdown for a known budget', async () => {
    const user = await openBudgets()
    await fillKnownBudget(user)

    expect(summaryValue('Área da peça')).toContain('0,02 m²')
    expect(summaryValue('Material por peça')).toContain(formatCurrency(1))
    expect(summaryValue('Material total')).toContain(formatCurrency(10))
    expect(summaryValue('Máquina por hora')).toContain(formatCurrency(5.00375))
    expect(summaryValue('Máquina total')).toContain(formatCurrency(5.00375))
    expect(summaryValue('Custo total')).toContain(formatCurrency(15.00375))
    expect(summaryValue('Custo por unidade')).toContain(formatCurrency(1.500375))
  })

  it('adds additional costs to the breakdown', async () => {
    const user = await openBudgets()
    await user.click(screen.getByRole('button', { name: '+ Adicionar custo' }))
    await user.click(screen.getByRole('button', { name: '+ Adicionar custo' }))

    const descriptions = screen.getAllByLabelText('Descrição do custo adicional')
    const values = screen.getAllByLabelText('Valor do custo adicional')
    await user.type(descriptions[0], 'Cola')
    fireEvent.change(values[0], { target: { value: '3' } })
    await user.type(descriptions[1], 'Embalagem')
    fireEvent.change(values[1], { target: { value: '2' } })

    expect(summaryValue('Custos adicionais')).toContain(formatCurrency(5))
  })

  it('keeps margin and sale price in sync in both directions', async () => {
    const user = await openBudgets()
    await user.type(screen.getByLabelText('Tipo de material'), 'MDF')
    setNumber('Custo do material (R$/m²)', '50')
    setNumber('Largura da peça (mm)', '100')
    setNumber('Altura da peça (mm)', '200')
    setNumber('Quantidade de peças', '10')

    const margin = screen.getByLabelText('Margem de lucro (%)')
    const price = screen.getByLabelText('Preço de venda unitário (R$)')

    expect(price).toHaveValue(1.43)

    setNumber('Margem de lucro (%)', '50')
    expect(price).toHaveValue(2)

    setNumber('Preço de venda unitário (R$)', '6')
    expect(margin).toHaveValue(83.33)

    setNumber('Custo do material (R$/m²)', '100')
    expect(price).toHaveValue(6)
    expect(margin).toHaveValue(66.67)
  })

  it('rejects a margin of 100% or more', async () => {
    const user = await openBudgets()
    await fillKnownBudget(user)

    setNumber('Margem de lucro (%)', '100')
    expect(
      screen.getByText('A margem deve ser menor que 100%.'),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Salvar orçamento' }))
    expect(
      screen.getByText('A margem de lucro deve ser menor que 100%.'),
    ).toBeInTheDocument()
    expect(storedBudgets()).toHaveLength(0)
  })
})

describe('BudgetsPage parameters', () => {
  it('creates, edits, validates and deletes reusable parameters', async () => {
    const user = await openBudgets()
    await user.click(screen.getByRole('button', { name: 'Gerenciar' }))

    const varnish = screen.getByLabelText('Valor do parâmetro Verniz')
    fireEvent.change(varnish, { target: { value: '40' } })
    fireEvent.blur(varnish)
    expect(screen.getByLabelText('Valor do parâmetro Verniz')).toHaveValue(40)

    fireEvent.change(screen.getByLabelText('Nome do novo parâmetro'), {
      target: { value: 'Fita' },
    })
    fireEvent.change(screen.getByLabelText('Unidade do novo parâmetro'), {
      target: { value: 'm' },
    })
    fireEvent.change(screen.getByLabelText('Valor do novo parâmetro'), {
      target: { value: '2' },
    })
    await user.click(screen.getByRole('button', { name: 'Adicionar' }))
    expect(screen.getByLabelText('Nome do parâmetro Fita')).toHaveValue('Fita')

    await user.click(
      screen.getByRole('button', { name: 'Excluir parâmetro Fita' }),
    )
    expect(
      screen.queryByLabelText('Nome do parâmetro Fita'),
    ).not.toBeInTheDocument()
  })

  it('validates new parameter name and value', async () => {
    const user = await openBudgets()
    await user.click(screen.getByRole('button', { name: 'Gerenciar' }))

    await user.click(screen.getByRole('button', { name: 'Adicionar' }))
    expect(screen.getByText('Informe o nome do parâmetro.')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Nome do novo parâmetro'), {
      target: { value: 'Fita' },
    })
    fireEvent.change(screen.getByLabelText('Valor do novo parâmetro'), {
      target: { value: '-1' },
    })
    await user.click(screen.getByRole('button', { name: 'Adicionar' }))
    expect(
      screen.getByText('Informe um valor válido e não negativo.'),
    ).toBeInTheDocument()
  })

  it('prefills a new budget from the current parameters', async () => {
    const user = await openBudgets()
    await user.click(screen.getByRole('button', { name: 'Gerenciar' }))

    const margin = screen.getByLabelText('Valor do parâmetro Margem padrão')
    fireEvent.change(margin, { target: { value: '45' } })
    fireEvent.blur(margin)

    await user.click(screen.getByRole('button', { name: 'Novo orçamento' }))
    expect(screen.getByLabelText('Margem de lucro (%)')).toHaveValue(45)
  })

  it('does not reseed defaults after all parameters are deleted and remounted', async () => {
    const user = userEvent.setup()
    const first = render(<App />)
    await user.click(screen.getByRole('link', { name: 'Orçamentos' }))
    await user.click(screen.getByRole('button', { name: 'Gerenciar' }))

    for (const name of [
      'Verniz',
      'Produto de limpeza',
      'Custo de energia',
      'Consumo da máquina',
      'Depreciação da máquina',
      'Margem padrão',
    ]) {
      await user.click(
        screen.getByRole('button', { name: `Excluir parâmetro ${name}` }),
      )
    }
    expect(screen.getByText('Nenhum parâmetro cadastrado.')).toBeInTheDocument()

    first.unmount()
    const secondUser = userEvent.setup()
    render(<App />)
    await secondUser.click(screen.getByRole('link', { name: 'Orçamentos' }))
    await secondUser.click(screen.getByRole('button', { name: 'Gerenciar' }))
    expect(screen.getByText('Nenhum parâmetro cadastrado.')).toBeInTheDocument()
  })
})

describe('BudgetsPage applied parameters and persistence', () => {
  it('applies reusable parameters with quantity to the budget total', async () => {
    const user = await openBudgets()
    await user.click(screen.getByRole('button', { name: 'Gerenciar' }))

    const varnish = screen.getByLabelText('Valor do parâmetro Verniz')
    fireEvent.change(varnish, { target: { value: '40' } })
    fireEvent.blur(varnish)
    const cleaner = screen.getByLabelText('Valor do parâmetro Produto de limpeza')
    fireEvent.change(cleaner, { target: { value: '20' } })
    fireEvent.blur(cleaner)

    await user.selectOptions(
      screen.getByLabelText('Parâmetro reutilizável'),
      'param-verniz',
    )
    fireEvent.change(screen.getByLabelText('Quantidade do parâmetro'), {
      target: { value: '0.1' },
    })
    await user.click(screen.getByRole('button', { name: 'Aplicar' }))

    await user.selectOptions(
      screen.getByLabelText('Parâmetro reutilizável'),
      'param-limpeza',
    )
    fireEvent.change(screen.getByLabelText('Quantidade do parâmetro'), {
      target: { value: '0.1' },
    })
    await user.click(screen.getByRole('button', { name: 'Aplicar' }))

    expect(summaryValue('Custos adicionais')).toContain(formatCurrency(6))
  })

  it('saves, edits and deletes a budget from the cache', async () => {
    const user = await openBudgets()
    await user.type(screen.getByLabelText('Tipo de material'), 'MDF')
    setNumber('Custo do material (R$/m²)', '50')
    setNumber('Largura da peça (mm)', '100')
    setNumber('Altura da peça (mm)', '200')
    setNumber('Quantidade de peças', '10')

    await user.click(screen.getByRole('button', { name: 'Salvar orçamento' }))
    const savedDialog = screen.getByRole('dialog', { name: 'Orçamento salvo' })
    await user.click(within(savedDialog).getByRole('button', { name: 'Entendi' }))

    expect(storedBudgets()).toHaveLength(1)
    const list = screen.getByRole('region', { name: 'Orçamentos salvos' })
    expect(within(list).getByText('MDF')).toBeInTheDocument()
    expect(within(list).getByText('1 no total')).toBeInTheDocument()

    await user.click(within(list).getByRole('button', { name: 'Editar' }))
    expect(screen.getByText('Editando orçamento')).toBeInTheDocument()
    setNumber('Quantidade de peças', '5')
    await user.click(
      screen.getByRole('button', { name: 'Salvar alterações' }),
    )
    const editedDialog = screen.getByRole('dialog', { name: 'Orçamento salvo' })
    await user.click(
      within(editedDialog).getByRole('button', { name: 'Entendi' }),
    )

    expect(storedBudgets()).toHaveLength(1)
    expect(storedBudgets()[0].quantity).toBe(5)

    const updatedList = screen.getByRole('region', { name: 'Orçamentos salvos' })
    await user.click(
      within(updatedList).getByRole('button', { name: 'Excluir' }),
    )
    const deleteDialog = screen.getByRole('dialog', {
      name: 'Excluir orçamento?',
    })
    await user.click(
      within(deleteDialog).getByRole('button', { name: 'Cancelar' }),
    )
    expect(storedBudgets()).toHaveLength(1)

    await user.click(
      within(updatedList).getByRole('button', { name: 'Excluir' }),
    )
    const confirmDialog = screen.getByRole('dialog', {
      name: 'Excluir orçamento?',
    })
    await user.click(
      within(confirmDialog).getByRole('button', { name: 'Excluir' }),
    )
    expect(storedBudgets()).toHaveLength(0)
    expect(
      screen.getByText(/Nenhum orçamento salvo ainda/),
    ).toBeInTheDocument()
  })

  it('keeps applied parameter values as a snapshot after editing the parameter', async () => {
    const user = await openBudgets()
    await user.click(screen.getByRole('button', { name: 'Gerenciar' }))
    const varnish = screen.getByLabelText('Valor do parâmetro Verniz')
    fireEvent.change(varnish, { target: { value: '40' } })
    fireEvent.blur(varnish)

    await user.selectOptions(
      screen.getByLabelText('Parâmetro reutilizável'),
      'param-verniz',
    )
    fireEvent.change(screen.getByLabelText('Quantidade do parâmetro'), {
      target: { value: '0.1' },
    })
    await user.click(screen.getByRole('button', { name: 'Aplicar' }))

    await user.type(screen.getByLabelText('Tipo de material'), 'MDF')
    setNumber('Custo do material (R$/m²)', '50')
    setNumber('Largura da peça (mm)', '100')
    setNumber('Altura da peça (mm)', '100')
    setNumber('Quantidade de peças', '1')
    await user.click(screen.getByRole('button', { name: 'Salvar orçamento' }))
    const dialog = screen.getByRole('dialog', { name: 'Orçamento salvo' })
    await user.click(within(dialog).getByRole('button', { name: 'Entendi' }))

    const saved = storedBudgets()[0] as {
      appliedParameters: Array<{ unitValue: number }>
    }
    expect(saved.appliedParameters[0].unitValue).toBe(40)
    const list = screen.getByRole('region', { name: 'Orçamentos salvos' })
    expect(within(list).getByText(/4,50/)).toBeInTheDocument()

    const varnishAgain = screen.getByLabelText('Valor do parâmetro Verniz')
    fireEvent.change(varnishAgain, { target: { value: '80' } })
    fireEvent.blur(varnishAgain)

    expect(saved.appliedParameters[0].unitValue).toBe(40)
    expect(within(list).getByText(/4,50/)).toBeInTheDocument()
  })
})
