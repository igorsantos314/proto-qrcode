import { describe, expect, it } from 'vitest'
import {
  additionalCostsTotal,
  calculateBudget,
  machineCostPerHour,
  marginFromSalePrice,
  pieceAreaM2,
  roundCurrency,
  salePriceFromMargin,
} from './calculations'
import type { BudgetInput } from './types'

const input: BudgetInput = {
  materialType: 'MDF',
  materialCostPerM2: 50,
  widthMm: 100,
  heightMm: 200,
  quantity: 10,
  engravingTimeHours: 0.1,
  energyCostPerKwh: 0.75,
  machineConsumptionKwhPerHour: 0.005,
  depreciationPerHour: 5,
  marginPercent: 30,
  salePrice: 0,
  additionalCosts: [
    { id: 'a', description: 'Cola', value: 3 },
    { id: 'b', description: 'Embalagem', value: 2 },
  ],
  appliedParameters: [
    { parameterId: 'p', name: 'Verniz', unit: 'R$/L', unitValue: 40, quantity: 0.1 },
  ],
}

describe('budget calculations', () => {
  it('converts millimeters to square meters', () => {
    expect(pieceAreaM2(100, 200)).toBeCloseTo(0.02)
    expect(pieceAreaM2(0, 200)).toBe(0)
  })

  it('calculates machine cost per hour including depreciation', () => {
    expect(machineCostPerHour(0.75, 0.005, 5)).toBeCloseTo(5.00375)
  })

  it('totals additional costs and applied parameters', () => {
    expect(additionalCostsTotal(input)).toBeCloseTo(9)
  })

  it('calculates the whole breakdown for a known budget', () => {
    const result = calculateBudget(input)
    expect(result.pieceAreaM2).toBeCloseTo(0.02)
    expect(result.unitMaterialCost).toBeCloseTo(1)
    expect(result.totalMaterialCost).toBeCloseTo(10)
    expect(result.machineCostPerHour).toBeCloseTo(5.00375)
    expect(result.totalMachineCost).toBeCloseTo(5.00375)
    expect(result.additionalCostsTotal).toBeCloseTo(9)
    expect(result.totalCost).toBeCloseTo(24.00375)
    expect(result.costPerUnit).toBeCloseTo(2.400375)
  })

  it('does not calculate a unit cost when quantity is zero', () => {
    const result = calculateBudget({ ...input, quantity: 0 })
    expect(result.costPerUnit).toBeNull()
    expect(result.totalMaterialCost).toBe(0)
    expect(result.totalMachineCost).toBe(0)
  })

  it('converts margin to sale price using margin over the sale', () => {
    expect(salePriceFromMargin(70, 30)).toBeCloseTo(100)
    expect(salePriceFromMargin(100, 0)).toBeCloseTo(100)
  })

  it('converts sale price to margin', () => {
    expect(marginFromSalePrice(70, 100)).toBeCloseTo(30)
    expect(marginFromSalePrice(100, 100)).toBeCloseTo(0)
  })

  it('rejects invalid margin and price inputs', () => {
    expect(salePriceFromMargin(70, 100)).toBeNull()
    expect(marginFromSalePrice(70, 0)).toBeNull()
    expect(salePriceFromMargin(null, 30)).toBeNull()
    expect(marginFromSalePrice(null, 100)).toBeNull()
  })

  it('rounds currency to two decimals', () => {
    expect(roundCurrency(2.400375)).toBe(2.4)
    expect(roundCurrency(3.429107142857143)).toBe(3.43)
  })
})
