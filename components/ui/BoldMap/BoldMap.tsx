'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { latestEntry } from '@/lib/intersection'
import Backdrop, { MONO } from './Backdrop'
import { createMapEngine, type MapEngine } from './engine'
import type { Visitor } from './geo'
import { asVisitor } from './text'

// Place labels: 12px on a phone card, 13px at the bento size, 15px on a large map
// (owner, 2026-11-25: the old 11px semibold read too small and too thin).
const TAG = `${MONO} pointer-events-none absolute top-0 left-0 px-2 py-1.5 text-xs opacity-0 data-[on]:opacity-100 @min-[400px]:text-[13px] @min-[700px]:px-2.5 @min-[700px]:py-[7px] @min-[700px]:text-[15px] [&_em]:not-italic [&_em]:text-[#8ee0ff]`
/** Hidden until the engine has placed what is inside. */
const PLACED =
  'opacity-0 transition-opacity duration-300 group-data-[ready]/map:opacity-100 motion-reduce:transition-none'
/** The avatar grows: card hovered, avatar hovered or keyboard-focused, or tapped. */
const GROW = [
  'group-hover/map:scale-100 group-hover/pin:scale-100 group-focus-visible/pin:scale-100 group-data-[big]/pin:scale-100',
  'group-hover/map:shadow-[0_0_0_3px_#e0f2fe,0_0_46px_12px_rgba(34,211,238,.7),0_12px_28px_rgba(0,0,0,.55)]',
  'group-hover/pin:shadow-[0_0_0_3px_#e0f2fe,0_0_46px_12px_rgba(34,211,238,.7),0_12px_28px_rgba(0,0,0,.55)]',
  'group-focus-visible/pin:shadow-[0_0_0_3px_#fff,0_0_0_6px_#38bdf8,0_0_46px_12px_rgba(34,211,238,.7)]',
  'group-data-[big]/pin:shadow-[0_0_0_3px_#e0f2fe,0_0_46px_12px_rgba(34,211,238,.7),0_12px_28px_rgba(0,0,0,.55)]',
].join(' ')

/** Where the home page asks for the visitor's rough location (app/api/where). */
export const WHERE_URL = '/api/where'

/**
 * The bold 3D map of the "Ready to relocate" card: the site's lit grid raised
 * into the country's real terrain, with routes traced from Los Angeles and,
 * for a visitor in the lower 48, a line to them.
 *
 * It fills its parent (which sets the size, so nothing shifts), runs only on
 * screen in a visible tab, and is drawn once and held still under reduced
 * motion.
 *
 * The visitor is either given (`visitor`, the lab page's `?from=`) or, with
 * `locate`, asked for after the map is up from /api/where, so the page around
 * it stays static and cached and never carries anyone's location. The map is
 * complete without it; a known visitor just gets a line drawn from that moment.
 */
