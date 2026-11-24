'use client'

import React, { useEffect, useRef } from 'react'
import { MARKS, type MarkKind } from './marks'
import styles from './marks.module.css'

const CELL = 52
const LEVELS: Record<string, number> = { X: 1, m: 0.75, d: 0.55 }

/**
 * LAB (exp/project-marks): a project's pixel mark, lit from the section's
 * grid squares in the open space beside its card (wide screens only).
 *
 * It sits in the card's row and is snapped onto the grid: centred in the
 * space beside the card and on the card's middle, then moved to the nearest
 * cell. It builds once, when its card comes into view, then holds still.
 * Nothing answers the pointer. Reduced motion shows it complete.
 *
 * `card` is the element whose box it sits beside; `grid` is found through the
 * nearest `[data-marks-root]`.
 */
export default function PixelMark({
  kind,
  rgb,
  side,
  mirror = false,
  cardRef,
}: {
  kind: MarkKind
  rgb: string
  side: 'left' | 'right'
  /** Draw it facing the other way (the bird looks toward its card). */
  mirror?: boolean
  cardRef: React.RefObject<HTMLElement | null>
}) {
  const ref = useRef<HTMLDivElement>(null)
  const spec = MARKS[kind]
  const h = spec.rows.length
  const w = spec.rows[0].length

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
      const snap = (v: number, line: number) => line + Math.round((v - line) / CELL) * CELL
      // Across, of the two nearest columns take the one that leaves the most
      // room on its tighter side, so it never crowds the card.
      const down = lineX + Math.floor((x - lineX) / CELL) * CELL
      const room = (c: number) => Math.min(c - from, to - (c + w * CELL))
      const left = room(down + CELL) > room(down) ? down + CELL : down
      el.style.left = `${left + 1}px`
      el.style.top = `${snap(y, lineY) + 1}px`
      el.setAttribute('data-ready', '')
    }
    place()
    const resized = new ResizeObserver(place)
    resized.observe(row)
    resized.observe(grid)
    return () => resized.disconnect()
  }, [cardRef, side, w, h])

  // Build once when the card comes into view.
  useEffect(() => {
    const el = ref.current
    const card = cardRef.current
    if (!el || !card) return
    if (
      typeof IntersectionObserver === 'undefined' ||
      matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      el.setAttribute('data-done', '')
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return
        el.setAttribute('data-on', '')
        io.disconnect()
      },
      { rootMargin: '0px 0px -20% 0px' }
    )
    io.observe(card)
    return () => io.disconnect()
  }, [cardRef])

  const cells: React.ReactNode[] = []
  const span = spec.order === 'up' ? h : w
  spec.rows.forEach((line, j) =>
    [...line].forEach((ch, raw) => {
      if (ch === '.') return
      const i = mirror ? w - 1 - raw : raw
      // A calm wave: rows from the floor, or columns the way the mark faces,
      // over about 0.6s; each cell then takes 0.56s to light. The highlight
      // comes last.
      const step = 600 / Math.max(1, span - 1)
      const along = spec.order === 'up' ? h - 1 - j : mirror ? w - 1 - i : i
      const across = spec.order === 'up' ? i : Math.abs(j - (h - 1) / 2)
      let delay = along * step + across * 18
      let className = styles.cell
      if (ch === '#') {
        className += ` ${styles.hi}`
        delay = 700
      } else if (ch === 'B') {
        className += ` ${styles.beak}`
        delay = 700
      } else if (ch === 'o') className += ` ${styles.eye}`
      cells.push(
        <i
          key={`${raw},${j}`}
          className={className}
          style={
            {
              left: i * CELL,
              top: j * CELL,
              '--d': `${Math.round(delay)}ms`,
              '--t': LEVELS[ch] ?? 1,
            } as React.CSSProperties
          }
        />
      )
    })
  )

  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-mark={kind}
      className={styles.mark}
      style={{ '--a': rgb, width: w * CELL, height: h * CELL } as React.CSSProperties}
    >
      {cells}
    </div>
  )
}
