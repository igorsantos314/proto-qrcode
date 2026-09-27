import type { QrPayloadType } from '../lib/payloads/types'
import { PAYLOAD_TYPES } from '../lib/payloads/types'
import styles from './PayloadTabs.module.css'

const LABELS: Record<QrPayloadType, string> = {
  text: 'Texto',
  pix: 'Pix',
  instagram: 'Instagram',
  wifi: 'WiFi',
  facebook: 'Facebook',
}

interface PayloadTabsProps {
  active: QrPayloadType
  onChange: (type: QrPayloadType) => void
}

export function PayloadTabs({ active, onChange }: PayloadTabsProps) {
  return (
    <div className={styles.tabs} role="tablist" aria-label="Tipo de QR code">
      {PAYLOAD_TYPES.map((type) => (
        <button
          key={type}
          type="button"
          role="tab"
          aria-selected={active === type}
          className={active === type ? styles.tabActive : styles.tab}
          onClick={() => onChange(type)}
        >
          {LABELS[type]}
        </button>
      ))}
    </div>
  )
}