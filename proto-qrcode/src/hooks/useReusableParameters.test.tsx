import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  PARAMETERS_STORAGE_ERROR,
  useReusableParameters,
} from './useReusableParameters'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useReusableParameters', () => {
  it('loads the default parameters when storage is empty', () => {
    const { result } = renderHook(() => useReusableParameters())
    expect(result.current.parameters).toHaveLength(6)
    expect(result.current.storageError).toBeNull()
  })

  it('creates, updates and removes parameters', () => {
    const { result } = renderHook(() => useReusableParameters())

    act(() => {
      result.current.createParameter({ name: 'Fita', unit: 'm', value: 2 })
    })
    const created = result.current.parameters.find(
      (parameter) => parameter.name === 'Fita',
    )
    expect(created).toBeTruthy()

    act(() => {
      result.current.updateParameter(created!.id, { value: 4 })
    })
    expect(
      result.current.parameters.find((parameter) => parameter.id === created!.id)
        ?.value,
    ).toBe(4)

    act(() => {
      result.current.removeParameter(created!.id)
    })
    expect(
      result.current.parameters.some(
        (parameter) => parameter.id === created!.id,
      ),
    ).toBe(false)
  })

  it('persists parameters across a remount', () => {
    const first = renderHook(() => useReusableParameters())
    act(() => {
      first.result.current.updateParameter('param-margem', { value: 45 })
    })
    first.unmount()

    const second = renderHook(() => useReusableParameters())
    expect(
      second.result.current.parameters.find(
        (parameter) => parameter.id === 'param-margem',
      )?.value,
    ).toBe(45)
  })

  it('keeps in-memory changes and reports a storage failure', () => {
    const { result } = renderHook(() => useReusableParameters())
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota')
    })

    act(() => {
      result.current.createParameter({ name: 'Fita', unit: 'm', value: 2 })
    })

    expect(
      result.current.parameters.some(
        (parameter) => parameter.name === 'Fita',
      ),
    ).toBe(true)
    expect(result.current.storageError).toBe(PARAMETERS_STORAGE_ERROR)
  })
})
