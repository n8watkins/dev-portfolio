/**
 * The rate limit on /api/where (app/api/where/route.ts): at most 30 answers a
 * minute per connection, a sliding window counted in a Durable Object per key
 * (`RATE_LIMIT_COUNTERS`, worker/rate-limit-counter.js), the way n8builds-web
 * counts its own limits.
 *
 * Why not Workers' rate limiting binding: on 2026-11-26 it answered success to
 * 45 and then 160 serial requests from one connection in two minutes, against
 * a limit of 30 (it is approximate and per location by design; see "The bold
 * map" in docs/HANDOFF.md).
 *
 * The key is never the address itself: IPv6 is reduced to its /64 (one
 * subscriber holds a whole /64), then the address is hashed, and only the hash
 * names the counter. The counter keeps the times of the allowed requests and
 * deletes itself once they are out of the window. Nothing is logged about the
 * request.
 *
 * The route still answers when the counters are missing or fail (a visitor's
 * map is never broken by this), and says which happened in `X-RateLimit-State`.
 */

export const WHERE_LIMIT = 30
export const WHERE_WINDOW_MS = 60_000
/** A counter slower than this counts as failed (n8builds-web uses the same). */
const COUNTER_TIMEOUT_MS = 3000

/** The part of the RATE_LIMIT_COUNTERS Durable Object namespace this file uses. */
export interface CounterNamespace {
  idFromName(name: string): unknown
  get(id: unknown): { limit(max: number, windowMs: number): Promise<boolean> }
}

/**
 * - `ok`: counted, under the limit.
 * - `limited`: over the limit; the route answers 429.
 * - `absent`: no counters (not on Workers: `next dev`, `next start`, the tests).
 * - `error`: the counters are there but failed or were too slow.
 */
export type LimitState = 'ok' | 'limited' | 'absent' | 'error'

export const LIMIT_HEADER = 'X-RateLimit-State'

/** The binding when it looks like a Durable Object namespace, else undefined. */
export function asCounters(value: unknown): CounterNamespace | undefined {
  const v = value as CounterNamespace | undefined
  return v && typeof v.idFromName === 'function' && typeof v.get === 'function' ? v : undefined
}

/**
 * Rate-limit key for a client address: IPv4 as is, IPv6 reduced to its /64
 * prefix (as n8builds-web's lib/security/rateLimiter.ts rateLimitIpKey).
 */
export function rateLimitIpKey(ip: string): string {
  if (!ip.includes(':')) return ip
  const address = ip.split('%')[0].toLowerCase()
  const mapped = address.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/)
  if (mapped) return mapped[1]
  const [head, tail] = address.split('::')
  const headParts = head ? head.split(':') : []
  const tailParts = tail ? tail.split(':') : []
  const groups =
    tail === undefined
      ? headParts
      : [...headParts, ...Array(8 - headParts.length - tailParts.length).fill('0'), ...tailParts]
  return `${groups
    .slice(0, 4)
    .map((g) => (parseInt(g, 16) || 0).toString(16))
    .join(':')}::/64`
}

/** The counter's name for an address: a hash of its key, never the address. */
export async function counterName(ip: string | null): Promise<string> {
  const key = ip?.trim() ? rateLimitIpKey(ip.trim()) : 'no-address'
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`where:${key}`))
  const hex = Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('')
  return `where:${hex.slice(0, 32)}`
}

/** Counts this request against the limit for its connection's address (`cf-connecting-ip`). */
export async function checkLimit(
  counters: CounterNamespace | undefined,
  ip: string | null
): Promise<LimitState> {
  if (!counters) return 'absent'
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    const counter = counters.get(counters.idFromName(await counterName(ip)))
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error('counter timed out')), COUNTER_TIMEOUT_MS)
    })
    const allowed = await Promise.race([counter.limit(WHERE_LIMIT, WHERE_WINDOW_MS), timeout])
    if (typeof allowed !== 'boolean') throw new TypeError('counter answered without a decision')
    return allowed ? 'ok' : 'limited'
  } catch (error) {
    // One line, the error's kind only: nothing about the request or the visitor.
    console.error(
      `where: rate limit counter failed (${error instanceof Error ? error.name : typeof error})`
    )
    return 'error'
  } finally {
    clearTimeout(timer)
  }
}
