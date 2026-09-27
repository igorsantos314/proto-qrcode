import { useEffect } from 'react'
import type { ReactNode } from 'react'
import styles from './ConfirmDialog.module.css'

export type ConfirmVariant = 'success' | 'danger'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  variant: ConfirmVariant
  icon: ReactNode
  confirmLabel: string
  cancelLabel?: string
  showCancel?: boolean
  onConfirm: () => void
  onClose: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  variant,
  icon,
  confirmLabel,
  cancelLabel = 'Cancelar',
  showCancel = true,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) {
      return
    }
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) {
    return null
  }

  const confirmClass =
    variant === 'danger' ? styles.confirmDanger : styles.confirmSuccess
  const iconClass =
    variant === 'danger' ? styles.iconDanger : styles.iconSuccess

  return (
    <div
      className={styles.overlay}
      data-testid="confirm-dialog-overlay"
      onClick={onClose}
    >
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.header}>
          <span className={`${styles.icon} ${iconClass}`}>{icon}</span>
          <h2 id="confirm-dialog-title" className={styles.title}>
            {title}
          </h2>
        </div>
        <p className={styles.description}>{description}</p>
        <div className={styles.actions}>
          {showCancel && (
            <button
              type="button"
              className={styles.cancel}
              onClick={onClose}
            >
              {cancelLabel}
            </button>
          )}
          <button
            type="button"
            className={confirmClass}
            data-variant={variant}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}