export default function BoldMap({
  visitor = null,
  locate = false,
}: {
  visitor?: Visitor | null
  locate?: boolean
}) {
  const still = usePrefersReducedMotion()
  const card = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const pin = useRef<HTMLButtonElement>(null)
  const chip = useRef<HTMLSpanElement>(null)
  const you = useRef<HTMLSpanElement>(null)
  const label = useRef<HTMLSpanElement>(null)
  const engine = useRef<MapEngine | null>(null)
  const [big, setBig] = useState(false)
  const [located, setLocated] = useState<Visitor | null>(null)
  const known = located ?? visitor
  const knownKey = JSON.stringify(known)
  // The engine is made once per motion setting; it reads the visitor known by then.
  const knownRef = useRef(known)
  useEffect(() => {
    knownRef.current = JSON.parse(knownKey) as Visitor | null
  }, [knownKey])

  useEffect(() => {
    const root = card.current
    const host = stage.current
    if (!root || !host || !pin.current || !chip.current || !you.current || !label.current) return
    // A fresh canvas per engine: a canvas keeps the first kind of context it was asked for.
    const canvas = document.createElement('canvas')
    canvas.className = 'absolute inset-0 h-full w-full'
    canvas.setAttribute('aria-hidden', 'true')
    host.replaceChildren(canvas)
    const map = createMapEngine(
      {
        card: root,
        canvas,
        pin: pin.current,
        chip: chip.current,
        you: you.current,
        label: label.current,
      },
      { visitor: knownRef.current, still }
    )
    engine.current = map
    root.dataset.ready = 'true'

    let onScreen = false
    const update = () => map.setActive(onScreen && document.visibilityState === 'visible')
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
      frame = requestAnimationFrame(() => map.resize())
    })
    ro.observe(root)
    return () => {
      cancelAnimationFrame(frame)
      ro.disconnect()
      io.disconnect()
      document.removeEventListener('visibilitychange', update)
      map.destroy()
      engine.current = null
      canvas.remove()
      delete root.dataset.ready
    }
  }, [still])

  // A visitor learned after the engine started gets their line now.
  const shown = useRef(knownKey)
  useEffect(() => {
    if (shown.current === knownKey) return
    shown.current = knownKey
    engine.current?.setVisitor(JSON.parse(knownKey) as Visitor | null)
  }, [knownKey])

  // Ask where the visitor is, once, after the map is up. No cookies; any
  // failure, a slow answer or an empty one simply leaves the map without a line.
  useEffect(() => {
    if (!locate) return
    const abort = new AbortController()
    const timer = setTimeout(() => abort.abort(), 5000)
    fetch(WHERE_URL, { cache: 'no-store', credentials: 'omit', signal: abort.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((body: { visitor?: unknown } | null) => {
        const v = asVisitor(body?.visitor)
        if (v) setLocated(v)
      })
      .catch(() => {})
      .finally(() => clearTimeout(timer))
    return () => {
      clearTimeout(timer)
      abort.abort()
    }
  }, [locate])

  return (
    <div
      ref={card}
      data-bold-map
      className="group/map absolute inset-0 touch-pan-y overflow-hidden bg-[#0b1b36] select-none @container"
    >
      <div
        ref={stage}
        aria-hidden="true"
        className="absolute inset-0 opacity-0 transition-opacity duration-500 group-data-[ready]/map:opacity-100 motion-reduce:transition-none"
      />
      <Backdrop visitor={known} />
      {/* Placed by the engine; hidden until it has placed them. */}
      <div aria-hidden="true" className={`relative z-[2] ${PLACED}`}>
        <span
          ref={chip}
          className={`${MONO} pointer-events-none absolute top-0 left-0 rounded-[7px] border border-[rgba(125,211,252,.5)] bg-[rgba(3,37,108,.94)] px-2.5 py-[7px] text-[13px] text-white shadow-[0_4px_14px_rgba(0,0,0,.35)] @min-[400px]:text-sm @min-[700px]:px-3 @min-[700px]:py-2 @min-[700px]:text-base`}
        >
          Los Angeles, CA
        </span>
        <span
          ref={label}
          className={`${TAG} rounded-md border border-[rgba(34,211,238,.45)] bg-[rgba(8,20,39,.92)] text-[#e0f2fe] transition-opacity duration-250 data-[hover]:border-[rgba(224,242,254,.8)] data-[hover]:text-white data-[hover]:transition-none`}
        />
        <span
          ref={you}
          className={`${TAG} rounded-md border border-[rgba(224,242,254,.85)] bg-[rgba(3,37,108,.95)] text-white transition-opacity duration-1000 [&_b]:text-[#a5f3fc]`}
        />
      </div>
      {/* His face, over Los Angeles: it grows when the card is hovered, when it
          is hovered or focused itself, and on a tap, so it reads as something
          to look at. Drawn at its large size and scaled down at rest, so it
          stays sharp when it grows. Last, so it sits over the labels. */}
      <div className={`relative z-[3] ${PLACED}`}>
        <button
          ref={pin}
          type="button"
          aria-label="Nathan Watkins, in Los Angeles"
          aria-pressed={big}
          data-big={big || undefined}
          onClick={() => setBig((b) => !b)}
          onBlur={() => setBig(false)}
          className="group/pin absolute top-0 left-0 size-9 cursor-default rounded-full outline-none @min-[700px]:size-12"
        >
          <span
            className={`absolute bottom-0 left-[-14px] size-16 origin-bottom scale-(--rest) overflow-hidden [--rest:0.5625] @min-[700px]:left-[-20px] @min-[700px]:size-22 @min-[700px]:[--rest:0.5455] rounded-full bg-[#012485] shadow-[0_0_0_3.5px_#7dd3fc,0_0_34px_7px_rgba(34,211,238,.55),0_10px_24px_rgba(0,0,0,.5)] transition-[scale,box-shadow] duration-500 ease-[cubic-bezier(.2,.9,.3,1.25)] motion-reduce:transition-none ${GROW}`}
          >
            <Image
              src="/hero/portrait.jpg"
              alt=""
              fill
              sizes="176px"
              className="object-cover object-[center_18%]"
            />
          </span>
        </button>
      </div>
    </div>
  )
}
