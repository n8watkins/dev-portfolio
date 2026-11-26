/**
 * The rate limit on /api/where (app/api/where/route.ts): Workers' rate limiting
 * binding `WHERE_RATE_LIMIT` (wrangler.jsonc `ratelimits`, 30 a minute per
 * connection).
 *
 * The route still answers when the limiter is missing or fails (a visitor's
 * map is never broken by it), but it says which happened, in the
 * `X-RateLimit-State` header, so a broken limiter shows from outside instead
 * of looking exactly like a working one under its limit (2026-11-26: 160
 * requests in two minutes all answered 200, and nothing said why).
 */

/** Workers' rate limiting binding. */
export type Limiter = { limit(options: { key: string }): Promise<{ success: boolean }> }

/**
 * - `ok`: counted, under the limit.
 * - `limited`: over the limit; the route answers 429.
 * - `absent`: no binding (not on Workers: `next dev`, `next start`, the tests).
 * - `error`: the binding is there but `limit()` failed or answered nonsense.
 */
export type LimitState = 'ok' | 'limited' | 'absent' | 'error'

export const LIMIT_HEADER = 'X-RateLimit-State'

/** Any value: the binding when it looks like one, else undefined. */
export function asLimiter(value: unknown): Limiter | undefined {
  return value && typeof (value as Limiter).limit === 'function' ? (value as Limiter) : undefined
}

/**
 * Counts this request against the limit. `key` is the connection's address
 * (`cf-connecting-ip`); it lives only in Cloudflare's short-lived counter and
 * is never logged here: a failure is logged as one line with the error's name
 * and nothing about the request.
 */
export async function checkLimit(
  limiter: Limiter | undefined,
  key: string | null
): Promise<LimitState> {
  if (!limiter) return 'absent'
  try {
    // Called on the binding itself: a detached `limit` loses its `this`.
    const result = await limiter.limit({ key: key || 'no-address' })
    if (!result || typeof result.success !== 'boolean')
      throw new TypeError('limit() answered without success')
    return result.success ? 'ok' : 'limited'
  } catch (error) {
    console.error(
      `where: rate limiter failed (${error instanceof Error ? error.name : typeof error})`
    )
    return 'error'
  }
}
