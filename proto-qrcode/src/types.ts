import type { PayloadFields, QrPayloadType } from './lib/payloads/types'

export type QrBackground = 'none' | 'white'

export interface SavedQrCodeInput {
  type: QrPayloadType
  fields: PayloadFields
  payload: string
  background: QrBackground
  logoDataUrl: string | null
  borderWidth?: number
  borderRadius?: number
}

export interface SavedQrCode extends SavedQrCodeInput {
  id: string
  createdAt: string
  updatedAt: string
}