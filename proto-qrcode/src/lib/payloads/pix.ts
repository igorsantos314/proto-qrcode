import type { PayloadFields } from './types'

export const PIX_FIELDS = {
  key: 'key',
  name: 'name',
  city: 'city',
  amount: 'amount',
  description: 'description',
} as const

const GUI = 'br.gov.bcb.pix'
const MERCHANT_CATEGORY_CODE = '0000'
const CURRENCY = '986'
const COUNTRY_CODE = 'BR'

function emv(id: string, value: string): string {
  return id + String(value.length).padStart(2, '0') + value
}

export function crc16(payload: string): string {
  let crc = 0xffff
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8
    for (let bit = 0; bit < 8; bit++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0')
}

function normalizeAmount(value: string): string {
  return value.trim().replace(',', '.')
}

export function buildPixPayload(fields: PayloadFields): string {
  const key = String(fields[PIX_FIELDS.key] ?? '').trim()
  const name = String(fields[PIX_FIELDS.name] ?? '').trim()
  const city = String(fields[PIX_FIELDS.city] ?? '').trim()
  const description = String(fields[PIX_FIELDS.description] ?? '').trim()
  const amount = String(fields[PIX_FIELDS.amount] ?? '').trim()
    ? normalizeAmount(String(fields[PIX_FIELDS.amount]))
    : ''

  let merchantAccountInfo = emv('00', GUI)
  merchantAccountInfo += emv('01', key)
  if (description) {
    merchantAccountInfo += emv('02', description)
  }

  let payload = '000201'
  payload += emv('26', merchantAccountInfo)
  payload += emv('52', MERCHANT_CATEGORY_CODE)
  payload += emv('53', CURRENCY)
  if (amount) {
    payload += emv('54', amount)
  }
  payload += emv('58', COUNTRY_CODE)
  payload += emv('59', name)
  payload += emv('60', city)
  payload += emv('62', emv('05', '***'))
  payload += '6304'
  payload += crc16(payload)
  return payload
}

export function validatePix(fields: PayloadFields): string[] {
  const errors: string[] = []
  if (!String(fields[PIX_FIELDS.key] ?? '').trim()) {
    errors.push('Informe a chave Pix.')
  }
  if (!String(fields[PIX_FIELDS.name] ?? '').trim()) {
    errors.push('Informe o nome do recebedor.')
  }
  if (!String(fields[PIX_FIELDS.city] ?? '').trim()) {
    errors.push('Informe a cidade.')
  }
  const amount = String(fields[PIX_FIELDS.amount] ?? '').trim()
  if (amount) {
    const normalized = normalizeAmount(amount)
    if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
      errors.push('Informe um valor válido (ex.: 25,00).')
    }
  }
  return errors
}