import { getCloudflareContext } from '@opennextjs/cloudflare'
import { visitorFromRequest } from '@/lib/visitor'
import { asCounters, checkLimit, LIMIT_HEADER, type CounterNamespace } from '@/lib/whereLimit'

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
 * At most 30 answers a minute per connection, counted in a Durable Object
 * (lib/whereLimit.ts); past that it answers 429 with no visitor.
 * `X-RateLimit-State` says whether the limit was checked: ok, limited, absent
 * (no counters) or error (they failed; the route answers anyway).
 */
export const dynamic = 'force-dynamic'

const HEADERS = {
  'Cache-Control': 'private, no-store, max-age=0',
  'X-Robots-Tag': 'noindex',
}

function counters(): CounterNamespace | undefined {
  try {
    return asCounters(
      (getCloudflareContext().env as { RATE_LIMIT_COUNTERS?: unknown }).RATE_LIMIT_COUNTERS
    )
  } catch {
    return undefined // Not on Workers (next dev, next start): nothing to protect.
  }
}

export async function GET(request: Request) {
  // CF-Connecting-IP is set by Cloudflare's edge and can't be spoofed there.
  const state = await checkLimit(counters(), request.headers.get('cf-connecting-ip'))
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
