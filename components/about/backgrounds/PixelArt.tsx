'use client'

import React, { useEffect, useMemo, useRef } from 'react'
import type { Art } from './art'
import styles from './art.module.css'

// Flip timings (ms): in, about a second for the whole wave; out, about half.
const IN_FLIP = 320
const IN_WAVE = 760
const OUT_FLIP = 200
const OUT_WAVE = 260
const STEP_FLIP = 180
// One idle action every few seconds, while on screen.
const IDLE = [2600, 5200] as const

const between = ([min, max]: readonly [number, number]) => min + Math.random() * (max - min)

type Slot = { i: number; j: number; el: HTMLElement | null; ch: string }

/** Every cell the picture may ever light, in any pose. */
function cellsOf(art: Art): string[] {
  const keys = new Set<string>()
  for (const rows of [art.base, ...art.idles.flatMap((frames) => frames.map((f) => f.pose))])
    rows.forEach((line, j) => [...line].forEach((ch, i) => ch !== '.' && keys.add(`${i},${j}`)))
  return [...keys]
}

/**
 * One pixel picture, lit from the background grid's squares (preview ?bg=1).
 * Its cells flip in like a split-flap board when most of it comes on screen
 * and flip out when it leaves, every time. While on screen it plays one small
 * action every few seconds (the sun sets, the phone rings, code types). It
 * never follows the pointer, takes no clicks and is hidden from screen
 * readers. Reduced motion: drawn complete and still.
 */
export default function PixelArt({
  art,
  cell,
  left,
  top,
  reduce,
}: {
  art: Art
  /** The size of a cell in px (the grid's, or half of it on a phone). */
  cell: number
  left: number
  top: number
  reduce: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const keys = useMemo(() => cellsOf(art), [art])
  const slots = useRef<Slot[]>([])
  const h = art.base.length
  const w = art.base[0].length

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const cells = slots.current
    const timers = new Set<ReturnType<typeof setTimeout>>()
    const later = (fn: () => void, ms: number) => {
      const t = setTimeout(() => {
        timers.delete(t)
        fn()
      }, ms)
      timers.add(t)
    }
    const clear = () => {
      timers.forEach(clearTimeout)
      timers.clear()
    }
    const at = (rows: readonly string[], s: Slot) => rows[s.j]?.[s.i] ?? '.'
    // "r,g,b" to "r g b", for rgb(var(--c) / alpha) in the stylesheet.
    const paint = (c: HTMLElement, ch: string) =>
      c.style.setProperty('--c', (art.colors[ch] ?? '56,189,248').replaceAll(',', ' '))

    const flip = (s: Slot, ch: string, delay: number, ms: number) => {
      const c = s.el
      if (!c || s.ch === ch) return
      c.style.setProperty('--d', `${Math.round(delay)}ms`)
      c.style.setProperty('--f', `${ms}ms`)
      if (ch === '.') c.removeAttribute('data-lit')
      else if (s.ch === '.') {
        paint(c, ch)
        c.setAttribute('data-lit', '')
      } else {
        // Lit to lit in another colour: over and back, like a flap turning.
        c.removeAttribute('data-lit')
        later(() => {
          c.style.setProperty('--d', '0ms')
          paint(c, ch)
          c.setAttribute('data-lit', '')
        }, delay + ms)
      }
      s.ch = ch
    }
    const pose = (rows: readonly string[], delay: (s: Slot) => number, ms: number) => {
      let end = 0
      for (const s of cells) {
        const ch = at(rows, s)
        if (ch === s.ch) continue
        const d = delay(s)
        flip(s, ch, d, ms)
        end = Math.max(end, d + ms * (ch !== '.' && s.ch !== '.' ? 2 : 1))
      }
      return end
    }
    const span = art.order === 'up' ? h : w
    const along = (s: Slot) => (art.order === 'up' ? h - 1 - s.j : s.i)
    const wave = (total: number) => (s: Slot) =>
      (along(s) / Math.max(1, span - 1)) * total + Math.random() * 60

    if (reduce) {
      el.setAttribute('data-still', '')
      pose(art.base, () => 0, 0)
      return () => {
        el.removeAttribute('data-still')
        pose(Array(h).fill('.'.repeat(w)), () => 0, 0)
      }
    }

    let shown = false
    let idle: ReturnType<typeof setTimeout> | undefined
    const play = (frames: Art['idles'][number], n = 0) => {
      if (!shown) return
      if (n >= frames.length) return schedule()
      const f = frames[n]
      pose(f.pose, () => Math.random() * 40, f.flip ?? STEP_FLIP)
      later(() => play(frames, n + 1), f.hold)
    }
    const schedule = () => {
      clearTimeout(idle)
      idle = setTimeout(() => {
        if (!shown) return
        if (document.hidden) return schedule()
        play(art.idles[Math.floor(Math.random() * art.idles.length)])
      }, between(IDLE))
    }
    const enter = () => {
      shown = true
      clear()
      const ms = pose(art.base, wave(IN_WAVE), IN_FLIP)
      later(schedule, ms)
    }
    const leave = () => {
      shown = false
      clear()
      clearTimeout(idle)
      for (const s of cells) flip(s, '.', Math.random() * OUT_WAVE, OUT_FLIP)
    }
    // In once most of it is on screen, out once nearly all of it has gone:
    // the gap between the two keeps it from flickering at the edge.
    const io = new IntersectionObserver(
      (entries) => {
        const e = entries[entries.length - 1]
        if (!shown && e.intersectionRatio >= 0.6) enter()
        else if (shown && e.intersectionRatio <= 0.1) leave()
      },
      { threshold: [0, 0.1, 0.35, 0.6, 1] }
    )
    io.observe(el)
    return () => {
      io.disconnect()
      shown = false
      clear()
      clearTimeout(idle)
    }
  }, [art, reduce, h, w])

  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-art={art.id}
      className={styles.art}
      style={{ left, top, width: w * cell, height: h * cell }}
    >
      {keys.map((key, n) => {
        const [i, j] = key.split(',').map(Number)
        return (
          <i
            key={key}
            ref={(c) => {
              // One slot per cell for the picture's life: React detaches and
              // reattaches refs (on every render, and twice in strict mode),
              // and the slot must keep knowing what its cell shows.
              const slot = (slots.current[n] ??= { i, j, el: null, ch: '.' })
              slot.el = c
            }}
            className={styles.cell}
            style={{ left: i * cell + 1, top: j * cell + 1, width: cell - 1, height: cell - 1 }}
          />
        )
      })}
    </div>
  )
}
