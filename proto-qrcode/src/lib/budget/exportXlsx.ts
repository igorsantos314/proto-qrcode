import * as XLSX from 'xlsx'
import { calculateBudget } from './calculations'
import type { BudgetRecord } from './types'

type Cell = string | number
type Row = Cell[]

export function budgetSlug(materialType: string): string {
  const slug = materialType
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return slug || 'material'
}

export function budgetFilename(record: BudgetRecord): string {
  return `orcamento-${budgetSlug(record.materialType)}-${Date.now()}.xlsx`
}

export function buildBudgetSheetRows(record: BudgetRecord): Row[] {
  const calculations = calculateBudget(record)
  const rows: Row[] = [
    ['LaserGest — Orçamento'],
    ['Material', record.materialType],
    ['Criado em', new Date(record.createdAt).toLocaleString('pt-BR')],
    [],
    ['Entradas'],
    ['Custo do material (R$/m²)', record.materialCostPerM2],
    ['Largura da peça (mm)', record.widthMm],
    ['Altura da peça (mm)', record.heightMm],
    ['Quantidade de peças', record.quantity],
    ['Tempo de gravação por peça (h)', record.engravingTimeHours],
    ['Custo de energia (R$/kWh)', record.energyCostPerKwh],
    ['Consumo da máquina (kWh/h)', record.machineConsumptionKwhPerHour],
    ['Depreciação da máquina (R$/h)', record.depreciationPerHour],
    ['Margem de lucro (%)', record.marginPercent],
    ['Preço de venda (R$)', record.salePrice],
    [],
    ['Parâmetros aplicados', 'Valor unitário', 'Quantidade', 'Subtotal'],
  ]

  for (const parameter of record.appliedParameters) {
    rows.push([
      `${parameter.name} (${parameter.unit})`,
      parameter.unitValue,
      parameter.quantity,
      parameter.unitValue * parameter.quantity,
    ])
  }

  rows.push([], ['Custos adicionais', 'Valor'])
  for (const cost of record.additionalCosts) {
    rows.push([cost.description, cost.value])
  }

  rows.push(
    [],
    ['Memória de cálculo', 'Valor'],
    ['Área da peça (m²)', calculations.pieceAreaM2],
    ['Custo do material por peça (R$)', calculations.unitMaterialCost],
    ['Custo total do material (R$)', calculations.totalMaterialCost],
    ['Custo da máquina por hora (R$)', calculations.machineCostPerHour],
    ['Custo total da máquina (R$)', calculations.totalMachineCost],
    ['Custos adicionais totais (R$)', calculations.additionalCostsTotal],
    ['Custo total (R$)', calculations.totalCost],
    ['Custo por unidade (R$)', calculations.costPerUnit ?? 0],
    [],
    ['Resultado'],
    ['Margem de lucro (%)', record.marginPercent],
    ['Preço de venda unitário (R$)', record.salePrice],
    ['Preço de venda total (R$)', record.salePrice * record.quantity],
  )

  return rows
}

export function exportBudgetXlsx(record: BudgetRecord): void {
  const worksheet = XLSX.utils.aoa_to_sheet(buildBudgetSheetRows(record))
  worksheet['!cols'] = [
    { wch: 34 },
    { wch: 16 },
    { wch: 14 },
    { wch: 16 },
  ]
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Orçamento')
  XLSX.writeFile(workbook, budgetFilename(record))
}
