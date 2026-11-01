import { useState } from 'react'
import type { BudgetCalculations, ReusableParameter } from '../../lib/budget/types'
import type { BudgetFormState } from '../../lib/budget/form'
import { formatCurrency } from '../../lib/format'
import styles from './budgets.module.css'

interface BudgetFormProps {
  form: BudgetFormState
  calculations: BudgetCalculations
  parameters: ReusableParameter[]
  errors: string[]
  editing: boolean
  onChange: (patch: Partial<BudgetFormState>) => void
  onMarginChange: (value: number) => void
  onSalePriceChange: (value: number) => void
  onAddCost: () => void
  onUpdateCost: (id: string, patch: { description?: string; value?: number }) => void
  onRemoveCost: (id: string) => void
  onAddParameter: (parameterId: string, quantity: number) => void
  onUpdateParameterQuantity: (index: number, quantity: number) => void
  onRemoveParameter: (index: number) => void
  onSubmit: () => void
  onReset: () => void
}

function toNumber(value: string): number {
  const numeric = Number(value.replace(',', '.'))
  return Number.isFinite(numeric) ? numeric : 0
}

interface NumberFieldProps {
  id: string
  label: string
  value: number
  step?: string
  onChange: (value: number) => void
  hint?: string
}

function NumberField({
  id,
  label,
  value,
  step = 'any',
  onChange,
  hint,
}: NumberFieldProps) {
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <input
        id={id}
        className={styles.input}
        type="number"
        min={0}
        step={step}
        value={value}
        onChange={(event) => onChange(toNumber(event.target.value))}
      />
      {hint && <span className={styles.cardHint}>{hint}</span>}
    </div>
  )
}

