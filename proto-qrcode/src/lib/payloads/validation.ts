import type { PayloadFields, QrPayloadType } from './types'
import { validateFacebook } from './facebook'
import { validateInstagram } from './instagram'
import { validatePix } from './pix'
import { validateText } from './text'
import { validateWifi } from './wifi'

const validators: Record<QrPayloadType, (fields: PayloadFields) => string[]> = {
  text: validateText,
  pix: validatePix,
  instagram: validateInstagram,
  wifi: validateWifi,
  facebook: validateFacebook,
}

export function validatePayload(
  type: QrPayloadType | string,
  fields: PayloadFields,
): string[] {
  const validator = validators[type as QrPayloadType]
  return validator ? validator(fields) : validateText(fields)
}