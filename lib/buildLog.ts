/**
 * The n8builds.dev build log's month summaries, for the bento's build log card
 * (owner, round 4 of 2026-11-09). n8builds.dev publishes them as public JSON
 * (n8builds-web's app/builds/months.json/route.ts): each month's total changes
 * and its changes per day, the same figures as its homepage card, newest month
 * first. This site reads them on its server (app/api/build-log) and caches
 * them for an hour.
 */

export const BUILD_LOG_FEED = 'https://n8builds.dev/builds/months.json'

/**
 * Sent with every server-side fetch of the owner's own feeds. n8builds.dev
 * challenges requests with no User-Agent (a Cloudflare rule since 2026-11-11),
 * which answered the build log with a 403 and left the card empty.
 */
export const FEED_HEADERS = { 'User-Agent': 'n8builds-portfolio (+https://portfolio.n8builds.dev)' }
/** Where the card links: the full build log. */
export const BUILD_LOG_PAGE = 'https://n8builds.dev/builds'

/** One day's bar: what shipped that day. `future`: a day still to come this month. */
export interface LogDay {
  day: string
  count: number
  future?: boolean
}

export interface LogMonth {
  /** `YYYY-MM`, or `recent` for a quiet month's last 30 days. */
  id: string
  /** "November 2026", or "Last 30 days". */
  title: string
  changes: number
  days: LogDay[]
}

const DAY = /^\d{4}-\d{2}-\d{2}$/
const isCount = (n: unknown): n is number => typeof n === 'number' && Number.isInteger(n) && n >= 0

/**
 * The months the feed sends, checked: anything malformed is dropped, so a
 * change on n8builds.dev's side can only make the card fall back, never break
 * it. Newest month first, as sent; at most 12.
 */
export function toLogMonths(feed: unknown): LogMonth[] {
  const { version, months } = (feed ?? {}) as { version?: unknown; months?: unknown }
  if (version !== 1 || !Array.isArray(months)) return []
  const out: LogMonth[] = []
  for (const raw of months.slice(0, 12)) {
    const { id, title, changes, days } = (raw ?? {}) as Record<string, unknown>
    if (
      typeof id !== 'string' ||
      typeof title !== 'string' ||
      !isCount(changes) ||
      !Array.isArray(days)
    )
      continue
    const bars: LogDay[] = []
    for (const d of days) {
      const { day, count, future } = (d ?? {}) as Record<string, unknown>
      if (typeof day !== 'string' || !DAY.test(day) || !isCount(count)) continue
      bars.push(future === true ? { day, count: 0, future: true } : { day, count })
    }
    if (bars.length) out.push({ id, title: title.slice(0, 40), changes, days: bars })
  }
  return out
}
