import type { ReusableParameter } from './types'

export const PARAMETER_IDS = {
  varnish: 'param-verniz',
  cleaner: 'param-limpeza',
  energy: 'param-energia',
  consumption: 'param-consumo',
  depreciation: 'param-depreciacao',
  margin: 'param-margem',
} as const

interface DefaultParameter {
  id: string
  name: string
  unit: string
  value: number
  description: string
}

export const DEFAULT_PARAMETER_DEFINITIONS: DefaultParameter[] = [
  {
    id: PARAMETER_IDS.varnish,
    name: 'Verniz',
    unit: 'R$/L',
    value: 0,
    description: 'Preço do verniz utilizado no acabamento.',
  },
  {
    id: PARAMETER_IDS.cleaner,
    name: 'Produto de limpeza',
    unit: 'R$/L',
    value: 0,
    description: 'Preço do produto de limpeza das peças.',
  },
  {
    id: PARAMETER_IDS.energy,
    name: 'Custo de energia',
    unit: 'R$/kWh',
    value: 0.75,
    description: 'Custo da energia elétrica por kWh.',
  },
  {
    id: PARAMETER_IDS.consumption,
    name: 'Consumo da máquina',
    unit: 'kWh/h',
    value: 0.005,
    description: 'Consumo por hora ligada (equivalente a um diodo de 5 W).',
  },
  {
    id: PARAMETER_IDS.depreciation,
    name: 'Depreciação da máquina',
    unit: 'R$/h',
    value: 0,
    description: 'Depreciação da máquina por hora de uso.',
  },
  {
    id: PARAMETER_IDS.margin,
    name: 'Margem padrão',
    unit: '%',
    value: 30,
    description: 'Margem de lucro padrão para novos orçamentos.',
  },
]

export function createDefaultParameters(): ReusableParameter[] {
  const timestamp = new Date().toISOString()
  return DEFAULT_PARAMETER_DEFINITIONS.map((parameter) => ({
    ...parameter,
    createdAt: timestamp,
    updatedAt: timestamp,
  }))
}

export function parameterValue(
  parameters: ReusableParameter[],
  id: string,
  fallback = 0,
): number {
  const parameter = parameters.find((item) => item.id === id)
  return parameter ? parameter.value : fallback
}
