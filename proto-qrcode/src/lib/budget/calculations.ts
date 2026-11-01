import type { BudgetCalculations, BudgetInput } from './types'

function finite(value: number): number {
  return Number.isFinite(value) ? value : 0
}

export function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

export function pieceAreaM2(widthMm: number, heightMm: number): number {
  return (finite(widthMm) / 1000) * (finite(heightMm) / 1000)
}

export function machineCostPerHour(
  energyCostPerKwh: number,
  consumptionKwhPerHour: number,
  depreciationPerHour: number,
): number {
  return (
    finite(energyCostPerKwh) * finite(consumptionKwhPerHour) +
    finite(depreciationPerHour)
  )
}

export function additionalCostsTotal(input: BudgetInput): number {
  const costs = input.additionalCosts.reduce(
    (sum, cost) => sum + finite(cost.value),
    0,
  )
  const parameters = input.appliedParameters.reduce(
    (sum, parameter) =>
      sum + finite(parameter.unitValue) * finite(parameter.quantity),
    0,
  )
  return costs + parameters
}

export function calculateBudget(input: BudgetInput): BudgetCalculations {
  const area = pieceAreaM2(input.widthMm, input.heightMm)
  const unitMaterial = area * finite(input.materialCostPerM2)
  const quantity = finite(input.quantity)
  const totalMaterial = unitMaterial * quantity
  const perHour = machineCostPerHour(
    input.energyCostPerKwh,
    input.machineConsumptionKwhPerHour,
    input.depreciationPerHour,
  )
  const totalMachine =
    perHour * finite(input.engravingTimeHours) * Math.max(0, quantity)
  const extras = additionalCostsTotal(input)
  const total = totalMaterial + totalMachine + extras

  return {
    pieceAreaM2: area,
    unitMaterialCost: unitMaterial,
    totalMaterialCost: totalMaterial,
    machineCostPerHour: perHour,
    totalMachineCost: totalMachine,
    additionalCostsTotal: extras,
    totalCost: total,
    costPerUnit: quantity > 0 ? total / quantity : null,
  }
}

export function salePriceFromMargin(
  costPerUnit: number | null,
  marginPercent: number,
): number | null {
  if (
    costPerUnit === null ||
    !Number.isFinite(costPerUnit) ||
    !Number.isFinite(marginPercent) ||
    marginPercent >= 100
  ) {
    return null
  }
  return costPerUnit / (1 - marginPercent / 100)
}

export function marginFromSalePrice(
  costPerUnit: number | null,
  salePrice: number,
): number | null {
  if (
    costPerUnit === null ||
    !Number.isFinite(costPerUnit) ||
    !Number.isFinite(salePrice) ||
    salePrice <= 0
  ) {
    return null
  }
  return (1 - costPerUnit / salePrice) * 100
}
