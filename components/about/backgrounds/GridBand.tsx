'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useMotionValueEvent, useScroll } from 'motion/react'
import { smooth, type StoryLayout } from './shared'

const CELL = 52
// Roughly one lit cell per this many cells: sparse, so each reads on its own.
const DENSITY = 13

/** The tint of each part of the story, in the site's sky, blue and cyan. */
const TINT: Record<string, string> = {
  intro: '56,189,248', // sky-400
  work: '59,130,246', // blue-500
  la: '34,211,238', // cyan-400
  setup: '129,140,248', // indigo-400
  end: '56,189,248',
}

// The grid melts into the page: in at the top, out before the footer, and
// toward the left and right edges (the two masks intersected).
const EDGES =
  'linear-gradient(to bottom, transparent, black 160px, black calc(100% - 900px), transparent calc(100% - 420px)), linear-gradient(to right, transparent, black clamp(32px, 12%, 280px), black calc(100% - clamp(32px, 12%, 280px)), transparent)'

function random(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) >>> 0
    let t = seed
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

interface Cell {
  x: number
  y: number
  /** Page y of its centre, in px from the top of main. */
  cy: number
  fill: string
  peak: number
}

/** The part of the story a page y belongs to: the last one that starts above it (with some lead). */
function partAt(layout: StoryLayout, y: number) {
  let id = 'intro'
  for (const part of layout.parts) if (y >= part.top - 160) id = part.id
  return id
}

/**
 * Option 1: the site's square grid, faint, behind the whole story. Its cells
 * light up in a band around where you are reading, so the band travels with
 * your scroll, and they take the tint of the part of the story they sit in
 * (sky for the intro, blue at work, cyan in LA, indigo for the setup). Only
 * the cells' opacity changes, once per scroll frame. Reduced motion: the
 * cells rest, all softly lit.
 */
export default function GridBand({ layout, reduce }: { layout: StoryLayout; reduce: boolean }) {
  const { scrollY } = useScroll()
  const nodes = useRef<(HTMLDivElement | null)[]>([])

  const cols = Math.ceil(layout.width / CELL) + 2
  const rows = Math.floor(layout.height / CELL)
  const cells = useMemo(() => {
    const rand = random(19)
    const taken = new Set<string>()
    const out: Cell[] = []
    const want = Math.round((cols * rows) / DENSITY)
    for (let tries = 0; out.length < want && tries < want * 40; tries++) {
      const x = Math.floor(rand() * cols)
      const y = 1 + Math.floor(rand() * (rows - 1))
      let clear = true
      for (let dx = -1; dx <= 1 && clear; dx++)
        for (let dy = -1; dy <= 1; dy++) if (taken.has(`${x + dx},${y + dy}`)) clear = false
      if (!clear) continue
      taken.add(`${x},${y}`)
      const cy = y * CELL + CELL / 2
      out.push({ x, y, cy, fill: `rgb(${TINT[partAt(layout, cy)]})`, peak: 0.1 + rand() * 0.12 })
    }
    return out
  }, [cols, rows, layout])

  const paint = (scroll: number) => {
    const focus = scroll - layout.top + layout.vh * 0.5
    const band = layout.vh * 0.6
    cells.forEach((cell, i) => {
      const node = nodes.current[i]
      if (!node) return
      const v = reduce ? cell.peak * 0.6 : cell.peak * smooth(band, band * 0.15, Math.abs(cell.cy - focus))
      const next = v.toFixed(3)
      if (node.style.opacity !== next) node.style.opacity = next
    })
  }
  useEffect(() => paint(scrollY.get()))
  useMotionValueEvent(scrollY, 'change', paint)

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ maskImage: EDGES, WebkitMaskImage: EDGES, maskComposite: 'intersect', WebkitMaskComposite: 'source-in' }}
    >
      <div
        className="absolute top-0 left-1/2 h-full -translate-x-1/2"
        style={{
          width: cols * CELL,
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.045) 1px, transparent 1px)',
          backgroundSize: `${CELL}px ${CELL}px`,
        }}
      >
        {cells.map((cell, i) => (
          <div
            key={`${cell.x},${cell.y}`}
            ref={(el) => {
              nodes.current[i] = el
            }}
            className="absolute"
            style={{
              left: cell.x * CELL + 1,
              top: cell.y * CELL + 1,
              width: CELL - 1,
              height: CELL - 1,
              background: cell.fill,
              opacity: 0,
            }}
          />
        ))}
      </div>
    </div>
  )
}
