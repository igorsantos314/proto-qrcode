import { describe, expect, it, vi } from 'vitest'
import type { SavedQrCodeInput } from '../types'
import {
  clearSaved,
  createSaved,
  getSaved,
  listSaved,
  readStored,
  removeSaved,
  updateSaved,
} from './savedQrcodes'

const STORAGE_KEY = 'proto-qrcode:saved:v1'

function input(overrides: Partial<SavedQrCodeInput> = {}): SavedQrCodeInput {
  return {
    type: 'text',
    fields: { content: 'Olá' },
    payload: 'Olá',
    background: 'none',
    logoDataUrl: null,
    ...overrides,
  }
}

function seed(records: Array<Record<string, unknown>>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
}

describe('savedQrcodes storage', () => {
  it('creates a record and lists it', () => {
    const created = createSaved(input())
    expect(created.id).toBeTruthy()
    expect(created.createdAt).toBeTruthy()
    expect(listSaved()).toHaveLength(1)
    expect(listSaved()[0]).toEqual(created)
  })

  it('lists newest-first by createdAt', () => {
    seed([
      {
        ...input(),
        id: 'a',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
      {
        ...input(),
        id: 'b',
        createdAt: '2026-02-01T00:00:00.000Z',
        updatedAt: '2026-02-01T00:00:00.000Z',
      },
      {
        ...input(),
        id: 'c',
        createdAt: '2026-03-01T00:00:00.000Z',
        updatedAt: '2026-03-01T00:00:00.000Z',
      },
    ])
    expect(listSaved().map((r) => r.id)).toEqual(['c', 'b', 'a'])
  })

  it('gets a record by id and null for unknown ids', () => {
    const created = createSaved(input())
    expect(getSaved(created.id)?.id).toBe(created.id)
    expect(getSaved('missing')).toBeNull()
  })

  it('updates a record in place without duplicating it', () => {
    const created = createSaved(input({ payload: 'antes' }))
    const updated = updateSaved(created.id, { payload: 'depois' })
    expect(updated.payload).toBe('depois')
    expect(listSaved()).toHaveLength(1)
    expect(listSaved()[0].payload).toBe('depois')
  })

  it('throws when updating an unknown record', () => {
    expect(() => updateSaved('missing', { payload: 'x' })).toThrow(
      /not found/,
    )
  })

  it('removes a record', () => {
    const a = createSaved(input())
    const b = createSaved(input())
    removeSaved(a.id)
    const remaining = listSaved()
    expect(remaining).toHaveLength(1)
    expect(remaining[0].id).toBe(b.id)
  })

  it('clears all records', () => {
    createSaved(input())
    createSaved(input())
    clearSaved()
    expect(listSaved()).toHaveLength(0)
  })

  it('tolerates corrupt stored JSON and missing keys', () => {
    localStorage.setItem(STORAGE_KEY, '{not json')
    expect(readStored()).toEqual([])
    localStorage.removeItem(STORAGE_KEY)
    expect(readStored()).toEqual([])
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ nope: true }))
    expect(readStored()).toEqual([])
  })

  it('round-trips the exact saved configuration without mutation', () => {
    const original = input({
      type: 'wifi',
      fields: { ssid: 'Rede', password: '1234', hidden: true },
      payload: 'WIFI:T:WPA;S:Rede;P:1234;H:true;;',
      background: 'white',
      logoDataUrl: 'data:image/png;base64,AAAA',
    })
    const created = createSaved(original)
    const readBack = getSaved(created.id)
    expect(readBack).toEqual(created)
    expect(readBack?.fields).toEqual(original.fields)
    expect(readBack?.payload).toBe(original.payload)
    expect(readBack?.background).toBe('white')
    expect(readBack?.logoDataUrl).toBe(original.logoDataUrl)
    expect(readBack?.type).toBe('wifi')
  })

  it('propagates quota errors from localStorage writes', () => {
    const setItem = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new DOMException('quota', 'QuotaExceededError')
      })
    expect(() => createSaved(input())).toThrow(/quota/i)
    setItem.mockRestore()
  })
})