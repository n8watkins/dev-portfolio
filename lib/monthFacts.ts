/**
 * The build log card's months and the facts its readout shows
 * (components/build-log/BuildLogCard.tsx).
 *
 * Shared byte for byte by n8builds.dev (n8watkins/n8builds-web) and the
 * portfolio (n8watkins/dev-portfolio); `npm run check:sync` in the portfolio
 * fails when the two copies differ. Edit it in one repo and copy it to the
 * other in the same change.
 *
 * A month is what n8builds.dev's public feed sends
 * (https://n8builds.dev/builds/months.json): its title, its total and a count
 * per day. Everything else (rank, share of the month, streaks, the busiest
 * day, active days) is worked out from those counts here.
 */

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

/** What a day's count says next to the rest of its month. */
export interface DayFacts {
  /** 1 for the busiest day; days with the same count share a rank. 0 on a quiet day. */
  rank: number
  /** This day's share of the month's changes, in whole percent. */
  share: number
  /** The run of back-to-back days with changes this day is part of: its length, and which day of it this is. */
  run: { length: number; at: number }
}

export interface MonthFacts {
  /** One per day, in order; null for a day still to come. */
  days: (DayFacts | null)[]
  /** Days with at least one change. */
  activeDays: number
  /** The day with the most changes (the first, on a tie), or null in a quiet month. */
  busiest: LogDay | null
  /** The longest run of back-to-back days with changes. */
  longestRun: number
}

export function monthFacts(month: LogMonth): MonthFacts {
  const counts = month.days.filter((d) => !d.future && d.count > 0).map((d) => d.count)
  const total = counts.reduce((a, b) => a + b, 0)
  const runs: { start: number; length: number }[] = []
  month.days.forEach((d, i) => {
    if (d.future || d.count === 0) return
    const last = runs[runs.length - 1]
    if (last && last.start + last.length === i) last.length++
    else runs.push({ start: i, length: 1 })
  })
  const days = month.days.map((d, i) => {
    if (d.future) return null
    const run = runs.find((r) => i >= r.start && i < r.start + r.length)
    return {
      rank: d.count > 0 ? 1 + counts.filter((c) => c > d.count).length : 0,
      share: total ? Math.round((d.count / total) * 100) : 0,
      run: run ? { length: run.length, at: i - run.start + 1 } : { length: 0, at: 0 },
    }
  })
  const busiest = month.days.reduce<LogDay | null>(
    (best, d) => (!d.future && d.count > 0 && (!best || d.count > best.count) ? d : best),
    null
  )
  return {
    days,
    activeDays: counts.length,
    busiest,
    longestRun: Math.max(0, ...runs.map((r) => r.length)),
  }
}
