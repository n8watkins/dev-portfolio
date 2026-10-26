'use client'
import { useEffect, useId, useRef } from 'react'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

const CELL = 52
const COLS = 40 // 2080px: covers the widest common screens
const ROWS = 20

/** Small deterministic PRNG (mulberry32), so the lit cells match on server and client. */
function random(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) >>> 0
    let t = seed
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Deep blues for the lit cells: dim enough to stay a backdrop.
const TONES = ['#0c1836', '#13234d', '#0f1f52', '#16285a']
// At most this many cells are lit at once (fewer on a smaller screen, see
// litFor). Each one wanders: it fades out, jumps to a random free cell, and
// fades back in, all on its own random clock.
const LIT = 36
// Roughly one lit cell per this many cells of the visible band: sparse, so
// each lit block reads on its own.
const DENSITY = 12
// The rows lit cells may use, across the grid's full width (the server
// places them here, unlit); once running, they keep to the part on screen.
const SPAWN = { minX: 0, maxX: COLS - 1, minY: 2, maxY: 13 }
// Lit cells keep this share of the screen's width clear at each side, where
// the side fade (the mask below) would all but hide them.
const EDGE = 0.03
// A soft ease in and out (sine), so a cell neither pops on nor snaps off.
const EASE = 'cubic-bezier(0.37, 0, 0.63, 1)'
// Timings (ms): between the original calm pace and a livelier one. Holds are
// long next to the fades, so most cells are lit at any moment.
const FADE = [1400, 2200] as const
const HOLD = [2500, 6000] as const
const GAP = [150, 700] as const
// At most this share of the lit cells may be dark or fading at once; a cell
// due to fade out waits its turn, so the lit count stays steady.
const MAX_OUT = 0.25

type Spot = { x: number; y: number }
type Cell = Spot & { fill: string; peak: number }
type Band = { minX: number; maxX: number; minY: number; maxY: number }

const key = ({ x, y }: Spot) => `${x},${y}`
/**
 * True if the spot and its 8 neighbours are all dark: lit cells never share
 * an edge or a corner, so each one reads as its own block.
 */
const isClear = (taken: Set<string>, { x, y }: Spot) => {
  for (let dx = -1; dx <= 1; dx++)
    for (let dy = -1; dy <= 1; dy++) if (taken.has(key({ x: x + dx, y: y + dy }))) return false
  return true
}
const pick = (band: Band, rand: () => number): Spot => ({
  x: band.minX + Math.floor(rand() * (band.maxX - band.minX + 1)),
  y: band.minY + Math.floor(rand() * (band.maxY - band.minY + 1)),
})
/** A clear spot in the band, or null if 60 random tries found none. */
const clearSpot = (taken: Set<string>, band: Band, rand: () => number) => {
  for (let tries = 0; tries < 60; tries++) {
    const spot = pick(band, rand)
    if (isClear(taken, spot)) return spot
  }
  return null
}

/**
 * The cells the visitor can actually see: the columns on screen (the grid is
 * wider than most screens and centred) bar a sliver at each edge, and the
 * rows inside the solid part of the fade mask (down to ~80% of the hero).
 */
function visibleBand(svg: SVGSVGElement): Band {
  const box = svg.getBoundingClientRect()
  const width = document.documentElement.clientWidth
  const edge = width * EDGE
  const minX = Math.max(SPAWN.minX, Math.ceil((edge - box.left) / CELL))
  const maxX = Math.min(SPAWN.maxX, Math.floor((width - edge - box.left) / CELL) - 1)
  const maxY = Math.min(
    ROWS - 1,
    Math.max(SPAWN.minY + 2, Math.floor((box.height * 0.8) / CELL) - 1)
  )
  return { minX, maxX: Math.max(minX + 2, maxX), minY: SPAWN.minY, maxY }
}
/**
 * The cells hidden behind the portrait (an opaque circle): never lit, so
 * every lit cell can be seen. Returned as taken spots for isClear.
 */
