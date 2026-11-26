import { getCloudflareContext } from '@opennextjs/cloudflare'
import { visitorFromRequest } from '@/lib/visitor'
import { asLimiter, checkLimit, LIMIT_HEADER, type Limiter } from '@/lib/whereLimit'

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
 * that it answers 429 with no visitor. `X-RateLimit-State` says whether the
 * limit was checked: ok, limited, absent (no binding) or error.
 */
export const dynamic = 'force-dynamic'

const HEADERS = {
  'Cache-Control': 'private, no-store, max-age=0',
  'X-Robots-Tag': 'noindex',
}

function limiter(): Limiter | undefined {
  try {
    return asLimiter(
      (getCloudflareContext().env as { WHERE_RATE_LIMIT?: unknown }).WHERE_RATE_LIMIT
    )
  } catch {
    return undefined // Not on Workers (next dev, next start): nothing to protect.
  }
}

export async function GET(request: Request) {
  const state = await checkLimit(limiter(), request.headers.get('cf-connecting-ip'))
  // Says whether the limit was checked (lib/whereLimit.ts); nothing about the visitor.
  const headers = { ...HEADERS, [LIMIT_HEADER]: state }
  if (state === 'limited') {
    return Response.json(
      { visitor: null },
      { status: 429, headers: { ...headers, 'Retry-After': '60' } }
    )
  }
  return Response.json({ visitor: visitorFromRequest() }, { headers })
}
