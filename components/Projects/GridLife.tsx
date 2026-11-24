'use client'

import { useEffect, useRef } from 'react'
import styles from './marks.module.css'

const CELL = 52
// At most this many lit cells, and roughly one per this many free cells on
// screen: sparser than the hero, so the cards stay the subject.
const LIT = 7
const DENSITY = 16
// The hero's deep blues. Its cells sit under a 35% wash of the page colour;
// these have none, so their peak is scaled down to match.
const TONES = ['#0c1836', '#13234d', '#0f1f52', '#16285a']
const WASH = 0.65
// The hero's soft sine ease, and its timings a touch calmer (ms).
const EASE = 'cubic-bezier(0.37, 0, 0.63, 1)'
const FADE = [1700, 2500] as const
const HOLD = [3500, 7500] as const
const GAP = [300, 900] as const
// Kept off the section's faded top and bottom, and off the faded sides.
const TOP = 3
const BOTTOM = 3

type Spot = { x: number; y: number }
const key = ({ x, y }: Spot) => `${x},${y}`
const between = ([min, max]: readonly [number, number]) => min + Math.random() * (max - min)

/**
 * LAB (exp/project-marks): the Projects grid's own life, as the hero's
 * (components/sections/HeroGrid.tsx): a few deep-blue cells fade in, hold,
 * fade out and come back somewhere else, each on its own random clock, never
 * touching each other. They only use open grid on screen: never under a
 * card, the heading or the copy (`[data-grid-avoid]`), never on or next to a
 * pixel mark. They rest while the section is off screen or the tab is
 * hidden. Reduced motion shows a few, still.
 */
export default function GridLife() {
  const ref = useRef<HTMLDivElement>(null)
  const cells = useRef<(HTMLElement | null)[]>([])

  useEffect(() => {
    const layer = ref.current?.parentElement
    const root = layer?.closest<HTMLElement>('[data-marks-root]')
    if (!layer || !root) return
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

    /** Free cells on screen, in grid coordinates (x from the middle line). */
    const free = (): Spot[] => {
      const g = layer.getBoundingClientRect()
      const mid = g.left + g.width / 2
      const fade = Math.min(320, Math.max(48, g.width * 0.16))
      const minX = Math.ceil((g.left + fade * 0.7 - mid) / CELL)
      const maxX = Math.floor((g.right - fade * 0.7 - mid) / CELL) - 1
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
      const spots: Spot[] = []
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
    const clear = (spot: Spot) => {
      for (let dx = -1; dx <= 1; dx++)
        for (let dy = -1; dy <= 1; dy++)
          if (taken.has(key({ x: spot.x + dx, y: spot.y + dy }))) return false
      return true
    }
    const pick = (spots: Spot[]) => {
      for (let tries = 0; tries < 40 && spots.length; tries++) {
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
    const peak = () => ((0.45 + Math.random() * 0.4) * WASH).toFixed(2)

    if (reduce) {
      const spots = free()
      const count = Math.min(LIT, Math.round(spots.length / DENSITY))
      cells.current.slice(0, count).forEach((el) => {
        const spot = el && pick(spots)
        if (!el || !spot) return
        taken.add(key(spot))
        place(el, spot)
        el.style.opacity = peak()
      })
      return
    }

    const resting = () => document.hidden || !onScreen
    // One cell's life: find a spot, fade in, hold, fade out, wait, again.
    const live = (i: number) => {
      const el = cells.current[i]
      if (!el) return
      if (resting()) return later(() => live(i), 1200)
      const spots = free()
      const count = Math.min(LIT, Math.round(spots.length / DENSITY))
      if (i >= count) return later(() => live(i), between(HOLD))
      const spot = pick(spots)
      if (!spot) return later(() => live(i), 1500)
      taken.add(key(spot))
      place(el, spot)
      const fadeIn = between(FADE)
      fade(el, Number(peak()), fadeIn)
      later(
        () => {
          const fadeOut = between(FADE)
          fade(el, 0, fadeOut)
          later(() => {
            taken.delete(key(spot))
            later(() => live(i), between(GAP))
          }, fadeOut)
        },
        fadeIn + between(HOLD)
      )
    }
    const io = new IntersectionObserver((entries) => {
      onScreen = entries[entries.length - 1].isIntersecting
    })
    io.observe(root)
    cells.current.forEach((_, i) => later(() => live(i), between([400, 5000])))
    return () => {
      io.disconnect()
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
