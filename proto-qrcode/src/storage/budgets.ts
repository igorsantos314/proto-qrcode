import type { BudgetInput, BudgetRecord } from '../lib/budget/types'

const STORAGE_KEY = 'lasergest:budgets:v1'

function now(): string {
  return new Date().toISOString()
}

function newId(): string {
  return crypto.randomUUID()
}

function writeStored(records: BudgetRecord[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
}

export function readStoredBudgets(): BudgetRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return []
    }
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return []
    }
    return parsed as BudgetRecord[]
  } catch {
    return []
  }
}

export function listBudgets(): BudgetRecord[] {
  return readStoredBudgets().sort((a, b) => {
    const byCreated = b.createdAt.localeCompare(a.createdAt)
    if (byCreated !== 0) {
      return byCreated
    }
    const byUpdated = b.updatedAt.localeCompare(a.updatedAt)
    return byUpdated !== 0 ? byUpdated : a.id.localeCompare(b.id)
  })
}

export function getBudget(id: string): BudgetRecord | null {
  return readStoredBudgets().find((record) => record.id === id) ?? null
}

export function createBudget(input: BudgetInput): BudgetRecord {
  const timestamp = now()
  const record: BudgetRecord = {
    ...input,
    id: newId(),
    createdAt: timestamp,
    updatedAt: timestamp,
  }
  const records = readStoredBudgets()
  records.push(record)
  writeStored(records)
  return record
}

export function updateBudget(
  id: string,
  patch: Partial<BudgetInput>,
): BudgetRecord {
  const records = readStoredBudgets()
  const index = records.findIndex((record) => record.id === id)
  if (index === -1) {
    throw new Error(`Budget with id "${id}" not found.`)
  }
  const updated: BudgetRecord = {
    ...records[index],
    ...patch,
    id,
    updatedAt: now(),
  }
  records[index] = updated
  writeStored(records)
  return updated
}

export function removeBudget(id: string): void {
  const records = readStoredBudgets().filter((record) => record.id !== id)
  writeStored(records)
}

export function clearBudgets(): void {
  writeStored([])
}
