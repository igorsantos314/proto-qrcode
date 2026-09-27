import type { SavedQrCode, SavedQrCodeInput } from '../types'

const STORAGE_KEY = 'proto-qrcode:saved:v1'

function now(): string {
  return new Date().toISOString()
}

function newId(): string {
  return crypto.randomUUID()
}

function writeStored(records: SavedQrCode[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
}

export function readStored(): SavedQrCode[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return []
    }
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return []
    }
    return parsed as SavedQrCode[]
  } catch {
    return []
  }
}

export function listSaved(): SavedQrCode[] {
  return readStored().sort((a, b) => {
    const byCreated = b.createdAt.localeCompare(a.createdAt)
    if (byCreated !== 0) {
      return byCreated
    }
    const byUpdated = b.updatedAt.localeCompare(a.updatedAt)
    return byUpdated !== 0 ? byUpdated : a.id.localeCompare(b.id)
  })
}

export function getSaved(id: string): SavedQrCode | null {
  return readStored().find((record) => record.id === id) ?? null
}

export function createSaved(input: SavedQrCodeInput): SavedQrCode {
  const timestamp = now()
  const record: SavedQrCode = {
    ...input,
    id: newId(),
    createdAt: timestamp,
    updatedAt: timestamp,
  }
  const records = readStored()
  records.push(record)
  writeStored(records)
  return record
}

export function updateSaved(
  id: string,
  patch: Partial<SavedQrCodeInput>,
): SavedQrCode {
  const records = readStored()
  const index = records.findIndex((record) => record.id === id)
  if (index === -1) {
    throw new Error(`Saved QR code with id "${id}" not found.`)
  }
  const updated: SavedQrCode = {
    ...records[index],
    ...patch,
    id,
    updatedAt: now(),
  }
  records[index] = updated
  writeStored(records)
  return updated
}

export function removeSaved(id: string): void {
  const records = readStored().filter((record) => record.id !== id)
  writeStored(records)
}

export function clearSaved(): void {
  writeStored([])
}