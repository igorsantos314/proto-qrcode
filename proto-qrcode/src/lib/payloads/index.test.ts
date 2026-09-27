import { describe, expect, it } from 'vitest'
import { buildPayload } from './index'
import { validatePayload } from './validation'

describe('payload dispatcher', () => {
  it('builds each payload type through the dispatcher', () => {
    expect(buildPayload('text', { content: 'Oi' })).toBe('Oi')
    expect(buildPayload('instagram', { handle: 'perfil' })).toBe(
      'https://www.instagram.com/perfil',
    )
    expect(buildPayload('facebook', { url: 'minhapagina' })).toBe(
      'https://facebook.com/minhapagina',
    )
    expect(buildPayload('wifi', { ssid: 'Rede', encryption: 'nopass' })).toBe(
      'WIFI:T:nopass;S:Rede;H:false;;',
    )
    expect(buildPayload('pix', { key: 'k', name: 'n', city: 'c' })).toMatch(
      /^000201/,
    )
  })

  it('falls back to text payload for an unknown type', () => {
    expect(buildPayload('unknown', { content: 'Oi' })).toBe('Oi')
  })

  it('validates through the dispatcher per type', () => {
    expect(validatePayload('text', { content: 'Oi' })).toEqual([])
    expect(validatePayload('wifi', {})).toEqual([
      'Informe o nome da rede (SSID).',
      'Informe a senha da rede.',
    ])
    expect(validatePayload('instagram', {})).toEqual([
      'Informe o perfil do Instagram.',
    ])
  })

  it('falls back to text validation for an unknown type', () => {
    expect(validatePayload('unknown', { content: 'Oi' })).toEqual([])
    expect(validatePayload('unknown', {})).toHaveLength(1)
  })
})