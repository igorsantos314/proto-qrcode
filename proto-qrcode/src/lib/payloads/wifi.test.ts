import { describe, expect, it } from 'vitest'
import {
  buildWifiPayload,
  validateWifi,
  WIFI_FIELDS,
} from './wifi'

describe('wifi payload', () => {
  it('builds a WPA2 payload in the standard format', () => {
    const payload = buildWifiPayload({
      [WIFI_FIELDS.ssid]: 'MinhaRede',
      [WIFI_FIELDS.password]: 'segredo123',
      [WIFI_FIELDS.encryption]: 'WPA',
      [WIFI_FIELDS.hidden]: false,
    })
    expect(payload).toBe('WIFI:T:WPA;S:MinhaRede;P:segredo123;H:false;;')
  })

  it('builds an open (nopass) payload without a password', () => {
    const payload = buildWifiPayload({
      [WIFI_FIELDS.ssid]: 'RedeAberta',
      [WIFI_FIELDS.password]: '',
      [WIFI_FIELDS.encryption]: 'nopass',
      [WIFI_FIELDS.hidden]: false,
    })
    expect(payload).toBe('WIFI:T:nopass;S:RedeAberta;H:false;;')
  })

  it('includes the hidden flag when the network is hidden', () => {
    const payload = buildWifiPayload({
      [WIFI_FIELDS.ssid]: 'Oculta',
      [WIFI_FIELDS.password]: 'senha',
      [WIFI_FIELDS.encryption]: 'WEP',
      [WIFI_FIELDS.hidden]: true,
    })
    expect(payload).toBe('WIFI:T:WEP;S:Oculta;P:senha;H:true;;')
  })

  it('escapes special characters in SSID and password', () => {
    const payload = buildWifiPayload({
      [WIFI_FIELDS.ssid]: 'Casa;2',
      [WIFI_FIELDS.password]: 'p:a,s;do',
      [WIFI_FIELDS.encryption]: 'WPA',
      [WIFI_FIELDS.hidden]: false,
    })
    expect(payload).toBe('WIFI:T:WPA;S:Casa\\;2;P:p\\:a\\,s\\;do;H:false;;')
  })

  it('validates a complete network without errors', () => {
    expect(
      validateWifi({
        [WIFI_FIELDS.ssid]: 'Rede',
        [WIFI_FIELDS.password]: '1234',
        [WIFI_FIELDS.encryption]: 'WPA',
      }),
    ).toEqual([])
  })

  it('reports errors for missing SSID and password', () => {
    const errors = validateWifi({
      [WIFI_FIELDS.ssid]: '',
      [WIFI_FIELDS.password]: '',
      [WIFI_FIELDS.encryption]: 'WPA',
    })
    expect(errors).toEqual([
      'Informe o nome da rede (SSID).',
      'Informe a senha da rede.',
    ])
  })

  it('does not require a password for open networks', () => {
    expect(
      validateWifi({
        [WIFI_FIELDS.ssid]: 'Aberta',
        [WIFI_FIELDS.password]: '',
        [WIFI_FIELDS.encryption]: 'nopass',
      }),
    ).toEqual([])
  })
})