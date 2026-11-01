import { useState } from 'react'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { CheckIcon, TrashIcon } from '../components/icons'
import { BudgetBreakdown } from '../components/budgets/BudgetBreakdown'
import { BudgetForm } from '../components/budgets/BudgetForm'
import { BudgetList } from '../components/budgets/BudgetList'
import { ReusableParametersPanel } from '../components/budgets/ReusableParametersPanel'
import styles from '../components/budgets/budgets.module.css'
import { calculateBudget } from '../lib/budget/calculations'
import {
  budgetFromRecord,
  createEmptyBudget,
  recalculatePrice,
  validateBudgetForm,
  withMarginChange,
  withSalePriceChange,
} from '../lib/budget/form'
import type { BudgetFormState } from '../lib/budget/form'
import type { BudgetInput, BudgetRecord } from '../lib/budget/types'
import { useBudgetsContext } from '../hooks/useBudgetsContext'
import { useReusableParametersContext } from '../hooks/useReusableParametersContext'

type DialogState =
  | { kind: 'save' }
  | { kind: 'delete'; record: BudgetRecord }
  | null

function toBudgetInput(form: BudgetFormState): BudgetInput {
  return {
    materialType: form.materialType,
    materialCostPerM2: form.materialCostPerM2,
    widthMm: form.widthMm,
    heightMm: form.heightMm,
    quantity: form.quantity,
    engravingTimeHours: form.engravingTimeHours,
    energyCostPerKwh: form.energyCostPerKwh,
    machineConsumptionKwhPerHour: form.machineConsumptionKwhPerHour,
    depreciationPerHour: form.depreciationPerHour,
    marginPercent: form.marginPercent,
    salePrice: form.salePrice,
    additionalCosts: form.additionalCosts.map((cost) => ({ ...cost })),
    appliedParameters: form.appliedParameters.map((parameter) => ({
      ...parameter,
    })),
  }
}

