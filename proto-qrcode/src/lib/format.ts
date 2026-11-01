import type { QrPayloadType } from './payloads/types'

const LABELS: Record<QrPayloadType, string> = {
  text: 'Texto',
  pix: 'Pix',
  instagram: 'Instagram',
  wifi: 'WiFi',
  facebook: 'Facebook',
}

export function payloadTypeLabel(type: QrPayloadType): string {
  return LABELS[type] ?? 'Texto'
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) {
    return iso
  }
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function summarizePayload(payload: string): string {
  return payload.length > 60 ? `${payload.slice(0, 60)}…` : payload
}

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

const decimalFormatter = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 4,
})

export function formatCurrency(value: number): string {
  return currencyFormatter.format(Number.isFinite(value) ? value : 0)
}

export function formatDecimal(value: number): string {
  return decimalFormatter.format(Number.isFinite(value) ? value : 0)
}