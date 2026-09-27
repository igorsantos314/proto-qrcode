export type QrPayloadType = 'text' | 'pix' | 'instagram' | 'wifi' | 'facebook'

export const PAYLOAD_TYPES: QrPayloadType[] = [
  'text',
  'pix',
  'instagram',
  'wifi',
  'facebook',
]

export type PayloadFields = Record<string, string | boolean>