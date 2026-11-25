import { getCloudflareContext } from '@opennextjs/cloudflare'
import { visitorAt, type Visitor } from '@/components/ui/BoldMap/geo'

/**
 * Where this request comes from, roughly, for the bold map's line to the
 * visitor. Server only, in a dynamic route.
 *
 * Cloudflare works out an approximate city from the connection and passes it
 * with every request (`request.cf`: latitude, longitude, country). No browser
 * permission, no cookie. Only a point rounded to half a degree (about 35 miles)
 * and the name of a listed place near it go to the page; nothing is stored or
 * logged.
 *
 * Off Cloudflare (`next dev`, `next start`, the Playwright build) there is no
 * such data and the map simply draws no line to the visitor.
 */
export function visitorFromRequest(): Visitor | null {
  let cf: Record<string, unknown> | undefined
  try {
    // The sync form: under `next dev` it throws instead of starting a local
    // Workers runtime (the async form would, and invent a location).
    cf = getCloudflareContext().cf as Record<string, unknown> | undefined
  } catch {
    return null
  }
  if (!cf) return null
  const lat = Number(cf.latitude)
  const lng = Number(cf.longitude)
  const country = typeof cf.country === 'string' ? cf.country : null
  if (!country || cf.latitude == null || cf.longitude == null) return null
  return visitorAt(lat, lng, country)
}
