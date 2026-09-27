import { describe, expect, it } from 'vitest'
import {
  buildFacebookPayload,
  FACEBOOK_FIELD,
  normalizeFacebookUrl,
  validateFacebook,
} from './facebook'
import {
  buildInstagramPayload,
  INSTAGRAM_FIELD,
  normalizeInstagramHandle,
  validateInstagram,
} from './instagram'

describe('instagram payload', () => {
  it('builds a profile URL from a plain handle', () => {
    expect(buildInstagramPayload({ [INSTAGRAM_FIELD]: 'meu.perfil' })).toBe(
      'https://www.instagram.com/meu.perfil',
    )
  })

  it('normalizes @ prefix, full URLs and paths', () => {
    expect(normalizeInstagramHandle('@usuario')).toBe('usuario')
    expect(
      normalizeInstagramHandle('https://www.instagram.com/fulano/'),
    ).toBe('fulano')
    expect(
      normalizeInstagramHandle('instagram.com/fulano?utm=x'),
    ).toBe('fulano')
  })

  it('validates a present handle without errors', () => {
    expect(validateInstagram({ [INSTAGRAM_FIELD]: 'perfil' })).toEqual([])
  })

  it('reports an error for an empty handle', () => {
    expect(validateInstagram({ [INSTAGRAM_FIELD]: '  ' })).toEqual([
      'Informe o perfil do Instagram.',
    ])
    expect(validateInstagram({})).toHaveLength(1)
  })
})

describe('facebook payload', () => {
  it('builds a URL from a plain identifier', () => {
    expect(buildFacebookPayload({ [FACEBOOK_FIELD]: 'minhapagina' })).toBe(
      'https://facebook.com/minhapagina',
    )
  })

  it('keeps absolute URLs and adds protocol to host-style input', () => {
    expect(
      buildFacebookPayload({ [FACEBOOK_FIELD]: 'https://facebook.com/oficial' }),
    ).toBe('https://facebook.com/oficial')
    expect(normalizeFacebookUrl('facebook.com/pagina')).toBe(
      'https://facebook.com/pagina',
    )
    expect(normalizeFacebookUrl('www.facebook.com/pagina')).toBe(
      'https://www.facebook.com/pagina',
    )
  })

  it('returns empty string for empty input', () => {
    expect(normalizeFacebookUrl('   ')).toBe('')
  })

  it('validates a present URL without errors', () => {
    expect(validateFacebook({ [FACEBOOK_FIELD]: 'facebook.com/pagina' })).toEqual(
      [],
    )
  })

  it('reports an error for an empty URL', () => {
    expect(validateFacebook({ [FACEBOOK_FIELD]: '' })).toEqual([
      'Informe a página ou perfil do Facebook.',
    ])
  })
})