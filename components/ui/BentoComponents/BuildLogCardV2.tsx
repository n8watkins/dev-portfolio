'use client'

import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { FiArrowUpRight, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { BUILD_LOG_PAGE, type LogDay, type LogMonth } from '@/lib/buildLog'
import { N8BUILDS } from '@/lib/sites'
import { latestEntry } from '@/lib/intersection'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

/** The months move on by themselves this often (owner, 2026-11-09: "give it movement"). */
const AUTO_MS = 5000
/** After an arrow is used, the months hold still this long before moving on again. */
const MANUAL_HOLD_MS = 15000
/** A bar is a stack of up to this many square blocks; the month's busiest day fills it. */
const LEVELS = 10
/** One block and the gap above it, in px (CSS: .log2-fill). LEVELS * PITCH is the tallest bar. */
const PITCH = 5
/** The gap between bars, in px. */
const GAP = 3

// One request per page view; null while it loads, [] when the log can't be read.
let request: Promise<LogMonth[]> | null = null
function loadMonths(): Promise<LogMonth[]> {
  request ??= fetch('/api/build-log')
    .then((response) => (response.ok ? response.json() : { months: [] }))
    .then((body: { months?: LogMonth[] }) => (Array.isArray(body.months) ? body.months : []))
    .catch(() => [])
  return request
}

const date = (day: string, options: Intl.DateTimeFormatOptions) =>
  new Date(`${day}T12:00:00Z`).toLocaleDateString('en-US', { ...options, timeZone: 'UTC' })
const shortDay = (day: string) => date(day, { month: 'short', day: 'numeric' })
const weekdayDay = (day: string) => date(day, { weekday: 'short', month: 'short', day: 'numeric' })
const longDay = (day: string) => date(day, { weekday: 'long', month: 'long', day: 'numeric' })
const plural = (n: number, one: string, many: string) => (n === 1 ? one : many)

/** What a day's numbers say next to the rest of its month: all worked out from the log's own counts. */
interface DayFacts {
  /** 1 for the busiest day; days with the same count share a rank. 0 on a quiet day. */
  rank: number
  /** This day's share of the month's changes, in whole percent. */
  share: number
  /** The run of back-to-back days with changes this day is part of: its length, and which day of it this is. */
  run: { length: number; at: number }
}

interface MonthFacts {
  days: (DayFacts | null)[]
  activeDays: number
  busiest: LogDay | null
  longestRun: number
}

function monthFacts(month: LogMonth): MonthFacts {
  const counts = month.days.filter((d) => !d.future && d.count > 0).map((d) => d.count)
  const total = counts.reduce((a, b) => a + b, 0)
  // Runs of back-to-back days with something shipped.
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

/** Counts up or down to `target` over a short ease, so the readout's number rolls rather than pops. */
function useRollingNumber(target: number, still: boolean) {
  const [shown, setShown] = useState(target)
  const from = useRef(target)
  useEffect(() => {
    if (still) return
    const start = from.current
    const began = performance.now()
    let frame = requestAnimationFrame(function tick(now) {
      const t = Math.min(1, (now - began) / 240)
      const value = Math.round(start + (target - start) * (1 - (1 - t) ** 3))
      from.current = value
      setShown(value)
      if (t < 1) frame = requestAnimationFrame(tick)
    })
    return () => cancelAnimationFrame(frame)
  }, [target, still])
  useEffect(() => {
    if (still) from.current = target
  }, [target, still])
  return still ? target : shown
}

/** A small tag in the readout. */
function Chip({ children, hot }: { children: ReactNode; hot?: boolean }) {
  return (
    <span
      className={`inline-flex h-5 shrink-0 items-center rounded-[3px] px-1.5 font-mono text-[0.62rem] tracking-wide whitespace-nowrap uppercase ${
        hot
          ? 'bg-cyan-300/15 text-cyan-200 ring-1 ring-cyan-300/40'
          : 'bg-white/6 text-slate-300 ring-1 ring-white/10'
      }`}
    >
      {children}
    </span>
  )
}

/** The card's two links: plain text, an underline that draws in from the left, and an arrow that nudges. */
function FooterLink({
  href,
  children,
  extra,
}: {
  href: string
  children: ReactNode
  extra: string
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group/link -mx-1 -my-0.5 inline-flex items-center gap-1 rounded-sm px-1 py-0.5 text-sm font-semibold text-slate-200 transition-colors hover:text-sky-200 focus:outline-hidden focus-visible:text-sky-200 focus-visible:ring-2 focus-visible:ring-sky-400"
    >
      <span className="relative">
        {children}
        <span
          aria-hidden="true"
          className="log2-underline absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-sky-300 to-cyan-300"
        />
      </span>
      <FiArrowUpRight
        aria-hidden="true"
        className="h-3.5 w-3.5 text-slate-400 transition-[transform,color] duration-200 group-hover/link:text-sky-200 group-focus-visible/link:text-sky-200 motion-safe:group-hover/link:translate-x-0.5 motion-safe:group-hover/link:-translate-y-0.5 motion-safe:group-focus-visible/link:translate-x-0.5 motion-safe:group-focus-visible/link:-translate-y-0.5"
      />
      <span className="sr-only">{extra} (opens in a new tab)</span>
    </a>
  )
}

const MONTH_ARROW =
  'flex h-8 w-8 items-center justify-center text-slate-300 transition-colors hover:bg-white/8 hover:text-sky-200 focus:outline-hidden focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-sky-400'

/**
 * A preview of the build log card's next version (owner, 2026-11-25), shown
 * with ?log=2 (BuildLogSwitch.tsx); the live card is BuildLogCard.tsx.
 *
 * The same month of n8builds.dev's build log, with the month arrows top left
 * and the two links as plain text along the bottom. The chart is the
 * difference: each day is a stack of square blocks, and hovering, tapping or
 * arrowing onto a day lights it (its blocks fill bottom to top, it lifts and
 * glows, its neighbours lift a little) while the readout above the chart rolls
 * to that day's numbers. Away from the chart the readout shows the month.
 *
 * The months move on by themselves as before, and hold while the card is
 * hovered or focused, while a day is picked, for 15 seconds after an arrow,
 * off screen, in a hidden tab, and always under reduced motion. Under reduced
 * motion a day still lights up and the readout still changes, with nothing
 * moving.
 */
export default function BuildLogCardV2() {
  const [months, setMonths] = useState<LogMonth[] | null>(null)
  const [index, setIndex] = useState(0)
  const [announce, setAnnounce] = useState('')
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [inView, setInView] = useState(false)
  const [tabVisible, setTabVisible] = useState(true)
  const [manualAt, setManualAt] = useState(0)
  /** The picked day, for the month it was picked in (a new month starts with none). */
  const [picked, setPicked] = useState<{ month: string; day: number; dir: number } | null>(null)
  const reduceMotion = usePrefersReducedMotion()
  const root = useRef<HTMLDivElement>(null)
  const chart = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let live = true
    loadMonths().then((m) => live && setMonths(m))
    return () => {
      live = false
    }
  }, [])

  useEffect(() => {
    const el = root.current
    if (!el) return
    const observer = new IntersectionObserver((entries) =>
      setInView(latestEntry(entries).isIntersecting)
    )
    observer.observe(el)
    const onVisibility = () => setTabVisible(document.visibilityState === 'visible')
    onVisibility()
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  const month = months?.[index]
  const count = months?.length ?? 0
  const active = month && picked?.month === month.id ? picked.day : null
  const exploring = active !== null
  const cycling =
    count > 1 && !reduceMotion && !hovered && !focused && !exploring && inView && tabVisible

  // A tap elsewhere on the page lets go of a day picked by touch.
  useEffect(() => {
    if (!exploring) return
    const onDown = (e: PointerEvent) => {
      if (!chart.current?.contains(e.target as Node)) setPicked(null)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [exploring])

  const lastMove = useRef(0)
  const pausedAt = useRef<number | null>(null)
  useEffect(() => {
    lastMove.current = Date.now()
  }, [index])
  useEffect(() => {
    const now = Date.now()
    if (!cycling) pausedAt.current ??= now
    else {
      if (pausedAt.current !== null && now - pausedAt.current >= 1000) lastMove.current = now
      pausedAt.current = null
    }
  }, [cycling])
  useEffect(() => {
    if (!cycling) return
    const id = setInterval(() => {
      const due = Math.max(lastMove.current + AUTO_MS, manualAt + MANUAL_HOLD_MS)
      if (Date.now() >= due) {
        lastMove.current = Date.now()
        setIndex((i) => (i + 1) % count)
      }
    }, 250)
    return () => clearInterval(id)
  }, [cycling, count, manualAt])
  const step = (by: number) => {
    if (!months) return
    const next = (index + by + count) % count
    setIndex(next)
    setManualAt(Date.now())
    setAnnounce(`${months[next].title}: ${months[next].changes} changes shipped`)
  }

  const facts = useMemo(() => (month ? monthFacts(month) : null), [month])
  const peak = Math.max(1, ...(month?.days.map((d) => d.count) ?? [1]))
  /** The days that can be picked: every day so far (the days still to come are only slots). */
  const lastDay = month ? month.days.findLastIndex((d) => !d.future) : -1

  const pick = (day: number | null) => {
    if (!month) return
    if (day === null) return setPicked(null)
    const i = Math.max(0, Math.min(lastDay, day))
    if (i === active) return
    setPicked({ month: month.id, day: i, dir: active === null || i > active ? 1 : -1 })
  }
  /** The day under a pointer, from its x across the chart (so sweeping anywhere in it works). */
  const dayAt = (clientX: number) => {
    const box = chart.current!.getBoundingClientRect()
    return Math.floor(((clientX - box.left) / box.width) * month!.days.length)
  }
  const focusDay = (i: number) => {
    const target = Math.max(0, Math.min(lastDay, i))
    chart.current?.querySelector<HTMLButtonElement>(`[data-index="${target}"]`)?.focus()
  }

  const day = active !== null && month ? month.days[active] : null
  const dayFacts = active !== null && facts ? facts.days[active] : null
  const number = useRollingNumber(day ? day.count : (month?.changes ?? 0), reduceMotion)
  // The date nudges in from the side the eye is moving to.
  const dateRef = useRef<HTMLSpanElement>(null)
  const dir = picked?.dir ?? 1
  useEffect(() => {
    if (active === null || reduceMotion) return
    dateRef.current?.animate(
      [
        { transform: `translateX(${dir * 3}px)`, opacity: 0.6 },
        { transform: 'none', opacity: 1 },
      ],
      { duration: 180, easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)' }
    )
  }, [active, dir, reduceMotion])
  const inMonth = month?.id === 'recent' ? 'of 30 days' : 'of month'
  // Roving focus: the picked day, or the last day so far.
  const tabStop = active ?? lastDay

  return (
    <div
      ref={root}
      className="relative flex h-full w-full flex-col p-5 sm:p-6 xl:p-6"
      data-build-log={months === null ? 'loading' : count ? 'ready' : 'fallback'}
      data-build-log-version="2"
      data-cycling={cycling ? '' : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={(e) => setFocused(e.target.matches(':focus-visible'))}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false)
      }}
    >
      {count > 0 && month && facts ? (
        <>
          {/* The month arrows, top left, with the month beside them. */}
          <div className="flex items-center gap-3">
            <div className="flex shrink-0 overflow-hidden rounded-lg border border-white/12 bg-white/4">
              <button
                type="button"
                className={MONTH_ARROW}
                onClick={() => step(1)}
                aria-label="Older month"
              >
                <FiChevronLeft className="h-4 w-4" aria-hidden="true" />
              </button>
              <span aria-hidden="true" className="w-px bg-white/12" />
              <button
                type="button"
                className={MONTH_ARROW}
                onClick={() => step(-1)}
                aria-label="Newer month"
              >
                <FiChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <h3
              key={month.id}
              className="log-month-in truncate text-lg font-bold tracking-tight text-slate-50 lg:text-xl"
              data-month
            >
              {month.title}
            </h3>
          </div>

          {/* The readout: the month, or the day being looked at. Screen readers get the same from the bars. */}
          <div key={month.id} className="log-month-in mt-2.5" aria-hidden="true">
            <p className="flex items-baseline gap-2">
              <span
                className={`text-4xl leading-none font-bold tracking-tight tabular-nums transition-colors duration-200 lg:text-[2.6rem] ${
                  day ? 'text-cyan-200' : 'text-slate-50'
                }`}
                data-changes={day ? undefined : ''}
              >
                {number}
              </span>
              {/* Fades in when the readout switches between the month and a day; from day to
                  day the date only nudges, so it stays readable however fast the sweep. */}
              <span
                key={day ? 'day' : 'month'}
                className="log2-swap text-sm font-medium whitespace-nowrap text-slate-300 lg:text-base"
              >
                {day ? (
                  <>
                    {plural(number, 'change', 'changes')} on
                    {/* A margin, not a space: the date's nudge can't close it up. */}
                    <span
                      ref={dateRef}
                      className="ml-1.5 inline-block font-semibold text-slate-100"
                    >
                      {weekdayDay(day.day)}
                    </span>
                  </>
                ) : (
                  plural(month.changes, 'change shipped', 'changes shipped')
                )}
              </span>
            </p>
            <div
              key={day ? 'day' : 'month'}
              // A chip that doesn't fit wraps out of sight, whole, rather than being cut.
              className="log2-swap -mx-px mt-[5px] flex h-[22px] flex-wrap gap-x-1.5 gap-y-2 overflow-hidden p-px"
            >
              {day && dayFacts ? (
                day.count === 0 ? (
                  <Chip>Nothing shipped</Chip>
                ) : (
                  <>
                    <Chip hot={dayFacts.rank === 1}>
                      {dayFacts.rank === 1
                        ? 'Busiest day'
                        : `#${dayFacts.rank} of ${facts.activeDays} days`}
                    </Chip>
                    <Chip>
                      {dayFacts.share < 1 ? '<1' : dayFacts.share}% {inMonth}
                    </Chip>
                    {dayFacts.run.length > 1 && <Chip>{dayFacts.run.length}-day streak</Chip>}
                  </>
                )
              ) : (
                <>
                  {facts.busiest && (
                    <Chip>
                      Peak {shortDay(facts.busiest.day)} · {facts.busiest.count}
                    </Chip>
                  )}
                  <Chip>
                    {facts.activeDays} {plural(facts.activeDays, 'day', 'days')} active
                  </Chip>
                  {facts.longestRun > 1 && <Chip>{facts.longestRun}-day streak</Chip>}
                </>
              )}
            </div>
          </div>
          <p className="sr-only">
            {month.changes} {plural(month.changes, 'change', 'changes')} shipped in {month.title}
            {facts.busiest
              ? `, the busiest day ${longDay(facts.busiest.day)} with ${facts.busiest.count}.`
              : '.'}
          </p>

          {/* The chart: a stack of blocks per day. Sweep, tap or arrow across it. */}
          <div className="mt-auto pt-2">
            <div
              key={month.id}
              ref={chart}
              role="group"
              aria-label={`Changes per day in ${month.title}. Left and right arrow keys move between days.`}
              className="flex touch-pan-y items-end select-none"
              style={{ height: LEVELS * PITCH + 6, gap: GAP }}
              data-chart
              data-bars
              data-exploring={exploring ? '' : undefined}
              onPointerMove={(e) => pick(dayAt(e.clientX))}
              onPointerDown={(e) => pick(dayAt(e.clientX))}
              onPointerLeave={(e) => {
                // A mouse lets go on leaving, unless the keyboard is walking the days.
                const focus = document.activeElement
                const walking = chart.current?.contains(focus) && focus?.matches(':focus-visible')
                if (e.pointerType === 'mouse' && !walking) pick(null)
              }}
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node | null) && !hovered)
                  pick(null)
              }}
              onKeyDown={(e) => {
                const at = active ?? lastDay
                const to =
                  e.key === 'ArrowRight'
                    ? at + 1
                    : e.key === 'ArrowLeft'
                      ? at - 1
                      : e.key === 'Home'
                        ? 0
                        : e.key === 'End'
                          ? lastDay
                          : null
                if (e.key === 'Escape') {
                  pick(null)
                  return
                }
                if (to === null) return
                e.preventDefault()
                focusDay(to)
              }}
            >
              {month.days.map((d, i) => {
                const levels = d.count > 0 ? Math.max(1, Math.round((d.count / peak) * LEVELS)) : 0
                const distance = active === null ? undefined : Math.min(3, Math.abs(i - active))
                if (d.future)
                  return (
                    <span
                      key={d.day}
                      aria-hidden="true"
                      className="flex h-full min-w-0 flex-1 items-end"
                    >
                      <span className="block h-1 w-full rounded-[1px] bg-white/5" />
                    </span>
                  )
                return (
                  <button
                    key={d.day}
                    type="button"
                    tabIndex={i === tabStop ? 0 : -1}
                    aria-label={`${longDay(d.day)}: ${d.count} ${plural(d.count, 'change', 'changes')}${
                      facts.days[i]?.rank === 1 ? ', the busiest day' : ''
                    }`}
                    aria-pressed={i === active}
                    data-index={i}
                    data-d={distance}
                    className="log2-bar group/bar relative flex h-full min-w-0 flex-1 cursor-pointer items-end rounded-[2px] focus:outline-hidden"
                    onFocus={() => pick(i)}
                    onClick={() => pick(i)}
                  >
                    <span aria-hidden="true" className="log2-col" />
                    <span
                      aria-hidden="true"
                      className="log2-stack relative block w-full"
                      style={{ height: Math.max(1, levels) * PITCH - 1 }}
                    >
                      <span
                        className={`log2-fill absolute inset-0 origin-bottom ${
                          levels ? 'log2-fill-on' : 'log2-fill-off'
                        }`}
                        style={{ animationDelay: `${i * 12}ms` }}
                      >
                        {levels > 0 && (
                          <span
                            className="log2-lit absolute inset-0"
                            style={{ '--levels': levels } as CSSProperties}
                          />
                        )}
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>
            <div
              aria-hidden="true"
              className="relative mt-1 flex justify-between pt-1 font-mono text-[0.68rem] leading-4 tracking-wider text-slate-400 uppercase"
            >
              {/* A pixel under the day being looked at, sliding along as the day changes. */}
              {active !== null && (
                <span
                  className="log2-cursor absolute top-0 h-[3px] w-[3px] -translate-x-1/2 bg-cyan-300"
                  style={{
                    left: `calc((100% - ${(month.days.length - 1) * GAP}px) / ${month.days.length} * ${active + 0.5} + ${active * GAP}px)`,
                  }}
                />
              )}
              <span>{shortDay(month.days[0].day)}</span>
              <span>{shortDay(month.days[month.days.length - 1].day)}</span>
            </div>
          </div>
          <p className="sr-only" aria-live="polite">
            {announce}
          </p>
        </>
      ) : months === null ? (
        <div aria-hidden="true" className="flex flex-1 flex-col">
          <div className="h-8 w-1/2 rounded-lg bg-white/4" />
          <div className="mt-3 h-14 w-2/3 rounded-xl bg-white/4" />
          <div className="mt-auto h-16 rounded-xl bg-white/4" />
        </div>
      ) : (
        <div className="flex flex-1 flex-col justify-end">
          <h3 className="text-2xl font-bold tracking-tight text-slate-50">
            What I&apos;m shipping
          </h3>
          <p className="mt-1 text-base text-slate-300">Every change I ship, day by day.</p>
        </div>
      )}

      {/* The two links along the bottom, on one baseline (owner, 2026-11-25). */}
      <div className="mt-2.5 flex items-end justify-between gap-3">
        <div className="flex min-w-0 flex-col items-start">
          <p className="text-[0.7rem] leading-4 text-slate-400">I post everything here</p>
          <FooterLink href={N8BUILDS.url} extra="">
            {N8BUILDS.name}
          </FooterLink>
        </div>
        <FooterLink href={BUILD_LOG_PAGE} extra=" on n8builds.dev">
          Build log
        </FooterLink>
      </div>
    </div>
  )
}
