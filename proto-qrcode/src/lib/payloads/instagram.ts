import type { PayloadFields } from './types'

export const INSTAGRAM_FIELD = 'handle'

const INSTAGRAM_URL_PATTERN =
  /^(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:[^/]+\/)?([^/?#]+)/i

export function normalizeInstagramHandle(value: string): string {
  let handle = value.trim()
  if (handle.startsWith('@')) {
    handle = handle.slice(1)
  }
  const match = handle.match(INSTAGRAM_URL_PATTERN)
  if (match) {
    handle = match[1]
  }
  return handle.replace(/^\/+/, '').replace(/\/+$/, '').trim()
}

export function buildInstagramPayload(fields: PayloadFields): string {
  const handle = normalizeInstagramHandle(String(fields[INSTAGRAM_FIELD] ?? ''))
  return `https://www.instagram.com/${handle}`
}

export function validateInstagram(fields: PayloadFields): string[] {
  const errors: string[] = []
  if (!normalizeInstagramHandle(String(fields[INSTAGRAM_FIELD] ?? ''))) {
    errors.push('Informe o perfil do Instagram.')
  }
  return errors
}