export interface GeneratedConfig {
  payload: string
  background: 'none' | 'white'
  logoDataUrl: string | null
}

export function sameGeneratedConfig(
  a: GeneratedConfig | null,
  b: GeneratedConfig | null,
): boolean {
  if (a === b) {
    return true
  }
  if (!a || !b) {
    return false
  }
  return (
    a.payload === b.payload &&
    a.background === b.background &&
    a.logoDataUrl === b.logoDataUrl
  )
}

export function isStale(current: GeneratedConfig, generated: GeneratedConfig | null): boolean {
  return generated !== null && !sameGeneratedConfig(current, generated)
}