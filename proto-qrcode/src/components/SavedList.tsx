import type { QrPayloadType } from '../lib/payloads/types'
import type { SavedQrCode } from '../types'
import {
  formatDateTime,
  payloadTypeLabel,
  summarizePayload,
} from '../lib/format'
import styles from './SavedList.module.css'

interface SavedItemProps {
  record: SavedQrCode
  editing: boolean
  onEdit: (record: SavedQrCode) => void
  onDelete: (record: SavedQrCode) => void
}

function SavedItem({ record, editing, onEdit, onDelete }: SavedItemProps) {
  return (
    <li className={editing ? styles.itemEditing : styles.item}>
      <div className={styles.itemInfo}>
        <div className={styles.itemMeta}>
          <span className={styles.badge}>
            {payloadTypeLabel(record.type as QrPayloadType)}
          </span>
          <time className={styles.date} dateTime={record.createdAt}>
            {formatDateTime(record.createdAt)}
          </time>
          {editing && <span className={styles.editingTag}>Editando</span>}
        </div>
        <p className={styles.payload} title={record.payload}>
          {summarizePayload(record.payload)}
        </p>
      </div>
      <div className={styles.itemActions}>
        <button
          type="button"
          className={styles.editButton}
          onClick={() => onEdit(record)}
        >
          Editar
        </button>
        <button
          type="button"
          className={styles.deleteButton}
          onClick={() => onDelete(record)}
        >
          Excluir
        </button>
      </div>
    </li>
  )
}

interface PaginationProps {
  page: number
  pageCount: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, pageCount, onPageChange }: PaginationProps) {
  if (pageCount <= 1) {
    return null
  }
  return (
    <nav className={styles.pagination} aria-label="Paginação">
      <button
        type="button"
        className={styles.pageButton}
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        Anterior
      </button>
      <span className={styles.pageInfo}>
        Página {page} de {pageCount}
      </span>
      <button
        type="button"
        className={styles.pageButton}
        disabled={page >= pageCount}
        onClick={() => onPageChange(page + 1)}
      >
        Próxima
      </button>
    </nav>
  )
}

interface SavedListProps {
  records: SavedQrCode[]
  total: number
  page: number
  pageCount: number
  editingId: string | null
  storageError: string | null
  onEdit: (record: SavedQrCode) => void
  onDelete: (record: SavedQrCode) => void
  onPageChange: (page: number) => void
}

export function SavedList({
  records,
  total,
  page,
  pageCount,
  editingId,
  storageError,
  onEdit,
  onDelete,
  onPageChange,
}: SavedListProps) {
  return (
    <section className={styles.list} aria-label="QR codes salvos">
      <div className={styles.header}>
        <h2 className={styles.heading}>QR codes salvos</h2>
        <span className={styles.count}>{total} no total</span>
      </div>

      {storageError && <p className={styles.error}>{storageError}</p>}

      {records.length === 0 ? (
        <p className={styles.empty}>
          Nenhum QR code salvo ainda. Gere um QR code para vê-lo aqui.
        </p>
      ) : (
        <>
          <ul className={styles.items}>
            {records.map((record) => (
              <SavedItem
                key={record.id}
                record={record}
                editing={record.id === editingId}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </ul>
          <Pagination page={page} pageCount={pageCount} onPageChange={onPageChange} />
        </>
      )}
    </section>
  )
}