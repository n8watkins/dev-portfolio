'use client'

import { useEffect, useRef } from 'react'
import { DINO_COLS, DINO_FRAMES, DINO_ROWS, framePaths, type DinoFrame } from './sprite'

/**
 * The easter egg itself (loaded lazily by DinoEasterEgg.tsx). A pixel dino
 * walks along the top of the first marquee row, hopping each gap between the
 * tiles as they scroll by. When the visitor pauses the row it is on (hovering
 * it, or focusing or tapping a tile), the dino mistimes its next jump and falls
 * through a gap to the next row, the next level, where it walks the other way.
 * Falling off the last row, it drops back in at the top left and starts over.
 * A panel with a single row gets a solid ground line under it as its second
 * level.
 *
 * Clicking (or tapping) the dino makes it roar: a pixel "RAWR!" bubble pops
 * up and, if it is walking, it backflips on the spot, changing colour each
 * time. Only its own small box takes the pointer, so the tiles around it stay
 * clickable; it is decorative and hidden from assistive tech. Now and then
 * it says something in a smaller bubble (DINO_LINES), the first a few seconds
 * in, hinting that it can be clicked.
 *
 * It runs on requestAnimationFrame with direct DOM writes (no React renders
 * per frame, no motion library), and stops while the panel is off screen or
 * the tab is hidden.
 */

const PX = 2 // screen pixels per sprite pixel
const W = DINO_COLS * PX
const H = DINO_ROWS * PX
// Walking speed relative to the tiles underfoot, px/s. The rows carry the
// dino along (they move the way it walks), so on screen it goes about 165.
const SPEED = 140
const GRAVITY = 1800 // px/s²
const STEP_EVERY = 12 // px walked per leg swap
const STILL = 2 // px/s: a row moving slower than this is paused
const LANDING = 20 // px past the far edge of a gap that a hop lands

type Mode = 'walk' | 'hop' | 'miss' | 'fall' | 'flip'

interface Row {
  el: HTMLElement
  /** The loop copies of the row's items, each moving with the marquee. */
  tracks: HTMLElement[]
  /** Each tile's [left, right], relative to its track. */
  tiles: [number, number][]
  /** The tiles' top edge, relative to the panel: the level's floor. */
  top: number
  /** Last frame's position of the first track (to measure the row's speed). */
  lastLeft: number | null
  /** How far the row moved this frame, px (measured, so exact at any frame rate). */
  delta: number
  velocity: number
  paused: boolean
}

interface Level {
  y: number
  /** The row the level is the top of; none for the solid ground line. */
  row: Row | null
}

const COLORS = { body: '#cfdbe9', eye: '#081427', shine: '#ffffff' } as const
// Each roar moves the body on to the next colour (blue/cyan family and warm
// accents, no purple).
const BODY_COLORS = ['#cfdbe9', '#67e8f9', '#fbbf24', '#86efac', '#fb923c', '#38bdf8'] as const
const ROAR_FOR = 1.1 // s the bubble stays up
const FLIP_T = 0.7 // s per backflip

