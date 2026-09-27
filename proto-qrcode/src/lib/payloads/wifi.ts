import type { PayloadFields } from './types'

export const WIFI_FIELDS = {
  ssid: 'ssid',
  password: 'password',
  encryption: 'encryption',
  hidden: 'hidden',
} as const

export type WifiEncryption = 'WPA' | 'WEP' | 'nopass'

export const WIFI_ENCRYPTIONS: WifiEncryption[] = ['WPA', 'WEP', 'nopass']

function escapeWifiValue(value: string): string {
  return value.replace(/([\\;,:"])/g, '\\$1')
}

function asEncryption(value: string | boolean | undefined): WifiEncryption {
  return value === 'WEP' || value === 'nopass' ? value : 'WPA'
}

export function buildWifiPayload(fields: PayloadFields): string {
  const ssid = String(fields[WIFI_FIELDS.ssid] ?? '').trim()
  const password = String(fields[WIFI_FIELDS.password] ?? '')
  const encryption = asEncryption(fields[WIFI_FIELDS.encryption])
  const hidden = Boolean(fields[WIFI_FIELDS.hidden])

  let payload = `WIFI:T:${encryption};`
  payload += `S:${escapeWifiValue(ssid)};`
  if (encryption !== 'nopass') {
    payload += `P:${escapeWifiValue(password)};`
  }
  payload += `H:${hidden ? 'true' : 'false'};;`
  return payload
}

export function validateWifi(fields: PayloadFields): string[] {
  const errors: string[] = []
  const ssid = String(fields[WIFI_FIELDS.ssid] ?? '').trim()
  if (!ssid) {
    errors.push('Informe o nome da rede (SSID).')
  }
  const encryption = asEncryption(fields[WIFI_FIELDS.encryption])
  if (encryption !== 'nopass' && !String(fields[WIFI_FIELDS.password] ?? '')) {
    errors.push('Informe a senha da rede.')
  }
  return errors
}