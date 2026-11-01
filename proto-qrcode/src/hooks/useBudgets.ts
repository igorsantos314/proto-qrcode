import { useCallback, useState } from 'react'
import type { BudgetInput, BudgetRecord } from '../lib/budget/types'
import {
  createBudget,
  listBudgets,
  removeBudget,
  updateBudget,
} from '../storage/budgets'

export const BUDGETS_STORAGE_ERROR =
  'Não foi possível salvar os orçamentos no armazenamento local. O espaço pode estar cheio ou o armazenamento indisponível.'

function safeList(): BudgetRecord[] {
  try {
    return listBudgets()
  } catch {
    return []
  }
}

export interface UseBudgets {
  records: BudgetRecord[]
  editingId: string | null
  storageError: string | null
  createRecord: (input: BudgetInput) => BudgetRecord | null
  updateRecord: (
    id: string,
    patch: Partial<BudgetInput>,
  ) => BudgetRecord | null
  removeRecord: (id: string) => boolean
  startEditing: (id: string) => void
  clearEditing: () => void
  refresh: () => void
}

export function useBudgets(): UseBudgets {
  const [records, setRecords] = useState<BudgetRecord[]>(() => safeList())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [storageError, setStorageError] = useState<string | null>(null)

  const refresh = useCallback(() => {
    try {
      setRecords(listBudgets())
      setStorageError(null)
    } catch {
      setStorageError(BUDGETS_STORAGE_ERROR)
    }
  }, [])

  const createRecord = useCallback((input: BudgetInput): BudgetRecord | null => {
    try {
      const created = createBudget(input)
      setRecords(safeList())
      setStorageError(null)
      return created
    } catch {
      const timestamp = new Date().toISOString()
      const fallback: BudgetRecord = {
        ...input,
        id: crypto.randomUUID(),
        createdAt: timestamp,
        updatedAt: timestamp,
      }
      setRecords((prev) => [fallback, ...prev])
      setStorageError(BUDGETS_STORAGE_ERROR)
      return fallback
    }
  }, [])

  const updateRecord = useCallback(
    (id: string, patch: Partial<BudgetInput>): BudgetRecord | null => {
      try {
        const updated = updateBudget(id, patch)
        setRecords(safeList())
        setStorageError(null)
        return updated
      } catch {
        const current = records.find((record) => record.id === id)
        const fallback = current
          ? { ...current, ...patch, updatedAt: new Date().toISOString() }
          : null
        if (fallback) {
          setRecords((prev) =>
            prev.map((record) => (record.id === id ? fallback : record)),
          )
        }
        setStorageError(BUDGETS_STORAGE_ERROR)
        return fallback
      }
    },
    [records],
  )

  const removeRecord = useCallback((id: string): boolean => {
    try {
      removeBudget(id)
      setRecords(safeList())
      setStorageError(null)
      return true
    } catch {
      setRecords((prev) => prev.filter((record) => record.id !== id))
      setStorageError(BUDGETS_STORAGE_ERROR)
      return false
    }
  }, [])

  const startEditing = useCallback((id: string) => {
    setEditingId(id)
  }, [])

  const clearEditing = useCallback(() => {
    setEditingId(null)
  }, [])

  return {
    records,
    editingId,
    storageError,
    createRecord,
    updateRecord,
    removeRecord,
    startEditing,
    clearEditing,
    refresh,
  }
}
