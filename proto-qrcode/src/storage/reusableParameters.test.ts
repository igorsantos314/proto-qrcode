import { describe, expect, it } from 'vitest'
import {
  clearParameters,
  createParameter,
  listParameters,
  readStoredParameters,
  removeParameter,
  updateParameter,
} from './reusableParameters'

const STORAGE_KEY = 'lasergest:parameters:v1'

describe('reusable parameters storage', () => {
  it('seeds defaults only when the key is absent', () => {
    expect(readStoredParameters()).toBeNull()
    const seeded = listParameters()
    expect(seeded).toHaveLength(6)
    expect(localStorage.getItem(STORAGE_KEY)).toBeTruthy()
    expect(listParameters()).toEqual(seeded)
  })

  it('does not reseed after all parameters are deleted', () => {
    listParameters()
    clearParameters()
    expect(listParameters()).toEqual([])
    expect(readStoredParameters()).toEqual([])
  })

  it('creates, updates and removes a parameter', () => {
    const created = createParameter({ name: 'Fita', unit: 'm', value: 2 })
    expect(listParameters().some((item) => item.id === created.id)).toBe(true)

    const updated = updateParameter(created.id, { value: 3 })
    expect(updated.value).toBe(3)
    expect(listParameters().find((item) => item.id === created.id)?.value).toBe(
      3,
    )

    removeParameter(created.id)
    expect(listParameters().some((item) => item.id === created.id)).toBe(false)
  })

  it('throws when updating an unknown parameter', () => {
    listParameters()
    expect(() => updateParameter('missing', { value: 1 })).toThrow(/not found/)
  })

  it('tolerates corrupt stored JSON', () => {
    localStorage.setItem(STORAGE_KEY, '{not json')
    expect(readStoredParameters()).toBeNull()
  })
})
