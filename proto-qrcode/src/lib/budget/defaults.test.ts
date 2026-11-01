import { describe, expect, it } from 'vitest'
import {
  createDefaultParameters,
  PARAMETER_IDS,
  parameterValue,
} from './defaults'

describe('default reusable parameters', () => {
  it('provides the default laser shop parameters', () => {
    const parameters = createDefaultParameters()
    const names = parameters.map((parameter) => parameter.name)
    expect(names).toEqual([
      'Verniz',
      'Produto de limpeza',
      'Custo de energia',
      'Consumo da máquina',
      'Depreciação da máquina',
      'Margem padrão',
    ])
  })

  it('uses the 5 W diode consumption as the default machine consumption', () => {
    const parameters = createDefaultParameters()
    expect(parameterValue(parameters, PARAMETER_IDS.consumption)).toBe(0.005)
  })

  it('creates stable ids and timestamps for every default parameter', () => {
    const parameters = createDefaultParameters()
    expect(new Set(parameters.map((parameter) => parameter.id)).size).toBe(6)
    for (const parameter of parameters) {
      expect(parameter.createdAt).toBeTruthy()
      expect(parameter.updatedAt).toBe(parameter.createdAt)
    }
  })

  it('falls back when a parameter is missing', () => {
    expect(parameterValue([], PARAMETER_IDS.energy, 1.25)).toBe(1.25)
  })
})
