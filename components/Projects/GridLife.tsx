'use client'

import { useEffect, useRef } from 'react'
import styles from './marks.module.css'

const CELL = 52
// The hero's numbers (components/sections/HeroGrid.tsx): at most this many lit
// cells, roughly one per this many free cells on screen.
const LIT = 36
const DENSITY = 12
// The hero's deep blues. Its cells sit under a 35% wash of the page colour;
// these have none, so their peak is scaled to look the same.
const TONES = ['#0c1836', '#13234d', '#0f1f52', '#16285a']
const WASH = 0.65
// The hero's soft sine ease and timings (ms): holds long next to the fades,
// so most cells are lit at any moment.
const EASE = 'cubic-bezier(0.37, 0, 0.63, 1)'
const FADE = [1400, 2200] as const
const HOLD = [2500, 6000] as const
const GAP = [150, 700] as const
// As in the hero, at most this share of the lit cells may be dark or fading
// at once, so the lit count stays steady.
const MAX_OUT = 0.25
// Kept off the section's faded top and bottom rows, and, as in the hero, off a
// sliver of the screen at each side.
const TOP = 3
const BOTTOM = 3
const EDGE = 0.03

type Spot = { x: number; y: number }
const key = ({ x, y }: Spot) => `${x},${y}`
const between = ([min, max]: readonly [number, number]) => min + Math.random() * (max - min)

/**
 * The Projects grid's own life (owner, 2026-11-24), as busy as the
 * hero's (components/sections/HeroGrid.tsx), with its numbers: deep-blue
 * cells fade in, hold, fade out and come back somewhere else, each on its own
 * random clock, never touching each other, and only a quarter of them dark or
 * fading at once. They use open grid on screen, the page margins beside the
 * content column included: never under a card, the heading or the copy
 * (`[data-grid-avoid]`), never on or next to a pixel mark. They rest while the
 * section is off screen or the tab is hidden. Reduced motion shows a set,
 * still, placed when the section first comes on screen (the hero places its
 * still set on load, when it is on screen).
 */
