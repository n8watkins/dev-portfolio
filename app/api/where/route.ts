import { getCloudflareContext } from '@opennextjs/cloudflare'
import { visitorFromRequest } from '@/lib/visitor'

/**
 * Where the visitor roughly is, for the home map's line to them
 * (components/ui/BoldMap, which asks once after the map is up).
 *
 * The answer is `{ visitor }`: null, or a point rounded to half a degree, the
 * name of a listed place near it, and the distance from Los Angeles (lib/visitor.ts,
 * from Cloudflare's per-request data). Never the IP address or the raw `cf`
 * data. Nothing is stored or logged, no cookie is set, and it is never cached
 * anywhere, so one visitor's answer can't reach another.
 *
 * Cloudflare's rate limiter allows 30 answers a minute per connection; past
 * that it answers 429 with no visitor.
 */
export const dynamic = 'force-dynamic'

const HEADERS = {
  'Cache-Control': 'private, no-store, max-age=0',
  'X-Robots-Tag': 'noindex',
}

/** Workers' rate limiting binding (wrangler.jsonc `ratelimits`). */
type Limiter = { limit(options: { key: string }): Promise<{ success: boolean }> }

async function allowed(request: Request): Promise<boolean> {
  let limiter: Limiter | undefined
  try {
    limiter = (getCloudflareContext().env as { WHERE_RATE_LIMIT?: Limiter }).WHERE_RATE_LIMIT
  } catch {
    return true // Not on Workers (next dev, next start): nothing to protect.
  }
  if (!limiter) return true
  // The key only lives in Cloudflare's short-lived counter for this limit.
  const key = request.headers.get('cf-connecting-ip') ?? 'unknown'
  try {
    return (await limiter.limit({ key })).success
  } catch {
    return true
  }
}

export async function GET(request: Request) {
  if (!(await allowed(request))) {
    return Response.json(
      { visitor: null },
      { status: 429, headers: { ...HEADERS, 'Retry-After': '60' } }
    )
  }
  return Response.json({ visitor: visitorFromRequest() }, { headers: HEADERS })
}