export function BudgetsPage() {
  const budgets = useBudgetsContext()
  const reusable = useReusableParametersContext()
  const [form, setForm] = useState<BudgetFormState>(() =>
    createEmptyBudget(reusable.parameters),
  )
  const [errors, setErrors] = useState<string[]>([])
  const [dialog, setDialog] = useState<DialogState>(null)

  const calculations = calculateBudget(form)
  const editing = budgets.editingId !== null

  const updateForm = (patch: Partial<BudgetFormState>) => {
    setForm((prev) => recalculatePrice({ ...prev, ...patch }))
  }

  const handleAddCost = () => {
    setForm((prev) =>
      recalculatePrice({
        ...prev,
        additionalCosts: [
          ...prev.additionalCosts,
          { id: crypto.randomUUID(), description: '', value: 0 },
        ],
      }),
    )
  }

  const handleUpdateCost = (
    id: string,
    patch: { description?: string; value?: number },
  ) => {
    setForm((prev) =>
      recalculatePrice({
        ...prev,
        additionalCosts: prev.additionalCosts.map((cost) =>
          cost.id === id ? { ...cost, ...patch } : cost,
        ),
      }),
    )
  }

  const handleRemoveCost = (id: string) => {
    setForm((prev) =>
      recalculatePrice({
        ...prev,
        additionalCosts: prev.additionalCosts.filter((cost) => cost.id !== id),
      }),
    )
  }

  const handleAddParameter = (parameterId: string, quantity: number) => {
    const parameter = reusable.parameters.find(
      (item) => item.id === parameterId,
    )
    if (!parameter) {
      return
    }
    setForm((prev) =>
      recalculatePrice({
        ...prev,
        appliedParameters: [
          ...prev.appliedParameters,
          {
            parameterId: parameter.id,
            name: parameter.name,
            unit: parameter.unit,
            unitValue: parameter.value,
            quantity,
          },
        ],
      }),
    )
  }

  const handleUpdateParameterQuantity = (index: number, quantity: number) => {
    setForm((prev) =>
      recalculatePrice({
        ...prev,
        appliedParameters: prev.appliedParameters.map((parameter, position) =>
          position === index ? { ...parameter, quantity } : parameter,
        ),
      }),
    )
  }

  const handleRemoveParameter = (index: number) => {
    setForm((prev) =>
      recalculatePrice({
        ...prev,
        appliedParameters: prev.appliedParameters.filter(
          (_parameter, position) => position !== index,
        ),
      }),
    )
  }

  const handleSubmit = () => {
    const validationErrors = validateBudgetForm(form)
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }
    setErrors([])

    const input = toBudgetInput(form)
    if (budgets.editingId) {
      budgets.updateRecord(budgets.editingId, input)
      budgets.clearEditing()
    } else {
      budgets.createRecord(input)
    }
    setDialog({ kind: 'save' })
  }

  const handleReset = () => {
    setForm(createEmptyBudget(reusable.parameters))
    budgets.clearEditing()
    setErrors([])
  }

  const handleEdit = (record: BudgetRecord) => {
    setForm(budgetFromRecord(record))
    budgets.startEditing(record.id)
    setErrors([])
  }

  const handleDelete = (record: BudgetRecord) => {
    setDialog({ kind: 'delete', record })
  }

  const handleExport = async (record: BudgetRecord) => {
    try {
      const { exportBudgetXlsx } = await import('../lib/budget/exportXlsx')
      exportBudgetXlsx(record)
    } catch {
      setErrors(['Não foi possível exportar o orçamento em .xlsx.'])
    }
  }

  const handleDialogConfirm = () => {
    if (dialog?.kind === 'delete') {
      budgets.removeRecord(dialog.record.id)
      if (budgets.editingId === dialog.record.id) {
        budgets.clearEditing()
      }
    }
    setDialog(null)
  }

  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.heroText}>
          <span className={styles.eyebrow}>LaserGest</span>
          <h1 className={styles.title}>Orçamentos</h1>
          <p className={styles.subtitle}>
            Calcule material, máquina, custos indiretos e margem para chegar ao
            preço de venda ideal de cada peça.
          </p>
        </div>
        <button type="button" className={styles.secondary} onClick={handleReset}>
          Novo orçamento
        </button>
      </header>

      <ReusableParametersPanel
        parameters={reusable.parameters}
        storageError={reusable.storageError}
        onCreate={reusable.createParameter}
        onUpdate={reusable.updateParameter}
        onRemove={reusable.removeParameter}
      />

      <div className={styles.layout}>
        <BudgetForm
          form={form}
          calculations={calculations}
          parameters={reusable.parameters}
          errors={errors}
          editing={editing}
          onChange={updateForm}
          onMarginChange={(value) =>
            setForm((prev) => withMarginChange(prev, value))
          }
          onSalePriceChange={(value) =>
            setForm((prev) => withSalePriceChange(prev, value))
          }
          onAddCost={handleAddCost}
          onUpdateCost={handleUpdateCost}
          onRemoveCost={handleRemoveCost}
          onAddParameter={handleAddParameter}
          onUpdateParameterQuantity={handleUpdateParameterQuantity}
          onRemoveParameter={handleRemoveParameter}
          onSubmit={handleSubmit}
          onReset={handleReset}
        />
        <BudgetBreakdown form={form} calculations={calculations} />
      </div>

      <BudgetList
        records={budgets.records}
        editingId={budgets.editingId}
        storageError={budgets.storageError}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onExport={handleExport}
      />

      <ConfirmDialog
        open={dialog !== null}
        variant={dialog?.kind === 'delete' ? 'danger' : 'success'}
        icon={
          dialog?.kind === 'delete' ? (
            <TrashIcon size={20} />
          ) : (
            <CheckIcon size={20} />
          )
        }
        title={
          dialog?.kind === 'delete'
            ? 'Excluir orçamento?'
            : 'Orçamento salvo'
        }
        description={
          dialog?.kind === 'delete'
            ? 'Este orçamento salvo será removido permanentemente. Essa ação não pode ser desfeita.'
            : 'O orçamento foi salvo localmente neste navegador. Ao limpar o cache do navegador, todos os orçamentos salvos serão perdidos.'
        }
        confirmLabel={dialog?.kind === 'delete' ? 'Excluir' : 'Entendi'}
        cancelLabel="Cancelar"
        showCancel={dialog?.kind === 'delete'}
        onConfirm={handleDialogConfirm}
        onClose={() => setDialog(null)}
      />
    </main>
  )
}
