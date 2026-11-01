import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { BUDGETS_STORAGE_ERROR, useBudgets } from './useBudgets'
import { createBudget, listBudgets } from '../storage/budgets'
import type { BudgetInput } from '../lib/budget/types'

afterEach(() => {
  vi.restoreAllMocks()
  vi.useRealTimers()
})

function input(n: number, overrides: Partial<BudgetInput> = {}): BudgetInput {
  return {
    materialType: `Material ${n}`,
    materialCostPerM2: 50,
    widthMm: 100,
    heightMm: 100,
    quantity: 1,
    engravingTimeHours: 0.1,
    energyCostPerKwh: 0.75,
    machineConsumptionKwhPerHour: 0.005,
    depreciationPerHour: 5,
    marginPercent: 30,
    salePrice: 10,
    additionalCosts: [],
    appliedParameters: [],
    ...overrides,
  }
}

describe('useBudgets', () => {
  it('initializes records from storage and tracks editing', () => {
    const created = createBudget(input(1))
    const { result } = renderHook(() => useBudgets())
    expect(result.current.records).toHaveLength(1)
    expect(result.current.editingId).toBeNull()

    act(() => {
      result.current.startEditing(created.id)
    })
    expect(result.current.editingId).toBe(created.id)

    act(() => {
      result.current.clearEditing()
    })
    expect(result.current.editingId).toBeNull()
  })

  it('lists budgets newest-first', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'))
    createBudget(input(1))
    vi.setSystemTime(new Date('2026-02-01T00:00:00.000Z'))
    createBudget(input(2))
    vi.useRealTimers()

    const { result } = renderHook(() => useBudgets())
    expect(result.current.records).toHaveLength(2)
    expect(result.current.records.map((record) => record.materialType)).toEqual([
      'Material 2',
      'Material 1',
    ])
  })

  it('updates a record in place without duplicating it', () => {
    const created = createBudget(input(1))
    const { result } = renderHook(() => useBudgets())
    act(() => {
      result.current.updateRecord(created.id, { quantity: 5 })
    })
    expect(result.current.records).toHaveLength(1)
    expect(result.current.records[0].quantity).toBe(5)
  })

  it('removes a record', () => {
    const a = createBudget(input(1))
    createBudget(input(2))
    const { result } = renderHook(() => useBudgets())
    act(() => {
      result.current.removeRecord(a.id)
    })
    expect(result.current.records).toHaveLength(1)
    expect(result.current.records[0].materialType).toBe('Material 2')
  })

  it('persists records across a remount', () => {
    const first = renderHook(() => useBudgets())
    act(() => {
      first.result.current.createRecord(input(1))
    })
    first.unmount()

    const second = renderHook(() => useBudgets())
    expect(second.result.current.records).toHaveLength(1)
    expect(listBudgets()).toHaveLength(1)
  })

  it('keeps in-memory records and reports a storage failure', () => {
    const { result } = renderHook(() => useBudgets())
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota')
    })

    act(() => {
      result.current.createRecord(input(1))
    })

    expect(result.current.records).toHaveLength(1)
    expect(result.current.storageError).toBe(BUDGETS_STORAGE_ERROR)
  })
})
