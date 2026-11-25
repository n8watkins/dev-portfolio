'use client'

import Image from 'next/image'
import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { latestEntry } from '@/lib/intersection'
import { createMapEngine } from './engine'
import { formatMiles, type Visitor } from './geo'

const MONO = 'font-mono font-semibold leading-none whitespace-nowrap'
const TAG = `${MONO} pointer-events-none absolute top-0 left-0 opacity-0 data-[on]:opacity-100 [&_em]:not-italic [&_em]:text-[#7dd3fc]`

/** What the map says, for screen readers (the map itself is decorative). */
export function boldMapText(visitor: Visitor | null) {
  const base =
    'A map of the United States: Nathan is in Los Angeles, California, and open to relocating anywhere.'
  if (visitor?.kind === 'us') {
    const near = visitor.near ? `near ${visitor.near}, ` : ''
    return `${base} You seem to be ${near}about ${formatMiles(visitor.mi)} miles away.`
  }
  if (visitor?.kind === 'here') return `${base} You seem to be in the Los Angeles area too.`
  return base
}

/**
 * The bold 3D map of the "Ready to relocate" card: the site's lit grid raised
 * into the country's real terrain, with routes traced from Los Angeles and,
 * for a visitor in the lower 48, a line to them.
 *
 * It fills its parent (which sets the size, so nothing shifts), runs only on
 * screen in a visible tab, and is drawn once and held still under reduced
 * motion. `visitor` comes from the server, coarse (see geo.ts).
 */
export default function BoldMap({ visitor }: { visitor: Visitor | null }) {
  const still = usePrefersReducedMotion()
  const card = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const pin = useRef<HTMLSpanElement>(null)
  const chip = useRef<HTMLSpanElement>(null)
  const you = useRef<HTMLSpanElement>(null)
  const label = useRef<HTMLSpanElement>(null)
  const visitorKey = JSON.stringify(visitor)

  useEffect(() => {
    const root = card.current
    const host = stage.current
    if (!root || !host || !pin.current || !chip.current || !you.current || !label.current) return
    // A fresh canvas per engine: a canvas keeps the first kind of context it was asked for.
    const canvas = document.createElement('canvas')
    canvas.className = 'absolute inset-0 h-full w-full'
    canvas.setAttribute('aria-hidden', 'true')
    host.replaceChildren(canvas)
    const engine = createMapEngine(
      {
        card: root,
        canvas,
        pin: pin.current,
        chip: chip.current,
        you: you.current,
        label: label.current,
      },
      { visitor: JSON.parse(visitorKey) as Visitor | null, still }
    )
    root.dataset.ready = 'true'

    let onScreen = false
    const update = () => engine.setActive(onScreen && document.visibilityState === 'visible')
    const io = new IntersectionObserver((entries) => {
      onScreen = latestEntry(entries).isIntersecting
      update()
    })
    io.observe(root)
    document.addEventListener('visibilitychange', update)
    let frame = 0
    const ro = new ResizeObserver(() => {
      // One re-fit per frame, however many sizes a resize passes through.
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => engine.resize())
    })
    ro.observe(root)
    return () => {
      cancelAnimationFrame(frame)
      ro.disconnect()
      io.disconnect()
      document.removeEventListener('visibilitychange', update)
      engine.destroy()
      canvas.remove()
      delete root.dataset.ready
    }
  }, [still, visitorKey])

  return (
    <div
      ref={card}
      data-bold-map
      className="group/map absolute inset-0 touch-pan-y overflow-hidden bg-[#0b1b36] select-none @container"
    >
      <p className="sr-only">{boldMapText(visitor)}</p>
      <div aria-hidden="true">
        <div ref={stage} className="absolute inset-0" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[40%] bg-linear-to-t from-[#0d304c] from-24% via-[#0d304c]/72 via-46% to-[#0d304c]/0" />
        <span
          className={`${MONO} pointer-events-none absolute top-[18px] left-5 text-[10px] tracking-[0.16em] text-[#7dd3fc] @min-[400px]:left-[22px] @min-[400px]:text-[11px]`}
        >
          LOS ANGELES · <b className="font-bold text-[#e0f2fe]">OPEN TO ANYWHERE</b>
        </span>
        {/* Placed by the engine; hidden until it has placed them. */}
        <div className="opacity-0 transition-opacity duration-300 group-data-[ready]/map:opacity-100">
          <span ref={pin} className="pointer-events-none absolute top-0 left-0 size-9">
            <span className="absolute inset-0 overflow-hidden rounded-full bg-[#012485] shadow-[0_0_0_2px_#7dd3fc,0_0_20px_4px_rgba(34,211,238,.6),0_6px_14px_rgba(0,0,0,.5)]">
              <Image
                src="/hero/portrait.jpg"
                alt=""
                fill
                sizes="36px"
                className="object-cover object-[center_18%]"
              />
            </span>
          </span>
          <span
            ref={chip}
            className={`${MONO} pointer-events-none absolute top-0 left-0 rounded-[7px] border border-[rgba(125,211,252,.45)] bg-[rgba(3,37,108,.92)] px-[9px] py-[7px] text-xs text-[#e0f2fe] shadow-[0_4px_14px_rgba(0,0,0,.35)]`}
          >
            Los Angeles, CA
          </span>
          <span
            ref={label}
            className={`${TAG} rounded-md border border-[rgba(34,211,238,.4)] bg-[rgba(8,20,39,.88)] px-[7px] py-[5px] text-[11px] text-[#cffafe] transition-opacity duration-250 data-[hover]:border-[rgba(224,242,254,.8)] data-[hover]:text-white data-[hover]:transition-none`}
          />
          <span
            ref={you}
            className={`${TAG} rounded-md border border-[rgba(224,242,254,.85)] bg-[rgba(3,37,108,.94)] px-[7px] py-[5px] text-[11px] text-white transition-opacity duration-1000 [&_b]:font-bold [&_b]:text-[#a5f3fc]`}
          />
        </div>
      </div>
    </div>
  )
}