export function BudgetForm({
  form,
  calculations,
  parameters,
  errors,
  editing,
  onChange,
  onMarginChange,
  onSalePriceChange,
  onAddCost,
  onUpdateCost,
  onRemoveCost,
  onAddParameter,
  onUpdateParameterQuantity,
  onRemoveParameter,
  onSubmit,
  onReset,
}: BudgetFormProps) {
  const [selectedParameter, setSelectedParameter] = useState('')
  const [selectedQuantity, setSelectedQuantity] = useState('1')

  const handleAddParameter = () => {
    if (!selectedParameter) {
      return
    }
    onAddParameter(selectedParameter, toNumber(selectedQuantity))
    setSelectedParameter('')
    setSelectedQuantity('1')
  }

  return (
    <section className={styles.card} aria-label="Registro de orçamento">
      <div className={styles.cardHeader}>
        <div>
          <h2 className={styles.cardTitle}>
            {editing ? 'Editando orçamento' : 'Novo orçamento'}
          </h2>
          <p className={styles.cardHint}>
            Preencha os custos e veja o preço sugerido em tempo real.
          </p>
        </div>
      </div>

      {errors.length > 0 && (
        <ul className={styles.errors}>
          {errors.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      )}

      <div className={styles.fieldGrid}>
        <div className={`${styles.field} ${styles.fieldWide}`}>
          <label htmlFor="budget-material" className={styles.label}>
            Tipo de material
          </label>
          <input
            id="budget-material"
            className={styles.input}
            placeholder="Ex.: MDF, acrílico, madeira"
            value={form.materialType}
            onChange={(event) => onChange({ materialType: event.target.value })}
          />
        </div>

        <NumberField
          id="budget-material-cost"
          label="Custo do material (R$/m²)"
          value={form.materialCostPerM2}
          onChange={(value) => onChange({ materialCostPerM2: value })}
        />
        <NumberField
          id="budget-quantity"
          label="Quantidade de peças"
          value={form.quantity}
          step="1"
          onChange={(value) => onChange({ quantity: value })}
        />
        <NumberField
          id="budget-width"
          label="Largura da peça (mm)"
          value={form.widthMm}
          onChange={(value) => onChange({ widthMm: value })}
        />
        <NumberField
          id="budget-height"
          label="Altura da peça (mm)"
          value={form.heightMm}
          onChange={(value) => onChange({ heightMm: value })}
        />
        <NumberField
          id="budget-time"
          label="Tempo de gravação por peça (h)"
          value={form.engravingTimeHours}
          onChange={(value) => onChange({ engravingTimeHours: value })}
        />
        <NumberField
          id="budget-energy"
          label="Custo de energia (R$/kWh)"
          value={form.energyCostPerKwh}
          onChange={(value) => onChange({ energyCostPerKwh: value })}
        />
        <NumberField
          id="budget-consumption"
          label="Consumo da máquina (kWh/h)"
          value={form.machineConsumptionKwhPerHour}
          onChange={(value) =>
            onChange({ machineConsumptionKwhPerHour: value })
          }
        />
        <NumberField
          id="budget-depreciation"
          label="Depreciação da máquina (R$/h)"
          value={form.depreciationPerHour}
          onChange={(value) => onChange({ depreciationPerHour: value })}
        />
        <NumberField
          id="budget-margin"
          label="Margem de lucro (%)"
          value={form.marginPercent}
          onChange={onMarginChange}
          hint="Editando a margem, o preço de venda é recalculado."
        />
        <NumberField
          id="budget-price"
          label="Preço de venda unitário (R$)"
          value={form.salePrice}
          onChange={onSalePriceChange}
          hint="Editando o preço, a margem é recalculada."
        />
      </div>

      <div className={styles.subsection}>
        <div className={styles.subsectionHeader}>
          <h3 className={styles.subsectionTitle}>Custos adicionais</h3>
          <button type="button" className={styles.ghost} onClick={onAddCost}>
            + Adicionar custo
          </button>
        </div>
        {form.additionalCosts.length === 0 ? (
          <p className={styles.cardHint}>
            Nenhum custo adicional. Some cola, embalagem, verniz e outros.
          </p>
        ) : (
          <div className={styles.lineItems}>
            {form.additionalCosts.map((cost) => (
              <div key={cost.id} className={styles.lineRow}>
                <input
                  className={styles.input}
                  aria-label="Descrição do custo adicional"
                  placeholder="Descrição"
                  value={cost.description}
                  onChange={(event) =>
                    onUpdateCost(cost.id, { description: event.target.value })
                  }
                />
                <input
                  className={styles.input}
                  aria-label="Valor do custo adicional"
                  type="number"
                  min={0}
                  step="any"
                  placeholder="Valor (R$)"
                  value={cost.value}
                  onChange={(event) =>
                    onUpdateCost(cost.id, {
                      value: toNumber(event.target.value),
                    })
                  }
                />
                <button
                  type="button"
                  className={styles.danger}
                  onClick={() => onRemoveCost(cost.id)}
                  aria-label="Remover custo adicional"
                >
                  Remover
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.subsection}>
        <div className={styles.subsectionHeader}>
          <h3 className={styles.subsectionTitle}>
            Parâmetros reutilizáveis aplicados
          </h3>
        </div>
        <div className={styles.lineRow}>
          <select
            className={styles.input}
            aria-label="Parâmetro reutilizável"
            value={selectedParameter}
            onChange={(event) => setSelectedParameter(event.target.value)}
          >
            <option value="">Selecione um parâmetro</option>
            {parameters.map((parameter) => (
              <option key={parameter.id} value={parameter.id}>
                {parameter.name} — {formatCurrency(parameter.value)} /{' '}
                {parameter.unit}
              </option>
            ))}
          </select>
          <input
            className={styles.input}
            aria-label="Quantidade do parâmetro"
            type="number"
            min={0}
            step="any"
            value={selectedQuantity}
            onChange={(event) => setSelectedQuantity(event.target.value)}
          />
          <button
            type="button"
            className={styles.secondary}
            onClick={handleAddParameter}
          >
            Aplicar
          </button>
        </div>

        {form.appliedParameters.length > 0 && (
          <div className={styles.lineItems}>
            {form.appliedParameters.map((parameter, index) => (
              <div
                key={`${parameter.parameterId}-${index}`}
                className={styles.lineRow}
              >
                <span className={styles.metaText}>
                  {parameter.name} ({formatCurrency(parameter.unitValue)} /{' '}
                  {parameter.unit})
                </span>
                <input
                  className={styles.input}
                  aria-label={`Quantidade de ${parameter.name}`}
                  type="number"
                  min={0}
                  step="any"
                  value={parameter.quantity}
                  onChange={(event) =>
                    onUpdateParameterQuantity(
                      index,
                      toNumber(event.target.value),
                    )
                  }
                />
                <button
                  type="button"
                  className={styles.danger}
                  onClick={() => onRemoveParameter(index)}
                  aria-label={`Remover ${parameter.name}`}
                >
                  Remover
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.primary} onClick={onSubmit}>
          {editing ? 'Salvar alterações' : 'Salvar orçamento'}
        </button>
        <button type="button" className={styles.secondary} onClick={onReset}>
          {editing ? 'Cancelar edição' : 'Limpar'}
        </button>
        <span className={styles.cardHint}>
          Custo por unidade: {formatCurrency(calculations.costPerUnit ?? 0)}
        </span>
      </div>
    </section>
  )
}
