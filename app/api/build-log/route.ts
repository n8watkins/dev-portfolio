import { BUILD_LOG_FEED, FEED_HEADERS, toLogMonths } from '@/lib/buildLog'
import fixture from '@/tests/fixtures/build-log-months.json'

/**
 * The n8builds.dev build log's months, read from its public JSON on the server
 * and cached for an hour (n8builds.dev regenerates it about as often). Same
 * origin for the bento's card, and one fetch an hour however busy the site is.
 * On any failure it answers no months, and the card shows its plain link.
 */

export const revalidate = 3600

export async function GET() {
  // The E2E suite's months (BUILD_LOG_FIXTURE=1): never the live log.
  if (process.env.BUILD_LOG_FIXTURE === '1') return Response.json({ months: toLogMonths(fixture) })
  try {
    const response = await fetch(BUILD_LOG_FEED, {
      headers: FEED_HEADERS,
      next: { revalidate },
      signal: AbortSignal.timeout(5000),
    })
    if (!response.ok) throw new Error(`build log feed answered ${response.status}`)
    const months = toLogMonths(await response.json())
    if (!months.length) throw new Error('build log feed had no months')
    return Response.json(
      { months },
      { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } }
    )
  } catch {
    return Response.json({ months: [] }, { headers: { 'Cache-Control': 'public, s-maxage=60' } })
  }
}
