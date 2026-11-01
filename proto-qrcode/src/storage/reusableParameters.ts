import type {
  ReusableParameter,
  ReusableParameterInput,
} from '../lib/budget/types'
import { createDefaultParameters } from '../lib/budget/defaults'

const STORAGE_KEY = 'lasergest:parameters:v1'

function now(): string {
  return new Date().toISOString()
}

function newId(): string {
  return crypto.randomUUID()
}

function writeStored(parameters: ReusableParameter[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(parameters))
}

export function readStoredParameters(): ReusableParameter[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) {
      return null
    }
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return []
    }
    return parsed as ReusableParameter[]
  } catch {
    return null
  }
}

export function listParameters(): ReusableParameter[] {
  const stored = readStoredParameters()
  if (stored !== null) {
    return stored
  }
  const defaults = createDefaultParameters()
  writeStored(defaults)
  return defaults
}

export function createParameter(
  input: ReusableParameterInput,
): ReusableParameter {
  const timestamp = now()
  const parameter: ReusableParameter = {
    ...input,
    id: newId(),
    createdAt: timestamp,
    updatedAt: timestamp,
  }
  const parameters = listParameters()
  parameters.push(parameter)
  writeStored(parameters)
  return parameter
}

export function updateParameter(
  id: string,
  patch: Partial<ReusableParameterInput>,
): ReusableParameter {
  const parameters = listParameters()
  const index = parameters.findIndex((parameter) => parameter.id === id)
  if (index === -1) {
    throw new Error(`Parameter with id "${id}" not found.`)
  }
  const updated: ReusableParameter = {
    ...parameters[index],
    ...patch,
    id,
    updatedAt: now(),
  }
  parameters[index] = updated
  writeStored(parameters)
  return updated
}

export function removeParameter(id: string): void {
  const parameters = listParameters().filter(
    (parameter) => parameter.id !== id,
  )
  writeStored(parameters)
}

export function clearParameters(): void {
  writeStored([])
}
