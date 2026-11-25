'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useMotionValueEvent, useScroll } from 'motion/react'
import { smooth, type Box, type StoryLayout } from './storyLayout'
import { pictureFor, type Picture } from './pictures'
import PixelPicture from './PixelPicture'

// Two thirds of the hero grid's 52px (owner, 2026-11-25: smaller boxes).
const CELL = 36
// Resting cells: roughly one per this many free cells, sparse.
const DENSITY = 14
// Cells that wander (fade out, jump to a free cell on screen, fade back in):
// at most this many at once, fewer on a phone.
const WANDER = 30
// Words keep this much clear grid around them (px), so no cell sits behind or
// right against a line of text.
const CLEARANCE = 20

// Timings (ms): livelier than the hero grid (owner, 2026-11-25: "a bit slow").
const FADE = [450, 850] as const
const HOLD = [900, 2600] as const
const GAP = [60, 260] as const
const EASE = 'cubic-bezier(0.37, 0, 0.63, 1)'

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

type Spot = { x: number; y: number }
const key = ({ x, y }: Spot) => `${x},${y}`

/** The part of the story a page y belongs to: the last one that starts above it (with some lead). */
function partAt(layout: StoryLayout, y: number) {
  let id = 'intro'
  for (const part of layout.parts) if (y >= part.top - 160) id = part.id
  return id
}

const overlaps = (box: Box, l: number, t: number, r: number, b: number, pad: number) =>
  l < box.right + pad && r > box.left - pad && t < box.bottom + pad && b > box.top - pad

type Placed = { picture: Picture; cell: number; left: number; top: number; box: Box }

/**
 * Where each scene's picture goes: in the gap above the scene, on the grid,
 * clear of every block of words (by CLEARANCE), photo and sticker. It is
 * decided from the layout alone, so a scene's picture lands in the same place
 * on every visit at a given width:
 * - first at full cells over the half of the page where the scene's words
 *   are, then at full cells anywhere across the gap;
 * - then the same at half cells (a tighter drawing of the LA scene);
 * - within each, as near as it can be to the middle of the gap over the words.
 * Phones (under 768px) use half cells only. A picture that fits nowhere is
 * left out.
 */
function placePictures(layout: StoryLayout, originX: number): Placed[] {
  const wide = layout.width >= 768
  const out: Placed[] = []
  layout.parts.forEach((part, n) => {
    const above = layout.parts[n - 1]
    if (!above) return
    const words = layout.words.find((b) => b.id === `${part.id}-words`)
    const wordsLeft = words ? (words.left + words.right) / 2 < layout.width / 2 : true
    const tries: { cell: number; half: boolean }[] = wide
      ? [
          { cell: CELL, half: true },
          { cell: CELL, half: false },
          { cell: CELL / 2, half: true },
          { cell: CELL / 2, half: false },
        ]
      : [{ cell: CELL / 2, half: false }]
    for (const { cell, half } of tries) {
      const picture = pictureFor(part.id, cell < CELL)
      if (!picture) return
      // Tighter room around things at half cells, where the gaps are smaller.
      const pad =
        cell === CELL
          ? { words: CLEARANCE, photo: 12, sticker: 10 }
          : { words: 14, photo: 8, sticker: 8 }
      const w = picture.base[0].length * cell
      const h = picture.base.length * cell
      const [minX, maxX] = !half
        ? [cell / 2, layout.width - cell / 2]
        : wordsLeft
          ? [cell / 2, layout.width / 2]
          : [layout.width / 2, layout.width - cell / 2]
      const cx = wide && words ? (words.left + words.right) / 2 : layout.width / 2
      const cy = (above.bottom + part.top) / 2
      let best: { left: number; top: number; d: number } | null = null
      for (let ky = Math.floor(above.top / cell); ky * cell <= part.top; ky++) {
        const t = ky * cell
        const b = t + h
        for (let kx = Math.ceil((minX - originX) / cell); originX + kx * cell + w <= maxX; kx++) {
          const l = originX + kx * cell
          const r = l + w
          if (layout.words.some((x) => overlaps(x, l, t, r, b, pad.words))) continue
          if (layout.photos.some((x) => overlaps(x, l, t, r, b, pad.photo))) continue
          if (layout.stickers.some((x) => overlaps(x, l, t, r, b, pad.sticker))) continue
          const d = Math.hypot(l + w / 2 - cx, (t + h / 2 - cy) * 2)
          if (!best || d < best.d) best = { left: l, top: t, d }
        }
      }
      if (best) {
        const box = {
          id: picture.id,
          left: best.left,
          top: best.top,
          right: best.left + w,
          bottom: best.top + h,
        }
        out.push({ picture, cell, left: best.left, top: best.top, box })
        return
      }
    }
  })
  return out
}

