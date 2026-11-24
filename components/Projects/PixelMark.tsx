'use client'

import React, { useEffect, useRef } from 'react'
import { ORDER, POSES, RANK_BASE, RANK_H, rankPose, type MarkKind } from './marks'
import styles from './marks.module.css'

const CELL = 52

// Flip timings (ms). In: about a second for the whole wave; out: about half.
const IN_FLIP = 340
const IN_WAVE = 760
const OUT_FLIP = 220
const OUT_WAVE = 280
// Idle actions: one small action per mark every 4 to 8 seconds, and never two
// marks at once (a shared lock, with a breath after each action).
const IDLE = [4000, 8000] as const
const BREATH = 2400
let lockedUntil = 0

const between = ([min, max]: readonly [number, number]) => min + Math.random() * (max - min)
const chance = (p: number) => Math.random() < p

type Slot = { i: number; j: number; el: HTMLElement | null; ch: string }

/**
 * LAB (exp/project-marks): a project's pixel mark, lit from the section's grid
 * squares in the open space beside its card (wide screens only).
 *
 * It is snapped onto the grid: centred in the space beside the card and on the
 * card's middle, then moved to the nearest cell. Its cells flip in like a
 * split-flap board when it comes into view and flip out when it leaves, every
 * time. While on screen it does one small thing now and then (the bird
 * blinks, pecks or flicks its tail; the play button pauses or runs a
 * playhead; the podium reshuffles), each made of the same flips. Nothing
 * answers the pointer. Reduced motion shows it still and complete; `still`
 * keeps the flips in and out only.
 */