// The "RAWR!" bubble, in the dino's pixel style: dark text on a light bubble
// with notched corners, its tail pointing down at the dino's mouth ('left' or
// 'right'). 'f' is the bubble, 't' the text.
const GLYPHS: Record<string, string[]> = {
  A: ['.#.', '#.#', '###', '#.#', '#.#'],
  B: ['##.', '#.#', '##.', '#.#', '##.'],
  C: ['.##', '#..', '#..', '#..', '.##'],
  D: ['##.', '#.#', '#.#', '#.#', '##.'],
  E: ['###', '#..', '##.', '#..', '###'],
  F: ['###', '#..', '##.', '#..', '#..'],
  G: ['.##', '#..', '#.#', '#.#', '.##'],
  H: ['#.#', '#.#', '###', '#.#', '#.#'],
  I: ['###', '.#.', '.#.', '.#.', '###'],
  J: ['..#', '..#', '..#', '#.#', '.#.'],
  K: ['#.#', '#.#', '##.', '#.#', '#.#'],
  L: ['#..', '#..', '#..', '#..', '###'],
  M: ['#...#', '##.##', '#.#.#', '#...#', '#...#'],
  N: ['#..#', '##.#', '#.##', '#..#', '#..#'],
  O: ['###', '#.#', '#.#', '#.#', '###'],
  P: ['###', '#.#', '###', '#..', '#..'],
  Q: ['###', '#.#', '#.#', '###', '..#'],
  R: ['###', '#.#', '##.', '#.#', '#.#'],
  S: ['.##', '#..', '.#.', '..#', '##.'],
  T: ['###', '.#.', '.#.', '.#.', '.#.'],
  U: ['#.#', '#.#', '#.#', '#.#', '###'],
  V: ['#.#', '#.#', '#.#', '#.#', '.#.'],
  W: ['#...#', '#...#', '#.#.#', '#.#.#', '.#.#.'],
  X: ['#.#', '#.#', '.#.', '#.#', '#.#'],
  Y: ['#.#', '#.#', '.#.', '.#.', '.#.'],
  Z: ['###', '..#', '.#.', '#..', '###'],
  '!': ['#', '#', '#', '.', '#'],
  '?': ['###', '..#', '.##', '...', '.#.'],
  '.': ['.', '.', '.', '.', '#'],
  "'": ['#', '#', '.', '.', '.'],
  ' ': ['.', '.', '.', '.', '.'],
}
function bubbleRows(text: string, tail: 'left' | 'right') {
  const word = text
    .toUpperCase()
    .split('')
    .map((c) => GLYPHS[c] ?? GLYPHS[' '])
    .reduce((acc, g, i) => acc.map((row, y) => row + (i ? '.' : '') + g[y]), ['', '', '', '', ''])
  const lines = word.map((row) => 'fff' + row.replace(/#/g, 't').replace(/\./g, 'f') + 'fff')
  const w = lines[0].length
  const rows = [
    '.' + 'f'.repeat(w - 2) + '.',
    'f'.repeat(w),
    ...lines,
    'f'.repeat(w),
    '.' + 'f'.repeat(w - 2) + '.',
    '.fff' + '.'.repeat(w - 4),
    'ff' + '.'.repeat(w - 2),
  ]
  const mirror = (row: string) => row.split('').reverse().join('')
  // Only the tail flips; the word always reads left to right.
  return tail === 'left' ? rows : [...rows.slice(0, -2), ...rows.slice(-2).map(mirror)]
}
function bubblePaths(rows: string[]) {
  let ink = ''
  let fill = ''
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      if (row[x] === 't') ink += `M${x} ${y}h1v1h-1z`
      else if (row[x] === 'f') fill += `M${x} ${y}h1v1h-1z`
    }
  })
  return { ink, fill, cols: rows[0].length, rows: rows.length }
}
function makeBubble(text: string, px: number) {
  const left = bubblePaths(bubbleRows(text, 'left'))
  const right = bubblePaths(bubbleRows(text, 'right'))
  return { left, right, w: left.cols * px, h: left.rows * px }
}
type Bubble = ReturnType<typeof makeBubble>
// The roar is a touch chunkier than the dino, so the word reads.
const ROAR = makeBubble('RAWR!', 3)

/**
 * Things the dino says now and then while it walks, in this order, each once
 * per visit: smaller and quieter than the roar. The first comes a few seconds
 * in and hints that it can be clicked (skipped once it has been). Edit freely:
 * letters, ! ? . ' and spaces (the pixel font has no digits).
 */