/**
 * The About page's background (owner, 2026-11-25: the site's grid is the most
 * on theme; its squares must move, but never behind text). The site's square
 * grid, faint, behind the whole story, in 36px cells:
 * - Wandering cells: each fades in on a free cell on screen, holds, fades out
 *   and hops elsewhere, on its own quick random clock.
 * - Resting cells light up in a band around where you are reading, so the
 *   band travels with your scroll.
 * - Every cell takes the tint of its part of the story (sky for the intro,
 *   blue at work, cyan in LA, indigo for the setup).
 * - A pixel picture per scene in the gap above it (PixelPicture.tsx).
 * The words are kept clear: no cell lights behind or right against a block
 * of text, inside a photo, or in the footer. Nothing follows the pointer.
 * Only opacity and transform change, once per scroll frame or hop. Wanderers
 * rest while the tab is hidden. Reduced motion: the resting cells and the
 * pictures hold still, complete, and nothing wanders.
 */
export default function AboutGrid({ layout, reduce }: { layout: StoryLayout; reduce: boolean }) {
  const { scrollY } = useScroll()
  const resting = useRef<(HTMLDivElement | null)[]>([])
  const wanderers = useRef<(HTMLDivElement | null)[]>([])

  const cols = Math.ceil(layout.width / CELL) + 2
  const rows = Math.floor(layout.height / CELL)
  // The grid is centred, so its first column starts left of the page.
  const originX = (layout.width - cols * CELL) / 2

  // The pixel pictures, each in the gap above its scene, where it fits.
  const pictures = useMemo(() => placePictures(layout, originX), [layout, originX])

  /** Every cell a light may use: not behind or against words, not hidden behind a photo. */
  const free = useMemo(() => {
    const out: Spot[] = []
    // Nothing lights in the footer: it ends a little under the ways on.
    const end = layout.parts.find((p) => p.id === 'end')
    const last = end ? Math.floor((end.bottom + 104) / CELL) : rows
    for (let y = 1; y < Math.min(rows, last); y++)
      for (let x = 0; x < cols; x++) {
        const l = originX + x * CELL
        const t = y * CELL
        const r = l + CELL
        const b = t + CELL
        // Off the page's sides (only a sliver shows past the edge fade).
        if (r < 8 || l > layout.width - 8) continue
        if (layout.words.some((w) => overlaps(w, l, t, r, b, CLEARANCE))) continue
        if (layout.photos.some((p) => l >= p.left && r <= p.right && t >= p.top && b <= p.bottom))
          continue
        // Around a picture, the grid stays quiet so the picture reads.
        if (pictures.some((p) => overlaps(p.box, l, t, r, b, CELL / 2))) continue
        out.push({ x, y })
      }
    return out
  }, [cols, rows, originX, layout, pictures])

  const tintAt = (y: number) => `rgb(${TINT[partAt(layout, y * CELL + CELL / 2)]})`

  const rest = useMemo(() => {
    const rand = random(19)
    const taken = new Set<string>()
    const out: (Spot & { peak: number })[] = []
    const want = Math.round(free.length / DENSITY)
    for (let tries = 0; out.length < want && tries < want * 40; tries++) {
      const spot = free[Math.floor(rand() * free.length)]
      let clear = true
      for (let dx = -1; dx <= 1 && clear; dx++)
        for (let dy = -1; dy <= 1; dy++)
          if (taken.has(key({ x: spot.x + dx, y: spot.y + dy }))) clear = false
      if (!clear) continue
      taken.add(key(spot))
      out.push({ ...spot, peak: 0.1 + rand() * 0.1 })
    }
    return out
  }, [free])

  // The resting cells: lit in a band around the reading line.
  const paint = (scroll: number) => {
    const focus = scroll - layout.top + layout.vh * 0.5
    const band = layout.vh * 0.6
    rest.forEach((cell, i) => {
      const node = resting.current[i]
      if (!node) return
      const cy = cell.y * CELL + CELL / 2
      const v = reduce
        ? cell.peak * 0.7
        : cell.peak * smooth(band, band * 0.15, Math.abs(cy - focus))
      const next = v.toFixed(3)
      if (node.style.opacity !== next) node.style.opacity = next
    })
  }
  useEffect(() => paint(scrollY.get()))
  useMotionValueEvent(scrollY, 'change', paint)

  // The wanderers: fade out, jump to a free cell on screen (clear of the
  // resting cells and of each other), fade back in, hold, again.
  const count = Math.min(WANDER, Math.max(8, Math.round(free.length / 24)))
  useEffect(() => {
    if (reduce) return
    const nodes = wanderers.current
    const timers: ReturnType<typeof setTimeout>[] = []
    const later = (fn: () => void, ms: number) => timers.push(setTimeout(fn, ms))
    const between = ([min, max]: readonly [number, number]) => min + Math.random() * (max - min)
    const taken = new Set<string>(rest.map(key))
    const spots: (Spot | null)[] = Array(count).fill(null)

    const onScreen = () => {
      const top = scrollY.get() - layout.top
      const minY = Math.max(1, Math.ceil((top + 64) / CELL))
      const maxY = Math.floor((top + layout.vh - 24) / CELL) - 1
      return free.filter((s) => s.y >= minY && s.y <= maxY)
    }
    const clearSpot = () => {
      const choices = onScreen()
      for (let tries = 0; tries < 40 && choices.length; tries++) {
        const s = choices[Math.floor(Math.random() * choices.length)]
        let clear = true
        for (let dx = -1; dx <= 1 && clear; dx++)
          for (let dy = -1; dy <= 1; dy++)
            if (taken.has(key({ x: s.x + dx, y: s.y + dy }))) clear = false
        if (clear) return s
      }
      return null
    }
    const fade = (node: HTMLDivElement, opacity: number, ms: number) => {
      node.style.transition = `opacity ${Math.round(ms)}ms ${EASE}`
      node.style.opacity = opacity.toFixed(2)
    }
    const appear = (i: number) => {
      const node = nodes[i]
      if (!node) return
      if (document.hidden) return later(() => appear(i), 1000)
      const spot = clearSpot()
      if (!spot) return later(() => appear(i), 800)
      spots[i] = spot
      taken.add(key(spot))
      node.style.transition = 'none'
      node.style.transform = `translate3d(${spot.x * CELL + 1}px, ${spot.y * CELL + 1}px, 0)`
      node.style.background = tintAt(spot.y)
      // The jump lands while it is invisible; the fade starts on the next frame.
      requestAnimationFrame(() => {
        const fadeIn = between(FADE)
        fade(node, 0.16 + Math.random() * 0.16, fadeIn)
        later(() => vanish(i), fadeIn + between(HOLD))
      })
    }
    const vanish = (i: number) => {
      const node = nodes[i]
      if (!node) return
      if (document.hidden) return later(() => vanish(i), 1000)
      const fadeOut = between(FADE)
      fade(node, 0, fadeOut)
      later(
        () => {
          const spot = spots[i]
          if (spot) taken.delete(key(spot))
          spots[i] = null
          appear(i)
        },
        fadeOut + between(GAP)
      )
    }
    for (let i = 0; i < count; i++) later(() => appear(i), between([100, 1800]))
    return () => {
      timers.forEach(clearTimeout)
      nodes.forEach((node) => {
        if (node) node.style.opacity = '0'
      })
    }
    // tintAt reads layout, which is a dependency already.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce, count, free, rest, layout, scrollY])

  const cellStyle = { width: CELL - 1, height: CELL - 1, opacity: 0 } as const
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{
          maskImage: EDGES,
          WebkitMaskImage: EDGES,
          maskComposite: 'intersect',
          WebkitMaskComposite: 'source-in',
        }}
      >
        <div
          className="absolute top-0 h-full"
          style={{
            left: originX,
            width: cols * CELL,
            backgroundImage:
              'linear-gradient(to right, rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.045) 1px, transparent 1px)',
            backgroundSize: `${CELL}px ${CELL}px`,
          }}
        >
          {rest.map((cell, i) => (
            <div
              key={key(cell)}
              ref={(el) => {
                resting.current[i] = el
              }}
              data-rest=""
              className="absolute top-0 left-0"
              style={{
                ...cellStyle,
                transform: `translate3d(${cell.x * CELL + 1}px, ${cell.y * CELL + 1}px, 0)`,
                background: tintAt(cell.y),
              }}
            />
          ))}
          {Array.from({ length: count }, (_, i) => (
            <div
              key={`w${i}`}
              ref={(el) => {
                wanderers.current[i] = el
              }}
              data-wander=""
              className="absolute top-0 left-0"
              style={cellStyle}
            />
          ))}
        </div>
      </div>
      {/* The pictures, on the same grid but outside its edge fade. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        {pictures.map((p) => (
          // A new drawing (another cell size) is a new picture.
          <PixelPicture
            key={`${p.picture.id}-${p.cell}`}
            picture={p.picture}
            cell={p.cell}
            left={p.left}
            top={p.top}
            reduce={reduce}
          />
        ))}
      </div>
    </>
  )
}
