'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { FiArrowUpRight, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { BUILD_LOG_PAGE, type LogMonth } from '@/lib/buildLog'
import { N8BUILDS } from '@/lib/sites'

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

const ARROW =
  'relative z-20 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/12 bg-white/4 text-slate-300 transition-colors hover:border-sky-400/50 hover:bg-white/10 hover:text-sky-200 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-400'

/**
 * The bento's build log card (owner, round 4 of 2026-11-09): a month of
 * n8builds.dev's build log at a glance, live from its public JSON
 * (lib/buildLog.ts). The month, how many changes shipped, and a bar per day
 * (the days still to come as faint slots). The arrows step back through the
 * months and round again; the rest of the card links to the full build log.
 *
 * While the months load, the card holds its final layout, so nothing shifts;
 * if they can't be read, it is a plain link to the build log.
 */
export default function BuildLogCard() {
  const [months, setMonths] = useState<LogMonth[] | null>(null)
  const [index, setIndex] = useState(0)
  const [announce, setAnnounce] = useState('')

  useEffect(() => {
    let live = true
    loadMonths().then((m) => live && setMonths(m))
    return () => {
      live = false
    }
  }, [])

  const month = months?.[index]
  const count = months?.length ?? 0
  // Older is one step on in the list (newest first); both ends go round.
  const step = (by: number) => {
    if (!months) return
    const next = (index + by + count) % count
    setIndex(next)
    setAnnounce(`${months[next].title}: ${months[next].changes} changes shipped`)
  }
  const peak = Math.max(1, ...(month?.days.map((d) => d.count) ?? [1]))

  return (
    <div
      className="relative flex h-full w-full flex-col p-5 sm:p-6 xl:p-6"
      data-build-log={months === null ? 'loading' : count ? 'ready' : 'fallback'}
    >
      {/* The whole card links to the build log; the arrows sit above this layer. */}
      <a
        href={BUILD_LOG_PAGE}
        target="_blank"
        rel="noopener noreferrer"
        className="peer absolute inset-0 z-10 rounded-3xl focus:outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-400"
      >
        <span className="sr-only">The full build log on n8builds.dev (opens in a new tab)</span>
      </a>

      <p className="flex items-center gap-2 text-sm font-semibold text-slate-300">
        <Image
          src={N8BUILDS.icon}
          alt=""
          width={20}
          height={20}
          className="h-5 w-5 rounded-md ring-1 ring-white/10"
        />
        Build log
        <FiArrowUpRight
          aria-hidden="true"
          className="ml-auto h-5 w-5 text-slate-400 transition-[color,transform] duration-200 group-has-[a.peer:hover]:-translate-y-0.5 group-has-[a.peer:hover]:translate-x-0.5 group-has-[a.peer:hover]:text-sky-300"
        />
      </p>

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
              className="truncate text-center text-xl font-bold tracking-tight text-slate-50 lg:text-2xl"
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

          <p className="mt-3 flex items-baseline gap-2">
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