export const DINO_LINES = ['Psst... click me', "Can't catch me!", 'Hop hop', 'RAWR!!!']
const CLICK_HINTS = new Set([0]) // lines that only make sense before a click
const LINES = DINO_LINES.map((line) => makeBubble(line, 2))
const FIRST_LINE_AFTER = 4 // s of walking in view before the first line
const LINE_GAP = [15, 25] as const // s between lines (walking in view)
const LINE_FOR = 2.6 // s a line stays up
const LINE_KEY = 'n8-dino-line' // sessionStorage: the next line to say
/**
 * The E2E tests shorten the line waits (tests/e2e/ai-kit.spec.ts sets this
 * before the page loads) so they don't sit through 4-25s of walking; nothing
 * on the site sets it.
 */
interface DinoTiming {
  firstLineAfter?: number
  lineGap?: readonly [number, number]
}
// Only the current frame shows (the root's data-frame); spelled out in full so
// Tailwind's scanner sees each class.
const FRAME_CLASS: Record<DinoFrame, string> = {
  stepA: 'hidden group-data-[frame=stepA]/dino:inline',
  stepB: 'hidden group-data-[frame=stepB]/dino:inline',
  hop: 'hidden group-data-[frame=hop]/dino:inline',
  fall: 'hidden group-data-[frame=fall]/dino:inline',
}
const FRAMES = (Object.keys(DINO_FRAMES) as DinoFrame[]).map((name) => ({
  name,
  paths: framePaths(DINO_FRAMES[name]),
}))

