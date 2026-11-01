import { describe, expect, it } from 'vitest'
import {
  buildPixPayload,
  crc16,
  DEFAULT_MERCHANT_CITY,
  DEFAULT_MERCHANT_NAME,
  formatPixKey,
  normalizePixKey,
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
    [PIX_FIELDS.keyType]: 'phone',
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
      'Selecione o tipo da chave Pix.',
      'Informe a chave Pix.',
    ])
  })

  it('uses default merchant name and city when not provided', () => {
    const payload = buildPixPayload({
      [PIX_FIELDS.keyType]: 'email',
      [PIX_FIELDS.key]: 'chave@exemplo.com',
    })
    expect(payload).toContain(`59${String(DEFAULT_MERCHANT_NAME.length).padStart(2, '0')}${DEFAULT_MERCHANT_NAME}`)
    expect(payload).toContain(`60${String(DEFAULT_MERCHANT_CITY.length).padStart(2, '0')}${DEFAULT_MERCHANT_CITY}`)
  })

  it('rejects an invalid amount', () => {
    const errors = validatePix({ ...validFields, [PIX_FIELDS.amount]: 'abc' })
    expect(errors).toEqual(['Informe um valor válido (ex.: 25,00).'])
  })
})

describe('pix key formatting', () => {
  it('formats CPF progressively', () => {
    expect(formatPixKey('cpf', '12345678909')).toBe('123.456.789-09')
    expect(formatPixKey('cpf', '1234')).toBe('123.4')
    expect(formatPixKey('cpf', '12345678909999')).toBe('123.456.789-09')
  })

  it('formats CNPJ progressively', () => {
    expect(formatPixKey('cnpj', '12345678000195')).toBe('12.345.678/0001-95')
    expect(formatPixKey('cnpj', '12345')).toBe('12.345')
  })

  it('formats phone keys with country code and mask', () => {
    expect(formatPixKey('phone', '11999999999')).toBe('+55 (11) 99999-9999')
    expect(formatPixKey('phone', '1133334444')).toBe('+55 (11) 3333-4444')
    expect(formatPixKey('phone', '+5511999999999')).toBe(
      '+55 (11) 99999-9999',
    )
    expect(formatPixKey('phone', '119')).toBe('+55 (11) 9')
  })

  it('is stable when formatting an already formatted phone key', () => {
    let value = ''
    for (const digit of '11999999999') {
      value = formatPixKey('phone', value + digit)
    }
    expect(value).toBe('+55 (11) 99999-9999')
    expect(formatPixKey('phone', value)).toBe(value)
  })

  it('leaves e-mail and random keys untouched', () => {
    expect(formatPixKey('email', 'Chave@Exemplo.com')).toBe('Chave@Exemplo.com')
    expect(formatPixKey('random', '123E4567-E89B')).toBe('123E4567-E89B')
  })
})

describe('pix key normalization', () => {
  it('keeps only digits for CPF and CNPJ', () => {
    expect(normalizePixKey('cpf', '123.456.789-09')).toBe('12345678909')
    expect(normalizePixKey('cnpj', '12.345.678/0001-95')).toBe('12345678000195')
  })

  it('lowercases e-mail keys', () => {
    expect(normalizePixKey('email', '  Chave@Exemplo.com ')).toBe(
      'chave@exemplo.com',
    )
  })

  it('formats phone keys as +55DDDNUMBER', () => {
    expect(normalizePixKey('phone', '(11) 99999-9999')).toBe('+5511999999999')
    expect(normalizePixKey('phone', '+55 11 99999-9999')).toBe('+5511999999999')
  })

  it('lowercases random keys', () => {
    expect(
      normalizePixKey('random', '123E4567-E89B-12D3-A456-426614174000'),
    ).toBe('123e4567-e89b-12d3-a456-426614174000')
  })
})

describe('pix key validation by type', () => {
  const base = {
    [PIX_FIELDS.name]: 'Fulano de Tal',
    [PIX_FIELDS.city]: 'SAO PAULO',
  }

  function errorsFor(type: string, key: string): string[] {
    return validatePix({
      ...base,
      [PIX_FIELDS.keyType]: type,
      [PIX_FIELDS.key]: key,
    })
  }

  it('accepts a valid key for each type', () => {
    expect(errorsFor('cpf', '123.456.789-09')).toEqual([])
    expect(errorsFor('cnpj', '12.345.678/0001-95')).toEqual([])
    expect(errorsFor('email', 'chave@exemplo.com')).toEqual([])
    expect(errorsFor('phone', '(11) 99999-9999')).toEqual([])
    expect(
      errorsFor('random', '123e4567-e89b-12d3-a456-426614174000'),
    ).toEqual([])
  })

  it('rejects keys that do not match the selected type', () => {
    expect(errorsFor('cpf', '123')).toEqual([
      'Informe um CPF válido (11 dígitos).',
    ])
    expect(errorsFor('cnpj', '123')).toEqual([
      'Informe um CNPJ válido (14 dígitos).',
    ])
    expect(errorsFor('email', 'invalido')).toEqual([
      'Informe um e-mail válido.',
    ])
    expect(errorsFor('phone', '123')).toEqual([
      'Informe um telefone válido (DDD + número).',
    ])
    expect(errorsFor('random', 'invalida')).toEqual([
      'Informe uma chave aleatória válida.',
    ])
  })
})