function hiddenCells(svg: SVGSVGElement, band: Band): Set<string> {
  const hidden = new Set<string>()
  const portrait = svg
    .closest('#home')
    ?.querySelector('[data-hero-portrait]')
    ?.getBoundingClientRect()
  if (!portrait || !portrait.width) return hidden
  const box = svg.getBoundingClientRect()
  for (let x = band.minX; x <= band.maxX; x++)
    for (let y = band.minY; y <= band.maxY; y++) {
      const cx = box.left + x * CELL + CELL / 2
      const cy = box.top + y * CELL + CELL / 2
      if (cx > portrait.left && cx < portrait.right && cy > portrait.top && cy < portrait.bottom)
        hidden.add(key({ x, y }))
    }
  return hidden
}
/** How many cells to light in a band: spread over all of it, sparse. */
const litFor = (band: Band, hidden: number) =>
  Math.min(
    LIT,
    Math.max(
      5,
      Math.round(((band.maxX - band.minX + 1) * (band.maxY - band.minY + 1) - hidden) / DENSITY)
    )
  )

/**
 * Starting spots for the lit cells (a fixed seed, so server and client match).
 * They render unlit; once the page is running they move into view, warm up
 * one by one, then wander at random.
 */
const initialCells: Cell[] = (() => {
  const rand = random(8)
  const taken = new Set<string>()
  const cells: Cell[] = []
  while (cells.length < LIT) {
    const spot = clearSpot(taken, SPAWN, rand)!
    taken.add(key(spot))
    cells.push({
      ...spot,
      fill: TONES[Math.floor(rand() * TONES.length)],
      peak: 0.45 + rand() * 0.4,
    })
  }
  return cells
})()

/**
 * The hero's backdrop: a dim grid whose lit cells warm up, then wander.
 * Ported 1:1 from n8builds-web (components/sections/HeroGrid.tsx); only the
 * page colour in its washes and the portrait marker differ.
 */
