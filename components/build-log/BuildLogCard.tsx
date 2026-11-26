'use client'

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from 'react'
import {
  FiArrowDown,
  FiArrowRight,
  FiArrowUpRight,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi'
import { monthFacts, type LogMonth } from '@/lib/monthFacts'
import { latestEntry } from '@/lib/intersection'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

/*
 * Shared byte for byte by n8builds.dev (n8watkins/n8builds-web) and the
 * portfolio (n8watkins/dev-portfolio), with lib/monthFacts.ts and
 * components/build-log/build-log-card.css; `npm run check:sync` in the
 * portfolio fails when the copies differ. What differs per site comes in as
 * props: where the months come from, the links along the foot, the size, and
 * what a picked day does on the page around the card.
 */

/** The months move on by themselves this often (owner, 2026-11-09: "give it movement"). */
const AUTO_MS = 5000
/** After an arrow is used, the months hold still this long before moving on again. */
const MANUAL_HOLD_MS = 15000
/** How long the readout's number takes to roll to a new value, in ms. */
const ROLL_MS = 240

/**
 * Each size's chart: a bar is a stack of up to `levels` square blocks (the
 * month's busiest day fills it). The block, its pitch (a block and the seam
 * above it) and the gap between bars are CSS variables
 * (`--logcard-block`, `--logcard-pitch`, `--logcard-gap` in
 * build-log-card.css), so a breakpoint can change them.
 */
const LEVELS = { compact: 10, wide: 14 } as const

// One request per page view and source; [] when the log can't be read.
const requests = new Map<string, Promise<LogMonth[]>>()
function loadMonths(src: string): Promise<LogMonth[]> {
  let request = requests.get(src)
  if (!request) {
    request = fetch(src)
      .then((response) => (response.ok ? response.json() : { months: [] }))
      .then((body: { months?: LogMonth[] }) => (Array.isArray(body.months) ? body.months : []))
      .catch(() => [])
    requests.set(src, request)
  }
  return request
}

const date = (day: string, options: Intl.DateTimeFormatOptions) =>
  new Date(`${day}T12:00:00Z`).toLocaleDateString('en-US', { ...options, timeZone: 'UTC' })
const shortDay = (day: string) => date(day, { month: 'short', day: 'numeric' })
const weekdayDay = (day: string) => date(day, { weekday: 'short', month: 'short', day: 'numeric' })
const longDay = (day: string) => date(day, { weekday: 'long', month: 'long', day: 'numeric' })
const plural = (n: number, one: string, many: string) => (n === 1 ? one : many)

/**
 * Counts up or down to `target` over a short ease, so the readout's number
 * rolls rather than pops.
 *
 * The roll's progress is read from the clock, not from the frame's own
 * timestamp: WebKit stamps a frame with the moment it began, which can come
 * before the key press that started the roll, and the number then ran the
 * wrong way first (9 to 49 by way of 5). And the final value lands on a timer
 * too, so the number always settles even when no frame comes: a hidden tab,
 * or a page too busy to paint (WebKit on CI went seconds without one,
 * 2026-11-25, and the number stayed mid-roll).
 */
function useRollingNumber(target: number, still: boolean) {
  const [shown, setShown] = useState(target)
  const from = useRef(target)
  useEffect(() => {
    if (still) return
    const start = from.current
    const began = performance.now()
    const show = (value: number) => {
      from.current = value
      setShown(value)
    }
    let frame = requestAnimationFrame(function tick() {
      const t = Math.min(1, Math.max(0, (performance.now() - began) / ROLL_MS))
      show(Math.round(start + (target - start) * (1 - (1 - t) ** 3)))
      if (t < 1) frame = requestAnimationFrame(tick)
    })
    const settle = setTimeout(() => {
      cancelAnimationFrame(frame)
      show(target)
    }, ROLL_MS + 60)
    return () => {
      cancelAnimationFrame(frame)
      clearTimeout(settle)
    }
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

/** A link (or a button, with `onClick`) along the card's foot. */
export interface CardLink {
  label: string
  /** Where it goes. An outside address opens in a new tab with `external`. */
  href?: string
  /** In place of `href`: what it does on this page. */
  onClick?: () => void
  external?: boolean
  /** A small line above the link ("I post everything here"). */
  note?: string
  /** Said after the label to screen readers only (" on n8builds.dev"). */
  srExtra?: string
  /** Its arrow: out (a new tab, the default for `external`), on (this site) or down (this page). */
  arrow?: 'out' | 'on' | 'down'
}

const ARROWS = { out: FiArrowUpRight, on: FiArrowRight, down: FiArrowDown }
const ARROW_MOVE = {
  out: 'motion-safe:group-hover/link:translate-x-0.5 motion-safe:group-hover/link:-translate-y-0.5 motion-safe:group-focus-visible/link:translate-x-0.5 motion-safe:group-focus-visible/link:-translate-y-0.5',
  on: 'motion-safe:group-hover/link:translate-x-0.5 motion-safe:group-focus-visible/link:translate-x-0.5',
  down: 'motion-safe:group-hover/link:translate-y-0.5 motion-safe:group-focus-visible/link:translate-y-0.5',
}

/** The card's links: plain text, an underline that draws in from the left, and an arrow that nudges. */
function FooterLink({ link }: { link: CardLink }) {
  const arrow = link.arrow ?? (link.external ? 'out' : 'on')
  const Arrow = ARROWS[arrow]
  const className =
    'group/link -mx-1 -my-0.5 inline-flex cursor-pointer items-center gap-1 rounded-sm px-1 py-0.5 text-sm font-semibold text-slate-200 transition-colors hover:text-sky-200 focus:outline-hidden focus-visible:text-sky-200 focus-visible:ring-2 focus-visible:ring-sky-400'
  const inner = (
    <>
      <span className="relative whitespace-nowrap">
        {link.label}
        <span
          aria-hidden="true"
          className="logcard-underline absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-sky-300 to-cyan-300"
        />
      </span>
      <Arrow
        aria-hidden="true"
        className={`h-3.5 w-3.5 shrink-0 text-slate-400 transition-[transform,color] duration-200 group-hover/link:text-sky-200 group-focus-visible/link:text-sky-200 ${ARROW_MOVE[arrow]}`}
      />
      {link.srExtra || link.external ? (
        <span className="sr-only">
          {link.srExtra}
          {link.external ? ' (opens in a new tab)' : ''}
        </span>
      ) : null}
    </>
  )
  if (!link.href)
    return (
      <button type="button" onClick={link.onClick} className={className} data-logcard-keep>
        {inner}
      </button>
    )
  return link.external ? (
    <a href={link.href} target="_blank" rel="noopener noreferrer" className={className}>
      {inner}
    </a>
  ) : (
    <a href={link.href} className={className} onClick={link.onClick}>
      {inner}
    </a>
  )
}

const MONTH_ARROW =
  'flex h-8 w-8 items-center justify-center text-slate-300 transition-colors hover:bg-white/8 hover:text-sky-200 focus:outline-hidden focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-sky-400'

export interface BuildLogCardProps {
  /**
   * The months, newest first, when the page already has them (n8builds.dev,
   * from its own log). Left out, the card fetches `src` once it mounts.
   */
  months?: LogMonth[]
  /** Where to fetch `{ months }` from when `months` is left out. */
  src?: string
  /** The links along the foot, left and right. Either can be left out. */
  links?: { left?: CardLink; right?: CardLink }
  /** `compact` for a card in a grid; `wide` leads a page, chart beside the readout from 1024px. */
  size?: 'compact' | 'wide'
  /** The month's heading level: h3 in a section, h2 where the card leads a page. */
  heading?: 'h2' | 'h3'
  /** Whether the months move on by themselves (still never under reduced motion). */
  cycle?: boolean
  /** The month shown, when the page holds it (it shows that month's changes beside the card). */
  index?: number
  onIndexChange?: (index: number) => void
  /** The day being looked at (`YYYY-MM-DD`), or null; on every hover, tap and key. */
  onDayChange?: (day: string | null) => void
  /** A day clicked with a mouse or pen, or pressed with Enter or Space (never a tap: a tap only looks). */
  onDayClick?: (day: string) => void
}

/**
 * The build log card (portfolio, round 4 of 2026-11-09; reworked 2026-11-25;
 * on n8builds.dev too since 2026-11-25): a month of n8builds.dev's build log.
 * The month arrows sit top left with the month beside them; plain text links
 * along the bottom.
 *
 * The readout shows the month's changes, its busiest day, its active days and
 * its longest streak. Each day is a stack of square blocks; hovering, tapping
 * or arrowing onto a day (Left, Right, Home, End; Escape lets go) lights it:
 * its blocks fill bottom to top, it lifts and glows, its neighbours lean in, a
 * pixel marks it under the chart, and the readout rolls to that day's count,
 * date, rank, share of the month and streak. A tap elsewhere lets go on a
 * phone. Each day is a button named with its date and count for screen readers.
 *
 * With `cycle`, the months move on by themselves, this month first and then
 * back through the months, one every 5 seconds. They hold while the card is
 * hovered or has keyboard focus, while a day is picked, for 15 seconds after
 * an arrow, off screen, in a hidden tab, and always under reduced motion (WCAG
 * 2.2.2), where a day still lights up and the readout still changes but
 * nothing moves. Only a month picked with the arrows is announced.
 *
 * While the months load, the card holds its final layout; if they can't be
 * read, it is a plain card with its links.
 */
export default function BuildLogCard({
  months: given,
  src = '/api/build-log',
  links,
  size = 'compact',
  heading = 'h3',
  cycle = true,
  index: heldIndex,
  onIndexChange,
  onDayChange,
  onDayClick,
}: BuildLogCardProps) {
  const [loaded, setLoaded] = useState<LogMonth[] | null>(null)
  const months = given ?? loaded
  const [ownIndex, setOwnIndex] = useState(0)
  const index = Math.min(heldIndex ?? ownIndex, Math.max(0, (months?.length ?? 1) - 1))
  const [announce, setAnnounce] = useState('')
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [inView, setInView] = useState(false)
  const [tabVisible, setTabVisible] = useState(
    () => typeof document === 'undefined' || document.visibilityState === 'visible'
  )
  const [manualAt, setManualAt] = useState(0)
  /** The picked day, for the month it was picked in (a new month starts with none). */
  const [picked, setPicked] = useState<{ month: string; day: number; dir: number } | null>(null)
  const reduceMotion = usePrefersReducedMotion()
  const root = useRef<HTMLDivElement>(null)
  const chart = useRef<HTMLDivElement>(null)
  /** How the last press on the chart came: a tap only looks at a day, it never clicks it. */
  const lastPointer = useRef('')
  const Heading = heading
  const wide = size === 'wide'
  const levels = LEVELS[size]

  useEffect(() => {
    if (given) return
    let live = true
    loadMonths(src).then((m) => live && setLoaded(m))
    return () => {
      live = false
    }
  }, [given, src])

  useEffect(() => {
    const el = root.current
    if (!el) return
    const observer = new IntersectionObserver((entries) =>
      setInView(latestEntry(entries).isIntersecting)
    )
    observer.observe(el)
    const onVisibility = () => setTabVisible(document.visibilityState === 'visible')
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
    cycle &&
    count > 1 &&
    !reduceMotion &&
    !hovered &&
    !focused &&
    !exploring &&
    inView &&
    tabVisible

  const indexRef = useRef(index)
  const onIndexRef = useRef(onIndexChange)
  useEffect(() => {
    indexRef.current = index
    onIndexRef.current = onIndexChange
  })
  const show = (next: number) => {
    if (heldIndex === undefined) setOwnIndex(next)
    onIndexRef.current?.(next)
  }

  // A tap elsewhere on the page lets go of a day picked by touch (but not a
  // tap on the card's own day link, which acts on that day).
  useEffect(() => {
    if (!exploring) return
    const onDown = (e: PointerEvent) => {
      const target = e.target as Element
      if (!chart.current?.contains(target) && !target.closest?.('[data-logcard-keep]'))
        setPicked(null)
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
        const next = (indexRef.current + 1) % count
        if (heldIndex === undefined) setOwnIndex(next)
        onIndexRef.current?.(next)
      }
    }, 250)
    return () => clearInterval(id)
  }, [cycling, count, manualAt, heldIndex])
  const step = (by: number) => {
    if (!months) return
    const next = (index + by + count) % count
    show(next)
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
  // The page hears of the day being looked at.
  const lookedAt = day?.day ?? null
  const onDayRef = useRef(onDayChange)
  useEffect(() => {
    onDayRef.current = onDayChange
  })
  useEffect(() => {
    onDayRef.current?.(lookedAt)
  }, [lookedAt])
  const clickDay = (e: MouseEvent, i: number) => {
    pick(i)
    // A keyboard press has no pointer behind it (detail 0); a tap only looks.
    if (onDayClick && month && (e.detail === 0 || lastPointer.current !== 'touch'))
      onDayClick(month.days[i].day)
  }
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
  const ready = count > 0 && month && facts
  // Wide and loaded: from 1024px the chart takes the right, beside the readout.
  const grid = wide && ready

  const footer =
    links?.left || links?.right ? (
      <div
        className={`mt-2.5 flex items-end justify-between gap-3 ${
          grid ? 'lg:col-start-1 lg:row-start-3 lg:justify-start lg:self-end lg:gap-8' : ''
        }`}
      >
        {links.left ? (
          <div className="flex min-w-0 flex-col items-start">
            {links.left.note && (
              <p className="text-[0.7rem] leading-4 text-slate-400">{links.left.note}</p>
            )}
            <FooterLink link={links.left} />
          </div>
        ) : (
          <span />
        )}
        {links.right && <FooterLink link={links.right} />}
      </div>
    ) : null

  return (
    <div
      ref={root}
      className={`logcard relative h-full w-full p-5 sm:p-6 ${
        grid
          ? 'flex flex-col lg:grid lg:grid-cols-[minmax(17rem,22rem)_minmax(0,1fr)] lg:grid-rows-[auto_auto_1fr] lg:gap-x-10 lg:p-7'
          : 'flex flex-col'
      }`}
      style={{ '--logcard-levels': levels } as CSSProperties}
      data-build-log={months === null ? 'loading' : count ? 'ready' : 'fallback'}
      data-size={size}
      data-cycling={cycling ? '' : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={(e) => setFocused(e.target.matches(':focus-visible'))}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false)
      }}
    >
      {ready ? (
        <>
          {/* The month arrows, top left, with the month beside them. */}
          <div className={`flex items-center gap-3 ${grid ? 'lg:col-start-1 lg:row-start-1' : ''}`}>
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
            <Heading
              key={month.id}
              className={`logcard-month-in truncate font-bold tracking-tight text-slate-50 ${
                wide ? 'text-xl lg:text-2xl' : 'text-lg lg:text-xl'
              }`}
              data-month
            >
              {month.title}
            </Heading>
          </div>

          {/* The readout: the month, or the day being looked at. Screen readers get the same from the bars. */}
          <div
            key={month.id}
            className={`logcard-month-in mt-2.5 ${grid ? 'lg:col-start-1 lg:row-start-2 lg:mt-4' : ''}`}
            aria-hidden="true"
            data-readout
          >
            <p className="flex items-baseline gap-2">
              <span
                className={`leading-none font-bold tracking-tight tabular-nums transition-colors duration-200 ${
                  wide ? 'text-4xl sm:text-5xl' : 'text-4xl lg:text-[2.6rem]'
                } ${day ? 'text-cyan-200' : 'text-slate-50'}`}
                data-number
                data-changes={day ? undefined : ''}
              >
                {number}
              </span>
              {/* Fades in when the readout switches between the month and a day; from day to
                  day the date only nudges, so it stays readable however fast the sweep. */}
              <span
                key={day ? 'day' : 'month'}
                className="logcard-swap text-sm font-medium whitespace-nowrap text-slate-300 lg:text-base"
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
              className="logcard-swap -mx-px mt-[5px] flex h-[22px] flex-wrap gap-x-1.5 gap-y-2 overflow-hidden p-px"
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
          <div
            className={`mt-auto pt-2 ${
              grid ? 'lg:col-start-2 lg:row-span-3 lg:row-start-1 lg:self-end lg:pt-0' : ''
            }`}
          >
            <div
              key={month.id}
              ref={chart}
              role="group"
              aria-label={`Changes per day in ${month.title}. Left and right arrow keys move between days.`}
              className="logcard-chart flex touch-pan-y items-end select-none"
              data-chart
              data-bars
              data-exploring={exploring ? '' : undefined}
              onPointerMove={(e) => pick(dayAt(e.clientX))}
              onPointerDown={(e) => {
                lastPointer.current = e.pointerType
                pick(dayAt(e.clientX))
              }}
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
                const blocks = d.count > 0 ? Math.max(1, Math.round((d.count / peak) * levels)) : 0
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
                    data-day={d.day}
                    data-d={distance}
                    className="logcard-day relative flex h-full min-w-0 flex-1 cursor-pointer items-end rounded-[2px] focus:outline-hidden"
                    onFocus={() => pick(i)}
                    onClick={(e) => clickDay(e, i)}
                  >
                    <span aria-hidden="true" className="logcard-col" />
                    <span
                      aria-hidden="true"
                      className="logcard-stack relative block w-full"
                      style={{ '--logcard-n': Math.max(1, blocks) } as CSSProperties}
                    >
                      <span
                        className={`logcard-fill absolute inset-0 origin-bottom ${
                          blocks ? 'logcard-fill-on' : 'logcard-fill-off'
                        }`}
                        style={{ animationDelay: `${i * 12}ms` }}
                      >
                        {blocks > 0 && (
                          <span
                            className="logcard-lit absolute inset-0"
                            style={{ '--levels': blocks } as CSSProperties}
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
                  className="logcard-cursor absolute top-0 h-[3px] w-[3px] -translate-x-1/2 bg-cyan-300"
                  style={{
                    left: `calc((100% - ${month.days.length - 1} * var(--logcard-gap)) / ${month.days.length} * ${active + 0.5} + ${active} * var(--logcard-gap))`,
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
          <Heading className="text-2xl font-bold tracking-tight text-slate-50">
            What I&apos;m shipping
          </Heading>
          <p className="mt-1 text-base text-slate-300">Every change I ship, day by day.</p>
        </div>
      )}

      {/* The links along the bottom, on one baseline (owner, 2026-11-25). */}
      {footer}
    </div>
  )
}
