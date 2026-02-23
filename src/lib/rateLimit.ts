/**
 * Simple in-memory rate limiter for login attempts.
 * Limits: max 5 attempts per IP per 15-minute window.
 * For production with multiple instances, use Redis.
 */

interface RateLimitEntry {
  count: number
  firstAttempt: number
  blocked: boolean
  blockedUntil: number
}

const store = new Map<string, RateLimitEntry>()
const MAX_ATTEMPTS = 5
const WINDOW_MS = 15 * 60 * 1000 // 15 minutes
const BLOCK_DURATION_MS = 15 * 60 * 1000 // 15 minutes

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store.entries()) {
    if (now - entry.firstAttempt > WINDOW_MS * 2) {
      store.delete(key)
    }
  }
}, 60 * 1000) // Every minute

export function checkRateLimit(identifier: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now()
  const entry = store.get(identifier)

  if (!entry) {
    store.set(identifier, { count: 1, firstAttempt: now, blocked: false, blockedUntil: 0 })
    return { allowed: true }
  }

  // Check if currently blocked
  if (entry.blocked && now < entry.blockedUntil) {
    return { allowed: false, retryAfter: Math.ceil((entry.blockedUntil - now) / 1000) }
  }

  // Reset if window has expired
  if (now - entry.firstAttempt > WINDOW_MS) {
    store.set(identifier, { count: 1, firstAttempt: now, blocked: false, blockedUntil: 0 })
    return { allowed: true }
  }

  // Increment counter
  entry.count++

  if (entry.count > MAX_ATTEMPTS) {
    entry.blocked = true
    entry.blockedUntil = now + BLOCK_DURATION_MS
    store.set(identifier, entry)
    return { allowed: false, retryAfter: Math.ceil(BLOCK_DURATION_MS / 1000) }
  }

  store.set(identifier, entry)
  return { allowed: true }
}

export function resetRateLimit(identifier: string): void {
  store.delete(identifier)
}