export default function HeroGrid() {
  const id = useId()
  const svgRef = useRef<SVGSVGElement>(null)
  const rects = useRef<(SVGRectElement | null)[]>([])
  const reduceMotion = usePrefersReducedMotion()

  // Warm-up, then wander. The grid starts dark; the cells first move to the
  // part of the grid on screen (never behind the portrait), then each fades
  // in at a random moment over the first few seconds and loops (fade out,
  // move, fade in, hold) with random durations, so the pattern never repeats.
  // Only a quarter of the cells may be dark or fading at once, so a steady
  // number is lit at every moment. A cell keeps its spot (and its
  // neighbours stay off limits) until it has fully faded out, so no two lit
  // cells ever touch, even mid-fade. Only opacity transitions (cheap to
  // composite), and the DOM is touched a few times per second. While the hero
  // is off screen (HeroChainMeter sets data-offscreen) or the tab is hidden,
  // cells finish their fade and then wait instead of moving. Reduced motion
  // shows the set, still.
  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const band = visibleBand(svg)
    const hidden = hiddenCells(svg, band)
    const count = litFor(band, hidden.size)
    // Spots in use (lit, or still fading out) plus the hidden ones.
    const taken = new Set<string>(hidden)
    const spots: (Spot | null)[] = initialCells.map((_, i) => {
      if (i >= count) return null
      const spot = clearSpot(taken, band, Math.random)
      if (spot) taken.add(key(spot))
      return spot
    })
    const maxOut = Math.max(1, Math.floor(spots.filter(Boolean).length * MAX_OUT))
    let out = 0
    const place = (rect: SVGRectElement, spot: Spot) => {
      rect.setAttribute('x', String(spot.x * CELL + 1))
      rect.setAttribute('y', String(spot.y * CELL + 1))
      rect.dataset.x = String(spot.x)
      rect.dataset.y = String(spot.y)
    }
    spots.forEach((spot, i) => {
      const rect = rects.current[i]
      if (rect && spot) place(rect, spot)
    })

    if (reduceMotion) {
      spots.forEach((spot, i) => {
        const rect = rects.current[i]
        if (rect && spot) rect.style.opacity = String(initialCells[i].peak)
      })
      return
    }
    const timers: ReturnType<typeof setTimeout>[] = []
    const hero = svg.closest<HTMLElement>('#home')
    // Marks the hero data-offscreen while it is scrolled away, so the cells
    // rest (on n8builds.dev, HeroChainMeter sets it; here the grid does).
    const observer =
      hero && typeof IntersectionObserver !== 'undefined'
        ? new IntersectionObserver(([entry]) =>
            hero.toggleAttribute('data-offscreen', !entry.isIntersecting)
          )
        : null
    if (hero) observer?.observe(hero)
    const later = (fn: () => void, ms: number) => timers.push(setTimeout(fn, ms))
    const between = ([min, max]: readonly [number, number]) => min + Math.random() * (max - min)
    const resting = () => document.hidden || !!hero?.hasAttribute('data-offscreen')
    const fade = (rect: SVGRectElement, opacity: number | string, ms: number) => {
      rect.style.transition = `opacity ${ms}ms ${EASE}`
      rect.style.opacity = String(opacity)
    }

    const cycle = (i: number, current: Spot) => {
      const rect = rects.current[i]
      if (!rect) return
      if (resting()) return later(() => cycle(i, current), 1000)
      if (out >= maxOut) return later(() => cycle(i, current), 300 + Math.random() * 400)
      out++
      const fadeOut = between(FADE)
      fade(rect, 0, fadeOut)
      later(
        () => {
          taken.delete(key(current))
          // The band is measured again, so a resize moves cells into view.
          const next = clearSpot(taken, visibleBand(svg), Math.random) ?? current
          taken.add(key(next))
          place(rect, next)
          rect.setAttribute('fill', TONES[Math.floor(Math.random() * TONES.length)])
          const fadeIn = between(FADE)
          fade(rect, (0.45 + Math.random() * 0.4).toFixed(2), fadeIn)
          // Counts as lit again once it's halfway in.
          later(() => out--, fadeIn / 2)
          later(() => cycle(i, next), fadeIn + between(HOLD))
        },
        fadeOut + between(GAP)
      )
    }

    spots.forEach((spot, i) => {
      if (!spot) return
      later(
        () => {
          const rect = rects.current[i]
          if (!rect) return
          const fadeIn = between(FADE)
          fade(rect, initialCells[i].peak, fadeIn)
          later(() => cycle(i, spot), fadeIn + between(HOLD))
        },
        between([300, 5000])
      )
    })
    return () => {
      timers.forEach(clearTimeout)
      observer?.disconnect()
    }
  }, [reduceMotion])

  return (
    <div
      // Faded out at the top and bottom, and at the left and right edges
      // (the two masks intersect), so the grid melts into the page.
      className="hero-grid-mask absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      <svg
        ref={svgRef}
        className="absolute left-1/2 top-0 h-full -translate-x-1/2"
        width={COLS * CELL}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id={id} width={CELL} height={CELL} patternUnits="userSpaceOnUse">
            <path
              d={`M.5 ${CELL}V.5H${CELL}`}
              fill="none"
              stroke="rgba(255,255,255,0.055)"
              strokeWidth="1"
            />
          </pattern>
        </defs>

        <rect width="100%" height="100%" fill={`url(#${id})`} />

        {initialCells.map(({ x, y, fill }, i) => (
          <rect
            key={i}
            ref={(el) => {
              rects.current[i] = el
            }}
            fill={fill}
            style={{ opacity: 0 }}
            data-cell=""
            data-x={x}
            data-y={y}
            x={x * CELL + 1}
            y={y * CELL + 1}
            width={CELL - 1}
            height={CELL - 1}
          />
        ))}
      </svg>

      {/* A dark wash over the whole grid, so the hero's text reads on top of
          it; then fade it out toward the far edges so it stays a quiet backdrop. */}
      <div className="absolute inset-0 bg-darkBlue/35" />
      {/* Fade the grid out toward the far edges so it stays a quiet backdrop. */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_75%_at_50%_45%,transparent_40%,#0f172a_100%)]" />
    </div>
  )
}
