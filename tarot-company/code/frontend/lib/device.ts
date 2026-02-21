// THEO-002: Device token generation and persistence
// UUID generated on first load, persisted in localStorage, never regenerated.

const DEVICE_TOKEN_KEY = 'ml_device_token'
const DISCLOSED_KEY = 'ml_disclosed'

export function getDeviceToken(): string {
  if (typeof window === 'undefined') return ''

  const existing = localStorage.getItem(DEVICE_TOKEN_KEY)
  if (existing) return existing

  // Generate UUID v4 using the Web Crypto API (available in all modern browsers)
  const token = crypto.randomUUID()
  localStorage.setItem(DEVICE_TOKEN_KEY, token)
  return token
}

export function isDisclosed(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(DISCLOSED_KEY) === 'true'
}

export function markDisclosed(): void {
  localStorage.setItem(DISCLOSED_KEY, 'true')
}

export function getLastSessionId(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('ml_last_session_id')
}

export function setLastSessionId(sessionId: string): void {
  localStorage.setItem('ml_last_session_id', sessionId)
}
