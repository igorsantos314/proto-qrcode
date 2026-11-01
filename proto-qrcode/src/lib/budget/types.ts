export interface ReusableParameter {
  id: string
  name: string
  unit: string
  value: number
  description?: string
  createdAt: string
  updatedAt: string
}

export interface ReusableParameterInput {
  name: string
  unit: string
  value: number
  description?: string
}

export interface AdditionalCost {
  id: string
  description: string
  value: number
}

export interface AppliedParameter {
  parameterId: string
  name: string
  unit: string
  unitValue: number
  quantity: number
}

export interface BudgetInput {
  materialType: string
  materialCostPerM2: number
  widthMm: number
  heightMm: number
  quantity: number
  engravingTimeHours: number
  energyCostPerKwh: number
  machineConsumptionKwhPerHour: number
  depreciationPerHour: number
  marginPercent: number
  salePrice: number
  additionalCosts: AdditionalCost[]
  appliedParameters: AppliedParameter[]
}

export interface BudgetRecord extends BudgetInput {
  id: string
  createdAt: string
  updatedAt: string
}

export interface BudgetCalculations {
  pieceAreaM2: number
  unitMaterialCost: number
  totalMaterialCost: number
  machineCostPerHour: number
  totalMachineCost: number
  additionalCostsTotal: number
  totalCost: number
  costPerUnit: number | null
}
