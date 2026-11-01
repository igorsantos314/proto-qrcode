import { describe, expect, it } from 'vitest'
import type { BudgetInput } from '../lib/budget/types'
import {
  clearBudgets,
  createBudget,
  getBudget,
  listBudgets,
  readStoredBudgets,
  removeBudget,
  updateBudget,
} from './budgets'

const STORAGE_KEY = 'lasergest:budgets:v1'

function input(overrides: Partial<BudgetInput> = {}): BudgetInput {
  return {
    materialType: 'MDF',
    materialCostPerM2: 50,
    widthMm: 100,
    heightMm: 200,
    quantity: 10,
    engravingTimeHours: 0.1,
    energyCostPerKwh: 0.75,
    machineConsumptionKwhPerHour: 0.005,
    depreciationPerHour: 5,
    marginPercent: 30,
    salePrice: 0,
    additionalCosts: [],
    appliedParameters: [],
    ...overrides,
  }
}

describe('budgets storage', () => {
  it('creates a budget and lists it', () => {
    const created = createBudget(input())
    expect(created.id).toBeTruthy()
    expect(listBudgets()).toHaveLength(1)
    expect(listBudgets()[0]).toEqual(created)
  })

  it('lists newest-first by createdAt', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        { ...input(), id: 'a', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' },
        { ...input(), id: 'b', createdAt: '2026-03-01T00:00:00.000Z', updatedAt: '2026-03-01T00:00:00.000Z' },
        { ...input(), id: 'c', createdAt: '2026-02-01T00:00:00.000Z', updatedAt: '2026-02-01T00:00:00.000Z' },
      ]),
    )
    expect(listBudgets().map((record) => record.id)).toEqual(['b', 'c', 'a'])
  })

  it('gets, updates and removes a budget', () => {
    const created = createBudget(input({ materialType: 'Acrílico' }))
    expect(getBudget(created.id)?.materialType).toBe('Acrílico')
    expect(getBudget('missing')).toBeNull()

    const updated = updateBudget(created.id, { quantity: 4 })
    expect(updated.quantity).toBe(4)
    expect(listBudgets()).toHaveLength(1)

    removeBudget(created.id)
    expect(listBudgets()).toHaveLength(0)
  })

  it('throws when updating an unknown budget', () => {
    expect(() => updateBudget('missing', { quantity: 1 })).toThrow(/not found/)
  })

  it('round-trips applied parameters and additional costs', () => {
    const created = createBudget(
      input({
        additionalCosts: [{ id: 'c1', description: 'Cola', value: 2.5 }],
        appliedParameters: [
          {
            parameterId: 'p1',
            name: 'Verniz',
            unit: 'R$/L',
            unitValue: 40,
            quantity: 0.2,
          },
        ],
      }),
    )
    const readBack = getBudget(created.id)
    expect(readBack).toEqual(created)
  })

  it('tolerates corrupt stored JSON and missing keys', () => {
    localStorage.setItem(STORAGE_KEY, '{not json')
    expect(readStoredBudgets()).toEqual([])
    localStorage.removeItem(STORAGE_KEY)
    expect(readStoredBudgets()).toEqual([])
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ nope: true }))
    expect(readStoredBudgets()).toEqual([])
  })

  it('clears all budgets', () => {
    createBudget(input())
    createBudget(input())
    clearBudgets()
    expect(listBudgets()).toHaveLength(0)
  })
})
