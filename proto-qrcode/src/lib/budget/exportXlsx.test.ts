import { describe, expect, it } from 'vitest'
import type { BudgetRecord } from './types'
import { budgetFilename, budgetSlug, buildBudgetSheetRows } from './exportXlsx'

const record: BudgetRecord = {
  id: 'b1',
  materialType: 'Acrílico Preto',
  materialCostPerM2: 50,
  widthMm: 100,
  heightMm: 200,
  quantity: 10,
  engravingTimeHours: 0.1,
  energyCostPerKwh: 0.75,
  machineConsumptionKwhPerHour: 0.005,
  depreciationPerHour: 5,
  marginPercent: 30,
  salePrice: 3.43,
  additionalCosts: [{ id: 'c1', description: 'Cola', value: 2 }],
  appliedParameters: [
    {
      parameterId: 'p1',
      name: 'Verniz',
      unit: 'R$/L',
      unitValue: 40,
      quantity: 0.1,
    },
  ],
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

describe('budget xlsx export', () => {
  it('builds a slug for the filename', () => {
    expect(budgetSlug('Acrílico Preto')).toBe('acrilico-preto')
    expect(budgetSlug('   ')).toBe('material')
  })

  it('builds an orcamento filename with timestamp', () => {
    expect(budgetFilename(record)).toMatch(
      /^orcamento-acrilico-preto-\d+\.xlsx$/,
    )
  })

  it('includes inputs, parameters, additional costs and totals', () => {
    const rows = buildBudgetSheetRows(record)
    const flat = rows.map((row) => row.join(' | '))
    expect(flat.some((row) => row.includes('Material | Acrílico Preto'))).toBe(
      true,
    )
    expect(flat.some((row) => row.includes('Verniz (R$/L)'))).toBe(true)
    expect(flat.some((row) => row.includes('Cola | 2'))).toBe(true)
    expect(flat.some((row) => row.includes('Custo total (R$)'))).toBe(true)
    expect(flat.some((row) => row.includes('Custo por unidade (R$)'))).toBe(
      true,
    )
    expect(flat.some((row) => row.includes('Margem de lucro (%)'))).toBe(true)
    expect(flat.some((row) => row.includes('Preço de venda unitário (R$)'))).toBe(
      true,
    )
  })
})
