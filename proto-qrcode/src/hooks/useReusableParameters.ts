import { useCallback, useState } from 'react'
import { createDefaultParameters } from '../lib/budget/defaults'
import type {
  ReusableParameter,
  ReusableParameterInput,
} from '../lib/budget/types'
import {
  createParameter,
  listParameters,
  removeParameter,
  updateParameter,
} from '../storage/reusableParameters'

export const PARAMETERS_STORAGE_ERROR =
  'Não foi possível salvar os parâmetros no armazenamento local. As alterações continuam válidas nesta sessão.'

function initialParameters(): ReusableParameter[] {
  try {
    return listParameters()
  } catch {
    return createDefaultParameters()
  }
}

function safeList(): ReusableParameter[] {
  try {
    return listParameters()
  } catch {
    return initialParameters()
  }
}

export interface UseReusableParameters {
  parameters: ReusableParameter[]
  storageError: string | null
  createParameter: (
    input: ReusableParameterInput,
  ) => ReusableParameter | null
  updateParameter: (
    id: string,
    patch: Partial<ReusableParameterInput>,
  ) => ReusableParameter | null
  removeParameter: (id: string) => boolean
  refresh: () => void
}

export function useReusableParameters(): UseReusableParameters {
  const [parameters, setParameters] = useState<ReusableParameter[]>(() =>
    initialParameters(),
  )
  const [storageError, setStorageError] = useState<string | null>(null)

  const refresh = useCallback(() => {
    try {
      setParameters(listParameters())
      setStorageError(null)
    } catch {
      setStorageError(PARAMETERS_STORAGE_ERROR)
    }
  }, [])

  const create = useCallback(
    (input: ReusableParameterInput): ReusableParameter | null => {
      try {
        const created = createParameter(input)
        setParameters(safeList())
        setStorageError(null)
        return created
      } catch {
        const timestamp = new Date().toISOString()
        const fallback: ReusableParameter = {
          ...input,
          id: crypto.randomUUID(),
          createdAt: timestamp,
          updatedAt: timestamp,
        }
        setParameters((prev) => [...prev, fallback])
        setStorageError(PARAMETERS_STORAGE_ERROR)
        return fallback
      }
    },
    [],
  )

  const update = useCallback(
    (id: string, patch: Partial<ReusableParameterInput>) => {
      try {
        const updated = updateParameter(id, patch)
        setParameters(safeList())
        setStorageError(null)
        return updated
      } catch {
        const current = parameters.find((parameter) => parameter.id === id)
        const fallback = current
          ? { ...current, ...patch, updatedAt: new Date().toISOString() }
          : null
        if (fallback) {
          setParameters((prev) =>
            prev.map((parameter) =>
              parameter.id === id ? fallback : parameter,
            ),
          )
        }
        setStorageError(PARAMETERS_STORAGE_ERROR)
        return fallback
      }
    },
    [parameters],
  )

  const remove = useCallback((id: string): boolean => {
    try {
      removeParameter(id)
      setParameters(safeList())
      setStorageError(null)
      return true
    } catch {
      setParameters((prev) => prev.filter((parameter) => parameter.id !== id))
      setStorageError(PARAMETERS_STORAGE_ERROR)
      return false
    }
  }, [])

  return {
    parameters,
    storageError,
    createParameter: create,
    updateParameter: update,
    removeParameter: remove,
    refresh,
  }
}