export default function PixelMark({
  kind,
  rgb,
  side,
  mirror = false,
  still = false,
  cardRef,
}: {
  kind: MarkKind
  rgb: string
  side: 'left' | 'right'
  /** Draw it facing the other way (the bird looks toward its card). */
  mirror?: boolean
  /** No idle actions. */
  still?: boolean
  cardRef: React.RefObject<HTMLElement | null>
}) {
  const ref = useRef<HTMLDivElement>(null)
  const poses: Record<string, string[]> = POSES[kind]
  const base = poses.base
  const h = base.length
  const w = base[0].length

  // Every cell any pose lights, so a pose change only flips existing cells.
  const keys: string[] = []
  const seen = new Set<string>()
  const allPoses = kind === 'rank' ? [rankPose([7, 7, 7])] : Object.values(poses)
  for (const pose of allPoses)
    pose.forEach((line, j) =>
      [...line].forEach((ch, i) => {
        const key = `${i},${j}`
        if (ch !== '.' && !seen.has(key)) {
          seen.add(key)
          keys.push(key)
        }
      })
    )
  const slots = useRef<Slot[]>([])

  // Snap onto the grid, and again whenever the row changes size.
  useEffect(() => {
    const el = ref.current
    const card = cardRef.current
    const row = el?.parentElement
    const grid = el?.closest('[data-marks-root]')?.querySelector<HTMLElement>('[data-marks-grid]')
    if (!el || !card || !row || !grid) return
    const place = () => {
      if (getComputedStyle(el).display === 'none') return
      // Layout boxes, not painted ones: the card fades up into place, and a
      // transform must not move the mark off the grid.
      const r = row.getBoundingClientRect()
      const g = grid.getBoundingClientRect()
      const lineX = g.left + g.width / 2 - r.left // a grid line, in row space
      const lineY = g.top - r.top
      const cardLeft = card.offsetLeft
      const cardRight = cardLeft + card.offsetWidth
      const [from, to] = side === 'right' ? [cardRight, row.clientWidth] : [0, cardLeft]
      const x = (from + to) / 2 - (w * CELL) / 2
      const y = card.offsetTop + card.offsetHeight / 2 - (h * CELL) / 2
      // Across, of the two nearest columns take the one that leaves the most
      // room on its tighter side, so it never crowds the card.
      const down = lineX + Math.floor((x - lineX) / CELL) * CELL
      const room = (c: number) => Math.min(c - from, to - (c + w * CELL))
      const left = room(down + CELL) > room(down) ? down + CELL : down
      const top = lineY + Math.round((y - lineY) / CELL) * CELL
      el.style.left = `${left + 1}px`
      el.style.top = `${top + 1}px`
      el.setAttribute('data-ready', '')
    }
    place()
    const resized = new ResizeObserver(place)
    resized.observe(row)
    resized.observe(grid)
    return () => resized.disconnect()
  }, [cardRef, side, w, h])

  // The life: in and out with the scroll, and the idle actions.
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
    const at = (pose: string[], s: Slot) => pose[s.j]?.[s.i] ?? '.'

    const flip = (s: Slot, ch: string, delay: number, ms: number) => {
      const c = s.el
      if (!c || s.ch === ch) return
      c.style.setProperty('--d', `${Math.round(delay)}ms`)
      c.style.setProperty('--f', `${ms}ms`)
      if (ch === '.') c.removeAttribute('data-lit')
      else if (s.ch === '.') {
        c.dataset.k = ch
        c.setAttribute('data-lit', '')
      } else {
        // Lit to lit in another colour: over and back, like a flap turning.
        c.removeAttribute('data-lit')
        later(() => {
          c.style.setProperty('--d', '0ms')
          c.dataset.k = ch
          c.setAttribute('data-lit', '')
        }, delay + ms)
      }
      s.ch = ch
    }
    /**
     * Flip to a pose; `delay` orders the wave, and `lag` holds back the cells
     * going dark so a moving part (the bird's head) is never missing for a
     * moment. Returns when it is done.
     */
    const pose = (target: string[], delay: (s: Slot) => number, ms: number, lag = 0) => {
      let end = 0
      for (const s of cells) {
        const ch = at(target, s)
        if (ch === s.ch) continue
        const d = delay(s) + (ch === '.' ? lag : 0)
        const twice = ch !== '.' && s.ch !== '.'
        flip(s, ch, d, ms)
        end = Math.max(end, d + ms * (twice ? 2 : 1))
      }
      return end
    }
    // The waves: the podium from the floor, the others the way they face.
    const along = (s: Slot) => (ORDER[kind] === 'up' ? h - 1 - s.j : s.i)
    const span = ORDER[kind] === 'up' ? h : w
    const wave = (total: number) => (s: Slot) =>
      (along(s) / Math.max(1, span - 1)) * total + Math.random() * 60

    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      el.setAttribute('data-still', '')
      pose(base, () => 0, 0)
      return
    }

    let shown = false
    let ready = false // in, and done flipping in
    let rank: [number, number, number] = [...RANK_BASE]

    // One idle action. Returns how long it takes.
    const act = (): number => {
      if (kind === 'wren') {
        const r = Math.random()
        if (r < 0.55) {
          // Blink, sometimes twice.
          const eye = cells.find((s) => s.ch === 'o')?.el
          if (!eye) return 0
          const blink = (t: number) => {
            later(() => eye.setAttribute('data-blink', ''), t)
            later(() => eye.removeAttribute('data-blink'), t + 150)
          }
          blink(0)
          if (chance(0.35)) blink(330)
          return 650
        }
        if (r < 0.85) {
          // Peck: the head goes down to the ground and comes back, once or twice.
          const peck = (t: number) => {
            later(() => pose(poses.peck1, () => 0, 120, 60), t)
            later(() => pose(poses.peck2, () => 0, 120, 60), t + 190)
            later(() => pose(poses.peck1, () => 0, 120, 60), t + 450)
            later(() => pose(base, () => 0, 120, 60), t + 640)
          }
          peck(0)
          const twice = chance(0.45)
          if (twice) peck(950)
          return twice ? 1800 : 850
        }
        // Tail flick.
        later(() => pose(poses.flick, () => 0, 130, 60), 0)
        later(() => pose(base, () => 0, 150, 60), 340)
        return 650
      }
      if (kind === 'play') {
        if (chance(0.6)) {
          // Pause for a moment, then play again.
          const ms = pose(poses.pause, wave(220), 200)
          later(() => pose(base, wave(220), 200), ms + 1000)
          return ms * 2 + 1000
        }
        // A playhead: a brighter column sweeps left to right.
        const lit = cells.filter((s) => s.ch !== '.')
        for (let col = 0; col < w; col++) {
          const column = lit.filter((s) => s.i === col)
          later(() => column.forEach((s) => flip(s, 'H', 0, 120)), col * 170)
          later(() => column.forEach((s) => flip(s, 'X', 0, 140)), col * 170 + 380)
        }
        return w * 170 + 700
      }
      // The leaderboard moves: a challenger climbs to the top, the old leader
      // drops a cell or two, third place shifts a little; now and then it
      // settles back to the podium.
      const leader = rank.indexOf(RANK_H)
      let next: [number, number, number]
      if (chance(0.3) && rank.join() !== RANK_BASE.join()) next = [...RANK_BASE]
      else {
        const others = [0, 1, 2].filter((b) => b !== leader)
        const challenger = others[Math.floor(Math.random() * 2)]
        const third = others.find((b) => b !== challenger)!
        next = [...rank]
        next[challenger] = RANK_H
        next[leader] = RANK_H - (chance(0.5) ? 1 : 2)
        const t = rank[third] + (chance(0.5) ? 0 : chance(0.5) ? 1 : -1)
        next[third] = Math.min(next[leader] - 1, Math.max(2, t))
      }
      // Bars that grow flip on from the bottom up; bars that shrink, top down.
      const from = rank
      rank = next
      return pose(
        rankPose(next),
        (s) => {
          const bar = s.i / 2
          const grows = next[bar] > from[bar]
          const k = grows ? RANK_H - from[bar] - 1 - s.j : s.j - (RANK_H - from[bar])
          return Math.abs(k) * 110
        },
        200
      )
    }

    let idle: ReturnType<typeof setTimeout> | undefined
    const schedule = (ms: number) => {
      clearTimeout(idle)
      if (still) return
      idle = setTimeout(tick, ms)
    }
    const tick = () => {
      if (!ready || document.hidden) return schedule(between([2000, 4000]))
      const now = performance.now()
      if (now < lockedUntil) return schedule(lockedUntil - now + between([600, 2400]))
      const ms = act()
      lockedUntil = now + ms + BREATH
      schedule(ms + between(IDLE))
    }

    const enter = () => {
      shown = true
      clear()
      const ms = pose(kind === 'rank' ? rankPose(rank) : base, wave(IN_WAVE), IN_FLIP)
      later(() => {
        ready = true
        schedule(between([1500, 4000]))
      }, ms)
    }
    const leave = () => {
      shown = false
      ready = false
      clearTimeout(idle)
      clear()
      // Mid-action cells may be lit in another colour: they flip out too.
      for (const s of cells) s.el?.removeAttribute('data-blink')
      pose(Array(h).fill('.'.repeat(w)), wave(OUT_WAVE), OUT_FLIP)
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
      clear()
      clearTimeout(idle)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, still])

  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-mark={kind}
      className={`${styles.mark} ${styles[kind]}`}
      style={{ '--a': rgb, width: w * CELL, height: h * CELL } as React.CSSProperties}
    >
      {keys.map((key, n) => {
        const [i, j] = key.split(',').map(Number)
        const x = mirror ? w - 1 - i : i
        const ch = base[j][i] === '.' ? 'X' : base[j][i]
        return (
          <i
            key={key}
            ref={(c) => {
              slots.current[n] = { i, j, el: c, ch: slots.current[n]?.ch ?? '.' }
            }}
            className={styles.cell}
            data-k={ch}
            style={{ left: x * CELL, top: j * CELL }}
          />
        )
      })}
    </div>
  )
}
