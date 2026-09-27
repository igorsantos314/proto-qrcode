import type { PayloadFields } from './types'

export const TEXT_FIELD = 'content'

export function buildTextPayload(fields: PayloadFields): string {
  return String(fields[TEXT_FIELD] ?? '').trim()
}

export function validateText(fields: PayloadFields): string[] {
  const errors: string[] = []
  if (!buildTextPayload(fields)) {
    errors.push('Informe o texto do QR code.')
  }
  return errors
}