'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { FiArrowUpRight, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { BUILD_LOG_PAGE, type LogMonth } from '@/lib/buildLog'
import { N8BUILDS } from '@/lib/sites'
import { latestEntry } from '@/lib/intersection'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

/** The months move on by themselves this often (owner, 2026-11-09: "give it movement"). */
const AUTO_MS = 5000
/** After an arrow is used, the months hold still this long before moving on again. */
const MANUAL_HOLD_MS = 15000

// One request per page view; null while it loads, [] when the log can't be read.
let request: Promise<LogMonth[]> | null = null
function loadMonths(): Promise<LogMonth[]> {
  request ??= fetch('/api/build-log')
    .then((response) => (response.ok ? response.json() : { months: [] }))
    .then((body: { months?: LogMonth[] }) => (Array.isArray(body.months) ? body.months : []))
    .catch(() => [])
  return request
}

const shortDay = (day: string) =>
  new Date(`${day}T12:00:00Z`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })

/** The card's two links: a clear pill that lights up sky on hover. */
const LINK =
  'group/link inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/4 px-2.5 py-1.5 text-sm font-semibold text-slate-200 underline-offset-4 transition-colors hover:border-sky-400/60 hover:bg-sky-400/10 hover:text-sky-200 hover:underline focus:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-400'

const ARROW =
  'relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/12 bg-white/4 text-slate-300 transition-colors hover:border-sky-400/50 hover:bg-white/10 hover:text-sky-200 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-400'

/**
 * The bento's build log card (owner, round 4 of 2026-11-09): a month of
 * n8builds.dev's build log at a glance, live from its public JSON
 * (lib/buildLog.ts). The month, how many changes shipped, and a bar per day
 * (the days still to come as faint slots). The arrows step back through the
 * months and round again. On top, "n8builds.dev" opens the site and "Build
 * log" the full build log; the rest of the card is not a link.
 *
 * The months also move on by themselves (owner, 2026-11-09): this month first,
 * then back through the months with something shipped, round again, one every
 * 5 seconds with a short fade. They hold still while the card is hovered or
 * has keyboard focus, for 15 seconds after an arrow is used, while the card is
 * off screen or the tab is hidden, and always under reduced motion (WCAG
 * 2.2.2). Only a month picked with the arrows is announced.
 *
 * While the months load, the card holds its final layout, so nothing shifts;
 * if they can't be read, it is a plain link to the build log.
 */
