import { useCallback, useState } from 'react'
import {
  createSaved,
  listSaved,
  removeSaved,
  updateSaved,
} from '../storage/savedQrcodes'
import type { SavedQrCode, SavedQrCodeInput } from '../types'

export const PAGE_SIZE = 50

export const STORAGE_ERROR_MESSAGE =
  'Não foi possível salvar no armazenamento local. O espaço pode estar cheio ou o armazenamento indisponível.'

export interface UseSavedQrcodes {
  records: SavedQrCode[]
  page: number
  pageCount: number
  pageRecords: SavedQrCode[]
  editingId: string | null
  storageError: string | null
  createRecord: (input: SavedQrCodeInput) => SavedQrCode | null
  updateRecord: (
    id: string,
    patch: Partial<SavedQrCodeInput>,
  ) => SavedQrCode | null
  removeRecord: (id: string) => boolean
  startEditing: (id: string) => void
  clearEditing: () => void
  setPage: (page: number) => void
  refresh: () => void
}

function pageCountFor(length: number): number {
  return Math.max(1, Math.ceil(length / PAGE_SIZE))
}

export function useSavedQrcodes(): UseSavedQrcodes {
  const [records, setRecords] = useState<SavedQrCode[]>(() => listSaved())
  const [page, setPage] = useState(1)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [storageError, setStorageError] = useState<string | null>(null)

  const pageCount = pageCountFor(records.length)
  const safePage = Math.min(page, pageCount)
  const pageRecords = records.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  )

  const refresh = useCallback(() => {
    try {
      const all = listSaved()
      setRecords(all)
      setPage((current) => Math.min(current, pageCountFor(all.length)))
      setStorageError(null)
    } catch {
      setStorageError(STORAGE_ERROR_MESSAGE)
    }
  }, [])

  const createRecord = useCallback((input: SavedQrCodeInput): SavedQrCode | null => {
    try {
      const created = createSaved(input)
      const all = listSaved()
      setRecords(all)
      setPage(1)
      setStorageError(null)
      return created
    } catch {
      setStorageError(STORAGE_ERROR_MESSAGE)
      return null
    }
  }, [])

  const updateRecord = useCallback(
    (id: string, patch: Partial<SavedQrCodeInput>): SavedQrCode | null => {
      try {
        const updated = updateSaved(id, patch)
        const all = listSaved()
        setRecords(all)
        setPage((current) => Math.min(current, pageCountFor(all.length)))
        setStorageError(null)
        return updated
      } catch {
        setStorageError(STORAGE_ERROR_MESSAGE)
        return null
      }
    },
    [],
  )

  const removeRecord = useCallback((id: string): boolean => {
    try {
      removeSaved(id)
      const all = listSaved()
      setRecords(all)
      setPage((current) => Math.min(current, pageCountFor(all.length)))
      setStorageError(null)
      return true
    } catch {
      setStorageError(STORAGE_ERROR_MESSAGE)
      return false
    }
  }, [])

  const startEditing = useCallback((id: string) => {
    setEditingId(id)
  }, [])

  const clearEditing = useCallback(() => {
    setEditingId(null)
  }, [])

  const goToPage = useCallback(
    (next: number) => {
      setPage(Math.min(Math.max(1, next), pageCountFor(records.length)))
    },
    [records.length],
  )

  return {
    records,
    page,
    pageCount,
    pageRecords,
    editingId,
    storageError,
    createRecord,
    updateRecord,
    removeRecord,
    startEditing,
    clearEditing,
    setPage: goToPage,
    refresh,
  }
}