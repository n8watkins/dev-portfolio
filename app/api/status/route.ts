import { STATUS_FEED, toStatusMap, type StatusMap } from '@/lib/status'

/**
 * The projects' live-demo statuses, read from OpenPing's public feed on the
 * server (it sends no CORS headers, so a browser can't read it directly) and
 * cached for a minute, about as often as OpenPing checks.
 */

export const revalidate = 60

// The E2E suite's statuses (STATUS_FIXTURE=1): one of each kind a visitor can see.
const FIXTURE: StatusMap = {
  Echo: { state: 'operational', uptime90d: 92.914 },
  Scout: { state: 'scheduled_off', uptime90d: 99.46 },
  GeminiGPT: { state: 'down', uptime90d: 81 },
}

export async function GET() {
  if (process.env.STATUS_FIXTURE === '1') return Response.json({ services: FIXTURE })
  try {
    const response = await fetch(STATUS_FEED, { next: { revalidate }, signal: AbortSignal.timeout(5000) })
    if (!response.ok) throw new Error(`status feed answered ${response.status}`)
    return Response.json(
      { services: toStatusMap(await response.json()) },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } },
    )
  } catch {
    // No status beats a wrong one: the pills simply don't show.
    return Response.json({ services: {} }, { headers: { 'Cache-Control': 'public, s-maxage=15' } })
  }
}