export default function DinoGame() {
  const dinoRef = useRef<HTMLDivElement>(null)
  const bubbleRef = useRef<HTMLDivElement>(null)
  const linesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const dino = dinoRef.current
    const bubble = bubbleRef.current
    const lineEls = [...(linesRef.current?.children ?? [])] as HTMLElement[]
    const panel = dino?.closest<HTMLElement>('[data-dino-panel]')
    if (!dino || !bubble || !panel) return

    let rows: Row[] = []
    let levels: Level[] = []
    let panelW = 0
    let panelH = 0

    const measure = () => {
      const box = panel.getBoundingClientRect()
      panelW = box.width
      panelH = box.height
      rows = [...panel.querySelectorAll<HTMLElement>('[data-marquee-row]')].flatMap((el): Row[] => {
        const tracks = [...el.children] as HTMLElement[]
        const first = tracks[0]
        const figures = first ? ([...first.children] as HTMLElement[]) : []
        if (!first || figures.length === 0) return []
        const trackLeft = first.getBoundingClientRect().left
        const tiles = figures.map((f): [number, number] => {
          const r = f.getBoundingClientRect()
          return [r.left - trackLeft, r.right - trackLeft]
        })
        const top = figures[0].getBoundingClientRect().top - box.top
        return [{ el, tracks, tiles, top, lastLeft: null, delta: 0, velocity: 0, paused: false }]
      })
      levels = rows.map((row) => ({ y: row.top, row }))
      // One row: a ground line under it is the second level.
      if (rows.length === 1) {
        const bottom = rows[0].el.getBoundingClientRect().bottom - box.top
        levels.push({ y: Math.min(bottom + 4, panelH - 6), row: null })
      }
    }

    // Tile intervals of a row right now, in panel coordinates.
    const intervals = (row: Row, panelLeft: number) => {
      const out: [number, number][] = []
      for (const track of row.tracks) {
        const left = track.getBoundingClientRect().left - panelLeft
        for (const [a, b] of row.tiles) out.push([left + a, left + b])
      }
      return out
    }

    // State
    let level = -1 // -1: dropping in from above the first level
    let dir: 1 | -1 = 1
    let mode: Mode = 'fall'
    let x = 0
    let y = -H
    let vy = 0
    let carry = 0 // horizontal speed while falling (the row it fell from)
    let hop = { t: 0, T: 0, h: 0, floor: 0, vx: 0 }
    let walked = 0
    let missPending = false
    let frame: DinoFrame = 'fall'
    let settled = 0 // frames measured so far (pauses count once rows are known)
    // Just came back in at the other end of a level: walk on (in the edge
    // fade) until there is a tile underfoot, rather than dropping straight in.
    let reentering = false
    // The click easter egg.
    let roars = 0
    let roarLeft = 0 // s the bubble has left
    // What it says now and then (DINO_LINES), each once per visit.
    let nextLine = 0
    try {
      nextLine = Number(sessionStorage.getItem(LINE_KEY)) || 0
    } catch {
      // Storage blocked: start from the first line on every page view.
    }
    const timing = (window as { __n8DinoTiming?: DinoTiming }).__n8DinoTiming
    const lineGap = timing?.lineGap ?? LINE_GAP
    let lineWait = timing?.firstLineAfter ?? FIRST_LINE_AFTER
    let line = -1 // the line showing, if any
    let lineLeft = 0
    let flip = { t: 0, h: 0, floor: 0 }
    let angle = 0

    const respawn = () => {
      level = -1
      dir = 1
      mode = 'fall'
      x = Math.max(16, panelW * 0.15)
      y = -H
      vy = 0
      carry = 0
    }

    const support = (foot: number, spans: [number, number][]) =>
      spans.find(([a, b]) => foot >= a && foot <= b)

    const land = (target: Level, spans: [number, number][] | null) => {
      // Nudge onto the nearest tile if the dino would land in a gap.
      if (spans && !support(x + W / 2, spans)) {
        let best = Infinity
        for (const [a, b] of spans) {
          const foot = x + W / 2
          const delta = foot < a ? a + 2 - foot : foot > b ? b - 2 - foot : 0
          if (Math.abs(delta) < Math.abs(best)) best = delta
        }
        if (Math.abs(best) < 40) x += best
      }
      y = target.y
      vy = 0
      mode = 'walk'
    }

    let raf = 0
    let last = 0
    let running = false
    let onScreen = false
    let lastDataset = ''

    // A bubble comes out of its mouth (at the height it stands, not where a
    // flip takes it): beside its head on the side it faces, or the other if
    // that is off the panel. Beside, not above: the top row has little room
    // overhead. It pops in quickly and out at the end.
    const place = (el: HTMLElement, b: Bubble, left: number, total: number) => {
      if (left <= 0) {
        el.style.visibility = 'hidden'
        return
      }
      const floor = mode === 'flip' ? flip.floor : y
      let side: 'left' | 'right' = dir > 0 ? 'right' : 'left'
      if (side === 'right' && x + W + 2 + b.w > panelW - 4) side = 'left'
      else if (side === 'left' && x - 2 - b.w < 4) side = 'right'
      const bx = side === 'right' ? x + W + 2 : x - 2 - b.w
      const by = Math.max(floor - H - b.h + 12, 2)
      const scale = Math.max(Math.min(1, 0.5 + (total - left) * 6, left * 8), 0)
      el.dataset.tail = side === 'right' ? 'left' : 'right'
      el.style.transformOrigin = side === 'right' ? 'bottom left' : 'bottom right'
      el.style.transform = `translate3d(${bx.toFixed(1)}px, ${by.toFixed(1)}px, 0) scale(${scale.toFixed(2)})`
      el.style.visibility = 'visible'
    }

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      // The dino's own clock is capped (a long stall doesn't fling it); the
      // rows are measured, so they always count in full.
      const realDt = last ? (now - last) / 1000 : 0
      const dt = Math.min(realDt, 0.05)
      last = now
      if (!dt) return
      const panelLeft = panel.getBoundingClientRect().left

      const current = levels[level]

      // Row speeds, and whether the visitor just paused the one the dino is
      // on. A pause of any other row (hovered, tapped or focused) leaves its
      // jumps alone: the row under its feet is still moving.
      for (const row of rows) {
        const left = row.tracks[0].getBoundingClientRect().left
        row.delta = 0
        if (row.lastLeft !== null) {
          // The loop jumps the track back by one copy each time round: take
          // the step that is less than half a copy.
          const period =
            row.tracks.length > 1 ? row.tracks[1].getBoundingClientRect().left - left : Infinity
          let delta = left - row.lastLeft
          if (delta > period / 2) delta -= period
          else if (delta < -period / 2) delta += period
          row.delta = delta
          row.velocity = delta / realDt
          const paused = Math.abs(row.velocity) < STILL
          if (paused && !row.paused && settled > 10 && row === current?.row) missPending = true
          row.paused = paused
        }
        row.lastLeft = left
      }
      settled++

      const spans = current?.row ? intervals(current.row, panelLeft) : null
      // On a row (walking, hopping off it, flipping), the dino rides along
      // with it: moved by exactly what the tiles moved this frame, so a slow
      // frame can never slide the tile out from under its feet.
      if (current?.row && (mode === 'walk' || mode === 'hop' || mode === 'miss' || mode === 'flip'))
        x += current.row.delta
      const foot = x + W / 2

      if (mode === 'walk' && current && line >= 0 && spans && support(foot, spans)) {
        // Saying something: it stops to talk, riding along on its tile, so
        // the line stays put long enough to read (on a phone too).
        frame = 'stepA'
      } else if (mode === 'walk' && current) {
        x += dir * SPEED * dt
        walked += SPEED * dt
        if (walked >= STEP_EVERY) {
          walked = 0
          frame = frame === 'stepA' ? 'stepB' : 'stepA'
        }
        if (frame !== 'stepA' && frame !== 'stepB') frame = 'stepA'
        if (spans) {
          const under = support(foot, spans)
          if (under) reentering = false
          if (!under && reentering) {
            // Still off the edge: keep walking.
          } else if (!under) {
            mode = 'fall'
            carry = current.row?.velocity ?? 0
          } else {
            const edge = dir > 0 ? under[1] : under[0]
            const ahead = (edge - foot) * dir
            // Within one frame's step of the edge (relative to the tile).
            if (ahead >= 0 && ahead < Math.max(5, (SPEED + 40) * dt + 1)) {
              // The next tile's near edge, to size the jump.
              const next = spans
                .map(([a, b]) => (dir > 0 ? a : b))
                .filter((e) => (e - edge) * dir > 0)
                .sort((p, q) => (p - edge) * dir - (q - edge) * dir)[0]
              const gap = next === undefined ? 16 : Math.abs(next - edge)
              if (missPending) {
                // Mistimed: a late little hop that comes down in the gap
                // (relative to the row, which carries it along meanwhile).
                const T = 0.24
                const target = edge + dir * gap * 0.5
                hop = { t: 0, T, h: 6, floor: current.y, vx: (target - foot) / T }
                mode = 'miss'
                carry = current.row?.velocity ?? 0
                missPending = false
              } else {
                // A lunge sized to the gap: it clears it and lands a little
                // way onto the next tile (relative to the row, which carries
                // it along meanwhile), in an arc that grows with it.
                const reach = gap + LANDING
                const T = Math.min(Math.max(reach / (SPEED * 1.4), 0.26), 0.6)
                // The top row's arc stays inside the panel (which clips).
                const h = Math.min(8 + gap * 0.4, current.y - H - 2)
                hop = { t: 0, T, h, floor: current.y, vx: (dir * reach) / T }
                mode = 'hop'
              }
            }
          }
        }
      } else if (mode === 'hop' || mode === 'miss') {
        hop.t += dt
        const p = Math.min(hop.t / hop.T, 1)
        x += hop.vx * dt
        y = hop.floor - hop.h * 4 * p * (1 - p)
        frame = mode === 'miss' ? 'fall' : 'hop'
        if (p >= 1) {
          y = hop.floor
          if (mode === 'hop' && spans && support(x + W / 2, spans)) {
            mode = 'walk'
            frame = 'stepA'
          } else {
            // A miss already carries the row's speed; a hop that came up
            // short drifts with the row it left.
            if (mode === 'hop') carry = current?.row?.velocity ?? 0
            mode = 'fall'
            vy = 0
          }
        }
      } else if (mode === 'flip') {
        // Rides along with its tile while it spins.
        flip.t += dt
        const p = Math.min(flip.t / FLIP_T, 1)
        y = flip.floor - flip.h * 4 * p * (1 - p)
        // Eased so it tucks fast at the top and lands upright.
        angle = -360 * (p < 0.5 ? 2 * p * p : 1 - 2 * (1 - p) * (1 - p))
        frame = 'hop'
        if (p >= 1) {
          y = flip.floor
          angle = 0
          mode = 'walk'
          frame = 'stepA'
        }
      } else if (mode === 'fall') {
        frame = 'fall'
        vy += GRAVITY * dt
        y += vy * dt
        x += carry * dt
        const target = levels[level + 1]
        if (target && y >= target.y) {
          level += 1
          // A miss meant for the row it left doesn't carry over.
          missPending = false
          // Every level after the first walks the other way.
          if (level > 0) dir = dir > 0 ? -1 : 1
          land(target, target.row ? intervals(target.row, panelLeft) : null)
          frame = 'stepA'
        } else if (!target && y > panelH + H) {
          respawn()
        }
      }

      // Off one end of a level: come back in at the other.
      if (mode === 'walk') {
        if (dir > 0 && x > panelW) {
          x = -W
          reentering = true
        } else if (dir < 0 && x < -W) {
          x = panelW
          reentering = true
        }
        // A line it was saying ends as it walks off.
        if (reentering && line >= 0) lineLeft = Math.min(lineLeft, 0.1)
        // Ground lines have no gaps to fall through: leaving one ends the run.
        if (current && !current.row && (x <= -W || x >= panelW)) respawn()
      }

      dino.style.transform = `translate3d(${x.toFixed(1)}px, ${(y - H).toFixed(1)}px, 0) scaleX(${dir}) rotate(${angle.toFixed(1)}deg)`

      // Now and then it says something: counted while it walks in plain
      // view (clear of the edge fades, so the line is seen), never over a
      // roar.
      const clear = x > panelW * 0.22 && x + W < panelW * 0.78
      if (line < 0 && roarLeft <= 0 && mode === 'walk' && clear && nextLine < LINES.length) {
        lineWait -= dt
        if (lineWait <= 0) {
          while (roars > 0 && CLICK_HINTS.has(nextLine)) nextLine++
          if (nextLine < LINES.length) {
            line = nextLine++
            lineLeft = LINE_FOR
            dino.dataset.line = String(line)
            try {
              sessionStorage.setItem(LINE_KEY, String(nextLine))
            } catch {
              // Storage blocked: lines may repeat next visit.
            }
          }
          lineWait = lineGap[0] + Math.random() * (lineGap[1] - lineGap[0])
        }
      }
      if (line >= 0) {
        lineLeft = roarLeft > 0 ? 0 : lineLeft - dt
        place(lineEls[line], LINES[line], lineLeft, LINE_FOR)
        if (lineLeft <= 0) line = -1
      }
      if (roarLeft > 0) {
        roarLeft -= dt
        place(bubble, ROAR, roarLeft, ROAR_FOR)
      }
      const dataset = `${frame}|${level}|${dir}|${mode}`
      if (dataset !== lastDataset) {
        lastDataset = dataset
        dino.dataset.frame = frame
        dino.dataset.level = String(level)
        dino.dataset.dir = dir > 0 ? 'right' : 'left'
        dino.dataset.mode = mode
      }
    }

    const update = () => {
      const shouldRun = onScreen && !document.hidden
      if (shouldRun === running) return
      running = shouldRun
      if (running) {
        last = 0
        for (const row of rows) row.lastLeft = null
        raf = requestAnimationFrame(tick)
      } else {
        cancelAnimationFrame(raf)
      }
    }

    const roar = (event: MouseEvent) => {
      event.preventDefault()
      roars += 1
      roarLeft = ROAR_FOR
      dino.style.setProperty('--dino-body', BODY_COLORS[roars % BODY_COLORS.length])
      dino.dataset.roars = String(roars)
      // A backflip on the spot, if it is walking (mid-jump or falling, it
      // only roars). The arc stays inside the panel on the top row.
      const current = levels[level]
      if (mode === 'walk' && current) {
        flip = { t: 0, h: Math.min(44, current.y - H - 2), floor: current.y }
        mode = 'flip'
      }
    }
    dino.addEventListener('click', roar)

    measure()
    respawn()
    const resize = new ResizeObserver(() => {
      measure()
      if (x > panelW) respawn()
    })
    resize.observe(panel)
    const visibility = new IntersectionObserver((entries) => {
      onScreen = entries.some((entry) => entry.isIntersecting)
      update()
    })
    visibility.observe(panel)
    document.addEventListener('visibilitychange', update)

    return () => {
      cancelAnimationFrame(raf)
      resize.disconnect()
      visibility.disconnect()
      document.removeEventListener('visibilitychange', update)
      dino.removeEventListener('click', roar)
    }
  }, [])

  return (
    <>
      <div
        ref={dinoRef}
        data-dino
        data-frame="fall"
        // Its own small box takes clicks (the easter egg); the layer around it
        // lets everything else through to the tiles.
        className="group/dino pointer-events-auto absolute top-0 left-0 cursor-pointer will-change-transform"
        style={{
          width: W,
          height: H,
          transform: `translate3d(-${W * 2}px, -${H * 2}px, 0)`,
          ['--dino-body' as string]: COLORS.body,
        }}
      >
        <svg
          viewBox={`0 0 ${DINO_COLS} ${DINO_ROWS}`}
          width={W}
          height={H}
          shapeRendering="crispEdges"
          className="block overflow-visible"
        >
          {FRAMES.map(({ name, paths }) => (
            <g key={name} className={FRAME_CLASS[name]}>
              <path d={paths.body} fill="var(--dino-body)" />
              <path d={paths.eye} fill={COLORS.eye} />
              <path d={paths.shine} fill={COLORS.shine} />
            </g>
          ))}
        </svg>
      </div>
      <BubbleView ref={bubbleRef} bubble={ROAR} name="roar" />
      <div ref={linesRef} className="contents">
        {LINES.map((b, i) => (
          <BubbleView key={DINO_LINES[i]} bubble={b} name={`line-${i}`} className="opacity-90" />
        ))}
      </div>
    </>
  )
}

function BubbleView({
  ref,
  bubble,
  name,
  className,
}: {
  ref?: React.Ref<HTMLDivElement>
  bubble: Bubble
  name: string
  className?: string
}) {
  return (
    <div
      ref={ref}
      data-dino-bubble={name}
      data-tail="left"
      className={`group/bubble pointer-events-none absolute top-0 left-0 ${className ?? ''}`}
      style={{ width: bubble.w, height: bubble.h, visibility: 'hidden' }}
    >
      {(['left', 'right'] as const).map((tail) => (
        <svg
          key={tail}
          viewBox={`0 0 ${bubble[tail].cols} ${bubble[tail].rows}`}
          width={bubble.w}
          height={bubble.h}
          shapeRendering="crispEdges"
          className={
            tail === 'left'
              ? 'hidden group-data-[tail=left]/bubble:block'
              : 'hidden group-data-[tail=right]/bubble:block'
          }
        >
          <path d={bubble[tail].fill} fill="#f8fafc" />
          <path d={bubble[tail].ink} fill={COLORS.eye} />
        </svg>
      ))}
    </div>
  )
}
