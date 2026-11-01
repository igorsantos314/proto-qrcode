import type { PayloadFields } from './types'

export const PIX_KEY_TYPES = ['cpf', 'cnpj', 'email', 'phone', 'random'] as const

export type PixKeyType = (typeof PIX_KEY_TYPES)[number]

export const PIX_KEY_TYPE_LABELS: Record<PixKeyType, string> = {
  cpf: 'CPF',
  cnpj: 'CNPJ',
  email: 'E-mail',
  phone: 'Telefone',
  random: 'Chave aleatória',
}

export const PIX_FIELDS = {
  keyType: 'keyType',
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

export const DEFAULT_MERCHANT_NAME = 'RECEBEDOR'
export const DEFAULT_MERCHANT_CITY = 'BRASIL'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const RANDOM_KEY_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/

function onlyDigits(value: string): string {
  return value.replace(/\D+/g, '')
}

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

export function formatPixKey(type: PixKeyType | string, value: string): string {
  switch (type) {
    case 'cpf': {
      const digits = onlyDigits(value).slice(0, 11)
      return digits
        .replace(/^(\d{3})(\d)/, '$1.$2')
        .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4')
    }
    case 'cnpj': {
      const digits = onlyDigits(value).slice(0, 14)
      return digits
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3/$4')
        .replace(
          /^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})(\d)/,
          '$1.$2.$3/$4-$5',
        )
    }
    case 'phone': {
      let digits: string
      if (/^\s*\+55/.test(value)) {
        digits = onlyDigits(value.replace(/^\s*\+55/, ''))
      } else {
        digits = onlyDigits(value)
        if (digits.length > 11 && digits.startsWith('55')) {
          digits = digits.slice(2)
        }
      }
      digits = digits.slice(0, 11)
      if (!digits) {
        return ''
      }
      if (digits.length <= 2) {
        return `+55 (${digits}`
      }
      const areaCode = digits.slice(0, 2)
      const rest = digits.slice(2)
      const prefix = `+55 (${areaCode}) `
      if (rest.length <= 4) {
        return prefix + rest
      }
      if (rest.length <= 8) {
        return `${prefix}${rest.slice(0, 4)}-${rest.slice(4)}`
      }
      return `${prefix}${rest.slice(0, 5)}-${rest.slice(5)}`
    }
    default:
      return value
  }
}

export function normalizePixKey(type: PixKeyType | string, value: string): string {
  const trimmed = value.trim()
  switch (type) {
    case 'cpf':
    case 'cnpj':
      return onlyDigits(trimmed)
    case 'email':
      return trimmed.toLowerCase()
    case 'phone': {
      const digits = onlyDigits(trimmed)
      if (!digits) {
        return ''
      }
      const withCountry = digits.length <= 11 ? `55${digits}` : digits
      return `+${withCountry}`
    }
    case 'random':
      return trimmed.toLowerCase()
    default:
      return trimmed
  }
}

function validateKey(type: PixKeyType, key: string): string[] {
  switch (type) {
    case 'cpf':
      return /^\d{11}$/.test(key)
        ? []
        : ['Informe um CPF válido (11 dígitos).']
    case 'cnpj':
      return /^\d{14}$/.test(key)
        ? []
        : ['Informe um CNPJ válido (14 dígitos).']
    case 'email':
      return EMAIL_PATTERN.test(key)
        ? []
        : ['Informe um e-mail válido.']
    case 'phone':
      return /^55\d{10,11}$/.test(key.replace(/^\+/, ''))
        ? []
        : ['Informe um telefone válido (DDD + número).']
    case 'random':
      return RANDOM_KEY_PATTERN.test(key)
        ? []
        : ['Informe uma chave aleatória válida.']
    default:
      return []
  }
}

export function buildPixPayload(fields: PayloadFields): string {
  const keyType = String(fields[PIX_FIELDS.keyType] ?? '').trim()
  const key = normalizePixKey(
    keyType,
    String(fields[PIX_FIELDS.key] ?? ''),
  )
  const name =
    String(fields[PIX_FIELDS.name] ?? '').trim() || DEFAULT_MERCHANT_NAME
  const city =
    String(fields[PIX_FIELDS.city] ?? '').trim() || DEFAULT_MERCHANT_CITY
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

  const rawKeyType = String(fields[PIX_FIELDS.keyType] ?? '').trim()
  const rawKey = String(fields[PIX_FIELDS.key] ?? '').trim()
  const keyType = PIX_KEY_TYPES.includes(rawKeyType as PixKeyType)
    ? (rawKeyType as PixKeyType)
    : ''

  if (!keyType) {
    errors.push('Selecione o tipo da chave Pix.')
  }

  if (!rawKey) {
    errors.push('Informe a chave Pix.')
  } else if (keyType) {
    errors.push(...validateKey(keyType, normalizePixKey(keyType, rawKey)))
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
