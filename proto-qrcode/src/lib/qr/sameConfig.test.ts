import { describe, expect, it } from 'vitest'
import {
  isStale,
  sameGeneratedConfig,
  type GeneratedConfig,
} from './sameConfig'

const base: GeneratedConfig = {
  payload: 'texto',
  background: 'none',
  logoDataUrl: null,
}

describe('sameGeneratedConfig', () => {
  it('returns true for identical configs', () => {
    expect(
      sameGeneratedConfig(base, { ...base, logoDataUrl: 'x' }),
    ).toBe(false)
    expect(sameGeneratedConfig(base, { ...base })).toBe(true)
  })

  it('treats null and non-null as different', () => {
    expect(sameGeneratedConfig(null, base)).toBe(false)
    expect(sameGeneratedConfig(null, null)).toBe(true)
  })

  it('detects changes in payload, background, and logo', () => {
    expect(sameGeneratedConfig(base, { ...base, payload: 'outro' })).toBe(false)
    expect(sameGeneratedConfig(base, { ...base, background: 'white' })).toBe(
      false,
    )
    expect(
      sameGeneratedConfig(base, { ...base, logoDataUrl: 'data:x' }),
    ).toBe(false)
  })
})

describe('isStale', () => {
  it('is not stale when nothing was generated', () => {
    expect(isStale(base, null)).toBe(false)
  })

  it('is not stale when the config matches the generated one', () => {
    expect(isStale(base, { ...base })).toBe(false)
  })

  it('is stale when the config changed after generation', () => {
    expect(isStale({ ...base, payload: 'mudou' }, base)).toBe(true)
    expect(isStale({ ...base, background: 'white' }, base)).toBe(true)
    expect(isStale({ ...base, logoDataUrl: 'data:x' }, base)).toBe(true)
  })
})