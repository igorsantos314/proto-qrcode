import { calculateBudget } from '../../lib/budget/calculations'
import type { BudgetRecord } from '../../lib/budget/types'
import { formatCurrency, formatDateTime, formatDecimal } from '../../lib/format'
import styles from './budgets.module.css'

interface BudgetListProps {
  records: BudgetRecord[]
  editingId: string | null
  storageError: string | null
  onEdit: (record: BudgetRecord) => void
  onDelete: (record: BudgetRecord) => void
  onExport: (record: BudgetRecord) => void
}

export function BudgetList({
  records,
  editingId,
  storageError,
  onEdit,
  onDelete,
  onExport,
}: BudgetListProps) {
  return (
    <section className={styles.list} aria-label="Orçamentos salvos">
      <div className={styles.listHeader}>
        <h2 className={styles.listTitle}>Orçamentos salvos</h2>
        <span className={styles.count}>{records.length} no total</span>
      </div>

      {storageError && <p className={styles.storageError}>{storageError}</p>}

      {records.length === 0 ? (
        <p className={styles.empty}>
          Nenhum orçamento salvo ainda. Preencha o formulário e clique em
          Salvar orçamento.
        </p>
      ) : (
        <ul className={styles.items}>
          {records.map((record) => {
            const calculations = calculateBudget(record)
            const editing = record.id === editingId
            return (
              <li
                key={record.id}
                className={editing ? styles.itemEditing : styles.item}
              >
                <div className={styles.itemInfo}>
                  <div className={styles.itemMeta}>
                    <span className={styles.badge}>{record.materialType}</span>
                    <time className={styles.metaText} dateTime={record.createdAt}>
                      {formatDateTime(record.createdAt)}
                    </time>
                    {editing && (
                      <span className={styles.editingTag}>Editando</span>
                    )}
                  </div>
                  <div className={styles.itemTotals}>
                    <span>
                      Peças: <strong>{formatDecimal(record.quantity)}</strong>
                    </span>
                    <span>
                      Custo un.:{' '}
                      <strong>
                        {calculations.costPerUnit === null
                          ? '—'
                          : formatCurrency(calculations.costPerUnit)}
                      </strong>
                    </span>
                    <span>
                      Venda un.: <strong>{formatCurrency(record.salePrice)}</strong>
                    </span>
                    <span>
                      Total:{' '}
                      <strong>
                        {formatCurrency(record.salePrice * record.quantity)}
                      </strong>
                    </span>
                  </div>
                </div>
                <div className={styles.itemActions}>
                  <button
                    type="button"
                    className={styles.secondary}
                    onClick={() => onEdit(record)}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className={styles.secondary}
                    onClick={() => onExport(record)}
                  >
                    Exportar .xlsx
                  </button>
                  <button
                    type="button"
                    className={styles.danger}
                    onClick={() => onDelete(record)}
                  >
                    Excluir
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
