import { describe, expect, it } from 'vitest'
import {
  buildPixPayload,
  crc16,
  PIX_FIELDS,
  validatePix,
} from './pix'

describe('pix crc16', () => {
  it('matches the standard CRC-16/CCITT-FALSE check value', () => {
    expect(crc16('123456789')).toBe('29B1')
  })
})

describe('pix payload', () => {
  const validFields = {
    [PIX_FIELDS.key]: '+5511999999999',
    [PIX_FIELDS.name]: 'Fulano de Tal',
    [PIX_FIELDS.city]: 'SAO PAULO',
    [PIX_FIELDS.amount]: '10.00',
    [PIX_FIELDS.description]: 'Pedido 123',
  }

  it('builds a structurally valid EMV BR Code payload', () => {
    const payload = buildPixPayload(validFields)
    expect(payload.startsWith('000201')).toBe(true)
    expect(payload).toContain('0014br.gov.bcb.pix')
    expect(payload).toContain('0114+5511999999999')
    expect(payload).toContain('5303986')
    expect(payload).toContain('5802BR')
    expect(payload).toContain('5913Fulano de Tal')
    expect(payload).toContain('62070503***')
    expect(payload.endsWith('6304')).toBe(false)
  })

  it('embeds a valid CRC computed over the payload body', () => {
    const payload = buildPixPayload(validFields)
    const body = payload.slice(0, payload.length - 4)
    const embeddedCrc = payload.slice(-4)
    expect(crc16(body)).toBe(embeddedCrc)
    expect(embeddedCrc).toMatch(/^[0-9A-F]{4}$/)
  })

  it('normalizes comma decimal separator in the amount', () => {
    const payload = buildPixPayload({
      ...validFields,
      [PIX_FIELDS.amount]: '10,50',
    })
    expect(payload).toContain('540510.50')
  })

  it('omits the amount when not provided', () => {
    const payload = buildPixPayload({
      [PIX_FIELDS.key]: '+5511999999999',
      [PIX_FIELDS.name]: 'Fulano de Tal',
      [PIX_FIELDS.city]: 'SAO PAULO',
    })
    expect(payload).not.toContain('5405')
  })

  it('validates a complete payload without errors', () => {
    expect(validatePix(validFields)).toEqual([])
  })

  it('reports missing required fields', () => {
    const errors = validatePix({})
    expect(errors).toEqual([
      'Informe a chave Pix.',
      'Informe o nome do recebedor.',
      'Informe a cidade.',
    ])
  })

  it('rejects an invalid amount', () => {
    const errors = validatePix({ ...validFields, [PIX_FIELDS.amount]: 'abc' })
    expect(errors).toEqual(['Informe um valor válido (ex.: 25,00).'])
  })
})