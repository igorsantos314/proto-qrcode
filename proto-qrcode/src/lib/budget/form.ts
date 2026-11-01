import {
  calculateBudget,
  marginFromSalePrice,
  roundCurrency,
  salePriceFromMargin,
} from './calculations'
import { PARAMETER_IDS, parameterValue } from './defaults'
import type {
  BudgetInput,
  BudgetRecord,
  ReusableParameter,
} from './types'

export type PriceSource = 'margin' | 'price'

export type BudgetFormState = BudgetInput & { priceSource: PriceSource }

function roundMargin(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

export function createEmptyBudget(
  parameters: ReusableParameter[],
): BudgetFormState {
  return {
    materialType: '',
    materialCostPerM2: 0,
    widthMm: 0,
    heightMm: 0,
    quantity: 1,
    engravingTimeHours: 0,
    energyCostPerKwh: parameterValue(parameters, PARAMETER_IDS.energy),
    machineConsumptionKwhPerHour: parameterValue(
      parameters,
      PARAMETER_IDS.consumption,
    ),
    depreciationPerHour: parameterValue(
      parameters,
      PARAMETER_IDS.depreciation,
    ),
    marginPercent: parameterValue(parameters, PARAMETER_IDS.margin),
    salePrice: 0,
    additionalCosts: [],
    appliedParameters: [],
    priceSource: 'margin',
  }
}

export function budgetFromRecord(record: BudgetRecord): BudgetFormState {
  return {
    materialType: record.materialType,
    materialCostPerM2: record.materialCostPerM2,
    widthMm: record.widthMm,
    heightMm: record.heightMm,
    quantity: record.quantity,
    engravingTimeHours: record.engravingTimeHours,
    energyCostPerKwh: record.energyCostPerKwh,
    machineConsumptionKwhPerHour: record.machineConsumptionKwhPerHour,
    depreciationPerHour: record.depreciationPerHour,
    marginPercent: record.marginPercent,
    salePrice: record.salePrice,
    additionalCosts: record.additionalCosts.map((cost) => ({ ...cost })),
    appliedParameters: record.appliedParameters.map((parameter) => ({
      ...parameter,
    })),
    priceSource: 'margin',
  }
}

export function recalculatePrice(form: BudgetFormState): BudgetFormState {
  const { costPerUnit } = calculateBudget(form)
  if (costPerUnit === null) {
    return form
  }
  if (form.priceSource === 'price') {
    const margin = marginFromSalePrice(costPerUnit, form.salePrice)
    return margin === null ? form : { ...form, marginPercent: roundMargin(margin) }
  }
  const price = salePriceFromMargin(costPerUnit, form.marginPercent)
  return price === null ? form : { ...form, salePrice: roundCurrency(price) }
}

export function withMarginChange(
  form: BudgetFormState,
  marginPercent: number,
): BudgetFormState {
  const next: BudgetFormState = {
    ...form,
    marginPercent,
    priceSource: 'margin',
  }
  const { costPerUnit } = calculateBudget(next)
  const price = salePriceFromMargin(costPerUnit, marginPercent)
  return price === null ? next : { ...next, salePrice: roundCurrency(price) }
}

export function withSalePriceChange(
  form: BudgetFormState,
  salePrice: number,
): BudgetFormState {
  const next: BudgetFormState = { ...form, salePrice, priceSource: 'price' }
  const { costPerUnit } = calculateBudget(next)
  const margin = marginFromSalePrice(costPerUnit, salePrice)
  return margin === null ? next : { ...next, marginPercent: roundMargin(margin) }
}

function isInvalidNumber(value: number, label: string): string | null {
  if (!Number.isFinite(value) || value < 0) {
    return `Informe um valor válido para ${label}.`
  }
  return null
}

export function validateBudgetForm(form: BudgetFormState): string[] {
  const errors: string[] = []

  if (!form.materialType.trim()) {
    errors.push('Informe o tipo de material.')
  }

  const numeric: Array<[number, string]> = [
    [form.materialCostPerM2, 'o custo do material'],
    [form.widthMm, 'a largura da peça'],
    [form.heightMm, 'a altura da peça'],
    [form.quantity, 'a quantidade de peças'],
    [form.engravingTimeHours, 'o tempo de gravação'],
    [form.energyCostPerKwh, 'o custo de energia'],
    [form.machineConsumptionKwhPerHour, 'o consumo da máquina'],
    [form.depreciationPerHour, 'a depreciação'],
    [form.marginPercent, 'a margem de lucro'],
    [form.salePrice, 'o preço de venda'],
  ]
  for (const [value, label] of numeric) {
    const error = isInvalidNumber(value, label)
    if (error) {
      errors.push(error)
    }
  }

  if (form.widthMm <= 0 || form.heightMm <= 0) {
    errors.push('Informe largura e altura maiores que zero.')
  }
  if (form.quantity <= 0) {
    errors.push('A quantidade de peças deve ser maior que zero.')
  }
  if (form.marginPercent >= 100) {
    errors.push('A margem de lucro deve ser menor que 100%.')
  }
  if (form.salePrice <= 0) {
    errors.push('O preço de venda deve ser maior que zero.')
  }

  const missingDescription = form.additionalCosts.some(
    (cost) => !cost.description.trim() && cost.value !== 0,
  )
  if (missingDescription) {
    errors.push('Informe a descrição de cada custo adicional.')
  }

  const invalidParameter = form.appliedParameters.some(
    (parameter) =>
      !Number.isFinite(parameter.quantity) || parameter.quantity < 0,
  )
  if (invalidParameter) {
    errors.push('Informe uma quantidade válida para os parâmetros aplicados.')
  }

  return errors
}
