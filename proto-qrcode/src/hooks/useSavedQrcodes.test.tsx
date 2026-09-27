import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import {
  STORAGE_ERROR_MESSAGE,
  useSavedQrcodes,
} from './useSavedQrcodes'
import { createSaved, listSaved } from '../storage/savedQrcodes'
import type { SavedQrCodeInput } from '../types'

const STORAGE_KEY = 'proto-qrcode:saved:v1'

function input(n: number, overrides: Partial<SavedQrCodeInput> = {}): SavedQrCodeInput {
  return {
    type: 'text',
    fields: { content: `texto ${n}` },
    payload: `texto ${n}`,
    background: 'none',
    logoDataUrl: null,
    ...overrides,
  }
}

function seedMany(count: number): void {
  const records = Array.from({ length: count }, (_, i) => {
    const iso = new Date(Date.UTC(2026, 0, 1, 0, 0, i + 1)).toISOString()
    return {
      ...input(i),
      id: `seed-${i}`,
      createdAt: iso,
      updatedAt: iso,
    }
  })
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
}

describe('useSavedQrcodes', () => {
  it('initializes records from storage', () => {
    seedMany(3)
    const { result } = renderHook(() => useSavedQrcodes())
    expect(result.current.records).toHaveLength(3)
    expect(result.current.editingId).toBeNull()
    expect(result.current.storageError).toBeNull()
  })

  it('creates a record and refreshes the list', () => {
    const { result } = renderHook(() => useSavedQrcodes())
    act(() => {
      result.current.createRecord(input(1))
    })
    expect(result.current.records).toHaveLength(1)
    expect(result.current.records[0].payload).toBe('texto 1')
  })

  it('updates an existing record in place (no duplicates)', () => {
    const created = createSaved(input(1))
    const { result } = renderHook(() => useSavedQrcodes())
    act(() => {
      result.current.updateRecord(created.id, { payload: 'editado' })
    })
    expect(result.current.records).toHaveLength(1)
    expect(result.current.records[0].payload).toBe('editado')
  })

  it('deletes a record', () => {
    const a = createSaved(input(1))
    const b = createSaved(input(2))
    const { result } = renderHook(() => useSavedQrcodes())
    expect(result.current.records).toHaveLength(2)
    act(() => {
      const ok = result.current.removeRecord(a.id)
      expect(ok).toBe(true)
    })
    expect(result.current.records).toHaveLength(1)
    expect(result.current.records[0].id).toBe(b.id)
  })

  it('paginates at 50 items per page', () => {
    seedMany(55)
    const { result } = renderHook(() => useSavedQrcodes())
    expect(result.current.page).toBe(1)
    expect(result.current.pageCount).toBe(2)
    expect(result.current.pageRecords).toHaveLength(50)
    act(() => {
      result.current.setPage(2)
    })
    expect(result.current.pageRecords).toHaveLength(5)
  })

  it('clamps the page when the last page empties after deletion', async () => {
    seedMany(55)
    const { result } = renderHook(() => useSavedQrcodes())
    act(() => {
      result.current.setPage(2)
    })
    expect(result.current.page).toBe(2)
    const toRemove = result.current.pageRecords.map((r) => r.id)
    act(() => {
      for (const id of toRemove) {
        result.current.removeRecord(id)
      }
    })
    await waitFor(() => {
      expect(result.current.page).toBe(1)
      expect(result.current.pageRecords).toHaveLength(50)
    })
  })

  it('exposes editing state management', () => {
    const created = createSaved(input(1))
    const { result } = renderHook(() => useSavedQrcodes())
    act(() => {
      result.current.startEditing(created.id)
    })
    expect(result.current.editingId).toBe(created.id)
    act(() => {
      result.current.clearEditing()
    })
    expect(result.current.editingId).toBeNull()
  })

  it('surfaces a storage error when a write fails', () => {
    const setItem = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new DOMException('quota', 'QuotaExceededError')
      })
    const { result } = renderHook(() => useSavedQrcodes())
    act(() => {
      const created = result.current.createRecord(input(1))
      expect(created).toBeNull()
    })
    expect(result.current.storageError).toBe(STORAGE_ERROR_MESSAGE)
    expect(result.current.records).toHaveLength(0)
    setItem.mockRestore()
  })

  it('refresh reloads records from storage', () => {
    const { result } = renderHook(() => useSavedQrcodes())
    expect(result.current.records).toHaveLength(0)
    createSaved(input(1))
    act(() => {
      result.current.refresh()
    })
    expect(result.current.records).toHaveLength(1)
    expect(listSaved()).toHaveLength(1)
  })
})