export default function GridLife() {
  const ref = useRef<HTMLDivElement>(null)
  const cells = useRef<(HTMLElement | null)[]>([])

  useEffect(() => {
    const layer = ref.current?.parentElement
    const root = layer?.closest<HTMLElement>('[data-marks-root]')
    if (!layer || !root || typeof IntersectionObserver === 'undefined') return
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    const taken = new Set<string>()
    const timers = new Set<ReturnType<typeof setTimeout>>()
    const later = (fn: () => void, ms: number) => {
      const t = setTimeout(() => {
        timers.delete(t)
        fn()
      }, ms)
      timers.add(t)
    }
    let onScreen = false

    /**
     * Free cells on screen, in grid coordinates (x from the middle line), and
     * how many cells the band on screen has in all.
     */
    const free = (): Spot[] & { band?: number } => {
      const g = layer.getBoundingClientRect()
      const width = document.documentElement.clientWidth
      const mid = g.left + g.width / 2
      const minX = Math.ceil((width * EDGE - mid) / CELL)
      const maxX = Math.floor((width * (1 - EDGE) - mid) / CELL) - 1
      const minY = Math.max(TOP, Math.ceil(-g.top / CELL))
      const maxY = Math.min(
        Math.floor(g.height / CELL) - 1 - BOTTOM,
        Math.floor((innerHeight - g.top) / CELL) - 1
      )
      const avoid = [
        ...[...root.querySelectorAll<HTMLElement>('[data-grid-avoid]')].map((el) => ({
          r: el.getBoundingClientRect(),
          pad: 20,
        })),
        ...[...root.querySelectorAll<HTMLElement>('[data-mark]')]
          .filter((el) => el.offsetParent)
          .map((el) => ({ r: el.getBoundingClientRect(), pad: CELL + 6 })),
      ]
      const spots: Spot[] & { band?: number } = []
      spots.band = Math.max(0, maxX - minX + 1) * Math.max(0, maxY - minY + 1)
      for (let y = minY; y <= maxY; y++)
        for (let x = minX; x <= maxX; x++) {
          const left = mid + x * CELL
          const top = g.top + y * CELL
          const hit = avoid.some(
            ({ r, pad }) =>
              r.width > 0 &&
              left < r.right + pad &&
              left + CELL > r.left - pad &&
              top < r.bottom + pad &&
              top + CELL > r.top - pad
          )
          if (!hit) spots.push({ x, y })
        }
      return spots
    }
    // As many as the hero would light in a band this size; the cards take
    // much of it, so the free grid around them holds them more densely (the
    // no-touching rule still caps it).
    const countFor = (spots: Spot[] & { band?: number }) =>
      Math.min(LIT, Math.round((spots.band ?? spots.length) / DENSITY))
    const clear = (spot: Spot) => {
      for (let dx = -1; dx <= 1; dx++)
        for (let dy = -1; dy <= 1; dy++)
          if (taken.has(key({ x: spot.x + dx, y: spot.y + dy }))) return false
      return true
    }
    const pick = (spots: Spot[]) => {
      for (let tries = 0; tries < 60 && spots.length; tries++) {
        const spot = spots[Math.floor(Math.random() * spots.length)]
        if (clear(spot)) return spot
      }
      return null
    }
    const place = (el: HTMLElement, spot: Spot) => {
      el.style.left = `calc(50% + ${spot.x * CELL + 1}px)`
      el.style.top = `${spot.y * CELL + 1}px`
      el.style.background = TONES[Math.floor(Math.random() * TONES.length)]
    }
    const fade = (el: HTMLElement, opacity: number, ms: number) => {
      el.style.transition = `opacity ${ms}ms ${EASE}`
      el.style.opacity = String(opacity)
    }
    const peak = () => Number(((0.45 + Math.random() * 0.4) * WASH).toFixed(2))

    if (reduce) {
      // A still set, placed once the section fills most of the screen (just
      // its top edge would leave no band to place them in).
      const io = new IntersectionObserver(
        (entries) => {
          const e = entries[entries.length - 1]
          const shown =
            Math.min(innerHeight, e.boundingClientRect.bottom) -
            Math.max(0, e.boundingClientRect.top)
          if (!e.isIntersecting || shown < innerHeight * 0.75) return
          const spots = free()
          io.disconnect()
          cells.current.slice(0, countFor(spots)).forEach((el) => {
            const spot = el && pick(spots)
            if (!el || !spot) return
            taken.add(key(spot))
            place(el, spot)
            el.style.opacity = String(peak())
          })
        },
        { threshold: Array.from({ length: 21 }, (_, i) => i / 40) }
      )
      io.observe(root)
      return () => io.disconnect()
    }

    const resting = () => document.hidden || !onScreen
    // While resting, each cell's next step waits here instead of on a timer,
    // so nothing runs at all until the section is back on screen.
    const parked: (() => void)[] = []
    const wake = () => {
      if (!resting()) parked.splice(0).forEach((step) => step())
    }
    let out = 0
    const maxOut = () => Math.max(1, Math.floor(countFor(free()) * MAX_OUT))

    /**
     * A dark cell lights up somewhere free, then holds. `counted` is a cell
     * coming back from a fade-out: as in the hero, it stops counting as out
     * once it is halfway in (or as soon as it gives up its turn).
     */
    const light = (i: number, counted = false) => {
      const el = cells.current[i]
      if (!el) return
      const wait = (ms: number) => {
        if (counted) out--
        later(() => light(i), ms)
      }
      if (resting()) return void parked.push(() => light(i, counted))
      const spots = free()
      if (i >= countFor(spots)) return wait(between(HOLD))
      const spot = pick(spots)
      if (!spot) return wait(1000)
      taken.add(key(spot))
      place(el, spot)
      const fadeIn = between(FADE)
      fade(el, peak(), fadeIn)
      if (counted) later(() => out--, fadeIn / 2)
      later(() => cycle(i, spot), fadeIn + between(HOLD))
    }
    /** A lit cell fades out (when its turn comes), waits, and lights again elsewhere. */
    const cycle = (i: number, spot: Spot) => {
      const el = cells.current[i]
      if (!el) return
      if (resting()) return void parked.push(() => cycle(i, spot))
      if (out >= maxOut()) return later(() => cycle(i, spot), 300 + Math.random() * 400)
      out++
      const fadeOut = between(FADE)
      fade(el, 0, fadeOut)
      later(() => {
        // Its spot stays taken until it has fully faded out.
        taken.delete(key(spot))
        later(() => light(i, true), between(GAP))
      }, fadeOut)
    }
    const io = new IntersectionObserver((entries) => {
      onScreen = entries[entries.length - 1].isIntersecting
      wake()
    })
    io.observe(root)
    document.addEventListener('visibilitychange', wake)
    // Warm-up, as in the hero: each cell first lights at a random moment.
    cells.current.forEach((_, i) => later(() => light(i), between([300, 5000])))
    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', wake)
      timers.forEach(clearTimeout)
    }
  }, [])

  return (
    <div ref={ref} className="contents">
      {Array.from({ length: LIT }, (_, i) => (
        <i
          key={i}
          ref={(el) => {
            cells.current[i] = el
          }}
          className={styles.life}
        />
      ))}
    </div>
  )
}