export default function BuildLogCard() {
  const [months, setMonths] = useState<LogMonth[] | null>(null)
  const [index, setIndex] = useState(0)
  const [announce, setAnnounce] = useState('')
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [inView, setInView] = useState(false)
  const [tabVisible, setTabVisible] = useState(true)
  /** When an arrow was last used (ms since the epoch); the months hold until MANUAL_HOLD_MS after it. */
  const [manualAt, setManualAt] = useState(0)
  const reduceMotion = usePrefersReducedMotion()
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let live = true
    loadMonths().then((m) => live && setMonths(m))
    return () => {
      live = false
    }
  }, [])

  // On screen, and the tab shown: the only times the months may move on.
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
  const cycling = count > 1 && !reduceMotion && !hovered && !focused && inView && tabVisible

  // When the month last changed, and when the months last stopped moving on (null: moving).
  const lastMove = useRef(0)
  const pausedAt = useRef<number | null>(null)
  useEffect(() => {
    lastMove.current = Date.now()
  }, [index])
  // A real pause (a second or more: a hover, a scroll away) starts the 5 s over when it ends;
  // a blip (the pointer crossing a corner) doesn't, so the months still move on.
  useEffect(() => {
    const now = Date.now()
    if (!cycling) pausedAt.current ??= now
    else {
      if (pausedAt.current !== null && now - pausedAt.current >= 1000) lastMove.current = now
      pausedAt.current = null
    }
  }, [cycling])
  // The next month AUTO_MS after the last change, and not before the hold after an arrow is over.
  // A short tick checks the time rather than one long timer, so a busy page can't lose the move.
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
  // Older is one step on in the list (newest first); both ends go round.
  const step = (by: number) => {
    if (!months) return
    const next = (index + by + count) % count
    setIndex(next)
    setManualAt(Date.now())
    setAnnounce(`${months[next].title}: ${months[next].changes} changes shipped`)
  }
  const peak = Math.max(1, ...(month?.days.map((d) => d.count) ?? [1]))

  return (
    <div
      ref={root}
      className="relative flex h-full w-full flex-col p-5 sm:p-6 xl:p-6"
      data-build-log={months === null ? 'loading' : count ? 'ready' : 'fallback'}
      data-cycling={cycling ? '' : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      // Keyboard focus holds it; a click on an arrow doesn't (its own hold covers that).
      onFocus={(e) => setFocused(e.target.matches(':focus-visible'))}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false)
      }}
    >
      {/* Two plain links on top (owner, round 5 of 2026-11-09): the site on the
          left, the build log on the right. The rest of the card is not a link. */}
      <div className="flex items-center justify-between gap-2">
        <a href={N8BUILDS.url} target="_blank" rel="noopener noreferrer" className={LINK}>
          <Image
            src={N8BUILDS.icon}
            alt=""
            width={20}
            height={20}
            className="h-5 w-5 rounded-md ring-1 ring-white/10"
          />
          {N8BUILDS.name}
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
        <a href={BUILD_LOG_PAGE} target="_blank" rel="noopener noreferrer" className={LINK}>
          Build log
          <FiArrowUpRight
            aria-hidden="true"
            className="h-4 w-4 transition-transform duration-200 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5"
          />
          <span className="sr-only"> on n8builds.dev (opens in a new tab)</span>
        </a>
      </div>

      {count > 0 && month ? (
        <>
          <div className="mt-3 flex items-center justify-between gap-2">
            <button
              type="button"
              className={ARROW}
              onClick={() => step(1)}
              aria-label="Older month"
            >
              <FiChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <h3
              key={month.id}
              className="log-month-in truncate text-center text-xl font-bold tracking-tight text-slate-50 lg:text-2xl"
              data-month
            >
              {month.title}
            </h3>
            <button
              type="button"
              className={ARROW}
              onClick={() => step(-1)}
              aria-label="Newer month"
            >
              <FiChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <p key={month.id} className="log-month-in mt-3 flex items-baseline gap-2">
            <span
              className="text-5xl font-bold tracking-tight text-slate-50 tabular-nums"
              data-changes
            >
              {month.changes}
            </span>
            <span className="text-base font-medium text-slate-300">
              {month.changes === 1 ? 'change shipped' : 'changes shipped'}
            </span>
          </p>

          <div className="mt-auto pt-4">
            <div
              key={month.id}
              role="img"
              aria-label={`Changes per day in ${month.title}`}
              className="flex h-14 items-end gap-[2px]"
              data-bars
            >
              {month.days.map((d, i) => (
                <span
                  key={d.day}
                  title={d.future ? undefined : `${shortDay(d.day)}: ${d.count}`}
                  className={`log-bar min-w-0 flex-1 origin-bottom rounded-[2px] ${
                    d.future
                      ? 'bg-white/5'
                      : d.count > 0
                        ? 'bg-linear-to-t from-sky-600/80 to-sky-300'
                        : 'bg-white/12'
                  }`}
                  style={{
                    height: d.count > 0 ? `${Math.max(14, (d.count / peak) * 100)}%` : '3px',
                    animationDelay: `${i * 12}ms`,
                  }}
                />
              ))}
            </div>
            <div
              aria-hidden="true"
              className="mt-1.5 flex justify-between font-mono text-[0.68rem] tracking-wider text-slate-400 uppercase"
            >
              <span>{shortDay(month.days[0].day)}</span>
              <span>{shortDay(month.days[month.days.length - 1].day)}</span>
            </div>
          </div>
          <p className="sr-only" aria-live="polite">
            {announce}
          </p>
        </>
      ) : months === null ? (
        // Loading: the same shape, quietly, so the card doesn't jump when the months arrive.
        <div aria-hidden="true" className="flex flex-1 flex-col">
          <div className="mt-3 h-9 rounded-xl bg-white/4" />
          <div className="mt-3 h-12 w-2/3 rounded-xl bg-white/4" />
          <div className="mt-auto h-14 rounded-xl bg-white/4" />
        </div>
      ) : (
        // The log can't be read: the card is a plain way to it.
        <div className="flex flex-1 flex-col justify-end">
          <h3 className="text-2xl font-bold tracking-tight text-slate-50">
            What I&apos;m shipping
          </h3>
          <p className="mt-1 text-base text-slate-300">
            Every change, day by day, on n8builds.dev.
          </p>
        </div>
      )}
    </div>
  )
}
