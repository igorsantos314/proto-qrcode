import type { BudgetCalculations } from '../../lib/budget/types'
import type { BudgetFormState } from '../../lib/budget/form'
import { formatCurrency, formatDecimal } from '../../lib/format'
import styles from './budgets.module.css'

interface BudgetBreakdownProps {
  form: BudgetFormState
  calculations: BudgetCalculations
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.summaryRow}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

export function BudgetBreakdown({
  form,
  calculations,
}: BudgetBreakdownProps) {
  const unitCost = calculations.costPerUnit
  const marginInvalid = form.marginPercent >= 100
  const priceInvalid = form.salePrice <= 0
  const totalSale = form.salePrice * Math.max(0, form.quantity)

  return (
    <section
      className={`${styles.card} ${styles.summary}`}
      aria-label="Resumo do orçamento"
    >
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>Resumo do orçamento</h2>
      </div>

      <div className={styles.highlight}>
        <span className={styles.highlightLabel}>Preço de venda unitário</span>
        <span className={styles.highlightValue}>
          {formatCurrency(form.salePrice)}
        </span>
        <span className={styles.cardHint}>
          Margem de {formatDecimal(form.marginPercent)}% • Total{' '}
          {formatCurrency(totalSale)}
        </span>
      </div>

      {(marginInvalid || priceInvalid) && (
        <p className={styles.notice} role="alert">
          {marginInvalid
            ? 'A margem deve ser menor que 100%.'
            : 'O preço de venda deve ser maior que zero.'}
        </p>
      )}

      <div className={styles.summaryRows}>
        <SummaryRow
          label="Área da peça"
          value={`${formatDecimal(calculations.pieceAreaM2)} m²`}
        />
        <SummaryRow
          label="Material por peça"
          value={formatCurrency(calculations.unitMaterialCost)}
        />
        <SummaryRow
          label="Material total"
          value={formatCurrency(calculations.totalMaterialCost)}
        />
        <SummaryRow
          label="Máquina por hora"
          value={formatCurrency(calculations.machineCostPerHour)}
        />
        <SummaryRow
          label="Máquina total"
          value={formatCurrency(calculations.totalMachineCost)}
        />
        <SummaryRow
          label="Custos adicionais"
          value={formatCurrency(calculations.additionalCostsTotal)}
        />
        <hr className={styles.summaryDivider} />
        <div className={styles.summaryTotal}>
          <span>Custo total</span>
          <span>{formatCurrency(calculations.totalCost)}</span>
        </div>
        <div className={styles.summaryTotal}>
          <span>Custo por unidade</span>
          <span>
            {unitCost === null ? '—' : formatCurrency(unitCost)}
          </span>
        </div>
        <hr className={styles.summaryDivider} />
        <SummaryRow
          label="Peças"
          value={formatDecimal(Math.max(0, form.quantity))}
        />
        <SummaryRow
          label="Tempo por peça"
          value={`${formatDecimal(form.engravingTimeHours)} h`}
        />
        <SummaryRow
          label="Lucro por unidade"
          value={
            unitCost === null
              ? '—'
              : formatCurrency(Math.max(0, form.salePrice - unitCost))
          }
        />
      </div>
    </section>
  )
}
