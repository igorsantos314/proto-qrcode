import type { PayloadFields, QrPayloadType } from './types'
import { buildFacebookPayload } from './facebook'
import { buildInstagramPayload } from './instagram'
import { buildPixPayload } from './pix'
import { buildTextPayload } from './text'
import { buildWifiPayload } from './wifi'

const builders: Record<QrPayloadType, (fields: PayloadFields) => string> = {
  text: buildTextPayload,
  pix: buildPixPayload,
  instagram: buildInstagramPayload,
  wifi: buildWifiPayload,
  facebook: buildFacebookPayload,
}

export function buildPayload(
  type: QrPayloadType | string,
  fields: PayloadFields,
): string {
  const builder = builders[type as QrPayloadType]
  return builder ? builder(fields) : buildTextPayload(fields)
}