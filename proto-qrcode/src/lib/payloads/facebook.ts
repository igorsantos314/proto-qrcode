import type { PayloadFields } from './types'

export const FACEBOOK_FIELD = 'url'

export function normalizeFacebookUrl(value: string): string {
  let url = value.trim()
  if (!url) {
    return ''
  }
  if (!/^https?:\/\//i.test(url)) {
    url = url.replace(/^\/+/, '')
    url = url.startsWith('facebook.com/') || url.startsWith('www.facebook.com/')
      ? `https://${url}`
      : `https://facebook.com/${url}`
  }
  return url
}

export function buildFacebookPayload(fields: PayloadFields): string {
  return normalizeFacebookUrl(String(fields[FACEBOOK_FIELD] ?? ''))
}

export function validateFacebook(fields: PayloadFields): string[] {
  const errors: string[] = []
  if (!normalizeFacebookUrl(String(fields[FACEBOOK_FIELD] ?? ''))) {
    errors.push('Informe a página ou perfil do Facebook.')
  }
  return errors
}