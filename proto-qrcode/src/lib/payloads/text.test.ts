import { describe, expect, it } from 'vitest'
import { buildTextPayload, TEXT_FIELD, validateText } from './text'

describe('text payload', () => {
  it('builds the trimmed literal text', () => {
    expect(buildTextPayload({ [TEXT_FIELD]: '  Olá, mundo!  ' })).toBe(
      'Olá, mundo!',
    )
  })

  it('builds empty string for missing content', () => {
    expect(buildTextPayload({})).toBe('')
  })

  it('validates non-empty content without errors', () => {
    expect(validateText({ [TEXT_FIELD]: 'hello' })).toEqual([])
  })

  it('reports an error for empty content', () => {
    expect(validateText({ [TEXT_FIELD]: '   ' })).toEqual([
      'Informe o texto do QR code.',
    ])
    expect(validateText({})).toHaveLength(1)
  })
})