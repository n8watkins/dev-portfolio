'use client'

import { useEffect, useId, useRef } from 'react'
import { DINO_COLS, DINO_FRAMES, DINO_ROWS, framePaths, type DinoFrame } from './sprite'

/**
 * The easter egg itself (loaded lazily by DinoEasterEgg.tsx). A pixel dino
 * walks along the tops of the marquee rows, hopping each gap between the
 * tiles as they scroll by. It first drops in onto the top row, walking right.
 * From then on it roams: after a few seconds on a row it may leap up to the
 * row above, drop through a gap to the row below, turn around at a tile's
 * edge, or walk off the side of the panel and come back a moment later from
 * somewhere else (dropping in from above, or walking in from either side on
 * any row). Its choices come from a shuffled bag, so each kind comes round
 * soon and none repeats for long.
 *
 * When the visitor pauses the row it is on (hovering it, or focusing or
 * tapping a tile), the dino mistimes its next jump and falls through a gap to
 * the next row, where it walks the other way. Falling off the last row, it
 * comes back in somewhere else. A panel with a single row gets a solid ground
 * line under it as its second level.
 *
 * Clicking (or tapping) the dino makes it roar: a pixel "RAWR!" bubble pops
 * up and, if it is walking, it backflips on the spot, changing colour each
 * time. Only its own small box takes the pointer, so the tiles around it stay
 * clickable; it is decorative and hidden from assistive tech. Now and then
 * it says something in a smaller bubble (DINO_LINES), the first a moment after
 * it comes into view, hinting that it can be clicked.
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
// Faster than any marquee row ever scrolls, px/s. A row "moving" faster than
// this in a frame has been laid out again (the window was resized, a font
// loaded): its tiles jumped, they didn't travel, so the dino doesn't ride the
// jump (it never teleports) and the rows are measured afresh.
const MAX_ROW_SPEED = 600

// 'drop' is a jump down through a gap on purpose (a 'miss' is a mistimed
// one), 'climb' a leap up to the row above, 'away' the moment off the panel
// before it comes back in somewhere else.
type Mode = 'walk' | 'hop' | 'miss' | 'drop' | 'climb' | 'fall' | 'flip' | 'away'
// What it does at a tile's edge once it has been on a row a while: change
// rows (up if there is a row above, else down), turn around, or head for the
// side of the panel and leave.
type Choice = 'change' | 'turn' | 'exit'
const CHOICES: Choice[] = ['change', 'turn', 'change', 'exit']
// How it comes back in after leaving.
type Entry = 'drop' | 'left' | 'right'
const ENTRIES: Entry[] = ['drop', 'left', 'right']
const STAY = [2, 4.5] as const // s on a row before it chooses something
const AWAY = [0.8, 2] as const // s off the panel before it comes back
const CLIMB_T = 0.5 // s for a leap up to the row above

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
// Each roar gives the body a new random colour: a bright, light hue at least
// 60 degrees round the wheel from the last one, so the change always shows.
// Now and then it turns rainbow: 1 in 12 at random, always on the 5th
// click, and on every 10th catch in a round.
const RAINBOW_ODDS = 1 / 12
// And always on the visit's 5th click, so it gets found.
const RAINBOW_CLICK = 5
const RAINBOW = ['#f87171', '#fb923c', '#facc15', '#4ade80', '#22d3ee', '#818cf8', '#e879f9']
function randomHue(last: number) {
  const hue = (last + 60 + Math.random() * 240) % 360
  return { hue, color: `hsl(${hue.toFixed(0)} 85% 70%)` }
}
// The game: the first click starts a round of ROUND seconds (counted only
// while the dino is on screen); every click in it is a catch, and each catch
// makes it walk faster and choose its next move sooner. The best score stays
// in this browser (localStorage).
const ROUND = 30
// What a click makes it do (from a shuffled bag, so each one comes round
// soon): a backflip on the spot; a fall straight through its row (to the row
// below, or off the bottom, coming back in somewhere else); a leap up to the
// row above; or a dash the other way. Every one moves it in plain sight: it
// never vanishes and reappears elsewhere (the owner's call, 2026-10-27). In
// the air it only roars.
type Reaction = 'flip' | 'fall' | 'leap' | 'dash'
const REACTIONS: Reaction[] = ['flip', 'fall', 'leap', 'dash']
const DASH_T = 0.7 // s of dashing
const DASH_SPEED = 3 // times its walking speed
const PACE_PER_CATCH = 0.06
const MAX_PACE = 2.2
const RESULT_FOR = 5 // s the final score shows
const URGENT = 5 // s left when the countdown turns red
const BEST_KEY = 'n8-dino-best'
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
// The roar is a touch chunkier than the dino, so the word reads. Each click
// shouts the next of these, from a shuffled bag, never the same twice in a
// row (letters, ! ? . ' and spaces: the pixel font has no digits). Every
// click on it is a catch (only its own box takes the pointer), so every word
// reacts to being caught: none claims a miss (the owner's call, 2026-10-27).
export const ROAR_WORDS = ['RAWR!', 'OUCH!', 'GOT ME!', 'NO FAIR!', 'AGAIN?!', 'HEY!']
const ROARS = ROAR_WORDS.map((word) => makeBubble(word, 3))

/**
 * Things the dino says now and then while it walks, in this order, each once
 * per visit: smaller and quieter than the roar. The first comes a few seconds
 * in and hints that it can be clicked (skipped once it has been). Edit freely:
 * letters, ! ? . ' and spaces (the pixel font has no digits).
 */
export const DINO_LINES = ['Psst... click me', "Can't catch me!", 'Hop hop', 'RAWR!!!']
const CLICK_HINTS = new Set([0]) // lines that only make sense before a click
const LINES = DINO_LINES.map((line) => makeBubble(line, 2))
const FIRST_LINE_AFTER = 1 // s of walking in view before the first line
const LINE_GAP = [10, 18] as const // s between lines (walking in view)
const LINE_FOR = 2.6 // s a line stays up
const LINE_KEY = 'n8-dino-line' // sessionStorage: the next line to say
/**
 * The E2E tests shorten the waits (tests/e2e/ai-kit.spec.ts sets this before
 * the page loads) so they don't sit through seconds of walking, and turn the
 * roaming off where they need it to keep to its rows; nothing on the site
 * sets it.
 */
interface DinoTiming {
  firstLineAfter?: number
  lineGap?: readonly [number, number]
  stay?: readonly [number, number]
  roam?: boolean
  /** Click reactions in this order, round and round, instead of shuffled. */
  reactions?: readonly Reaction[]
  /** A catch round's length, s (the tests shorten it). */
  round?: number
  /** Roaming choices and ways back in, the same way. */
  choices?: readonly Choice[]
  entries?: readonly Entry[]
}
const between = ([a, b]: readonly [number, number]) => a + Math.random() * (b - a)
// Hands out the items in order, round and round (the tests' fixed sequences).
function cycle<T>(items: readonly T[]) {
  let i = 0
  return () => items[i++ % items.length]
}
// Hands out a shuffled bag's items one by one, reshuffling when it is empty.
function bag<T>(items: readonly T[]) {
  let left: T[] = []
  return () => {
    if (!left.length) {
      left = [...items]
      for (let i = left.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[left[i], left[j]] = [left[j], left[i]]
      }
    }
    return left.pop()!
  }
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
  const roarsRef = useRef<HTMLDivElement>(null)
  const linesRef = useRef<HTMLDivElement>(null)
  const scoreRef = useRef<HTMLDivElement>(null)
  const bestRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<HTMLDivElement>(null)
  const timerBarRef = useRef<HTMLSpanElement>(null)
  // The dino and its bubbles live in a stage that starts below the scoreboards'
  // band, so the dino can never cross a scoreboard (see measure()).
  const stageRef = useRef<HTMLDivElement>(null)
  const bandRef = useRef<HTMLDivElement>(null)
  // The rainbow's gradient id, unique per dino (useId's colons don't belong in url()).
  const rainbowId = `dino-rainbow-${useId().replace(/[^a-zA-Z0-9]/g, '')}`

  useEffect(() => {
    const dino = dinoRef.current
    const roarEls = [...(roarsRef.current?.children ?? [])] as HTMLElement[]
    const score = scoreRef.current
    const bestEl = bestRef.current
    const timer = timerRef.current
    const timerBar = timerBarRef.current
    const stage = stageRef.current
    const band = bandRef.current
    const lineEls = [...(linesRef.current?.children ?? [])] as HTMLElement[]
    const panel = dino?.closest<HTMLElement>('[data-dino-panel]')
    if (!dino || !roarEls.length || !score || !bestEl || !timer || !timerBar || !stage || !band || !panel) return

    let rows: Row[] = []
    let levels: Level[] = []
    let panelW = 0
    let panelH = 0
    // The top of the play area, panel px: just under the scoreboards' band.
    // Nothing of the dino shows above it (the stage is clipped there), and its
    // arcs and bubbles stay below it.
    let ceiling = 0

    const measure = () => {
      const box = panel.getBoundingClientRect()
      panelW = box.width
      panelH = box.height
      ceiling = band.getBoundingClientRect().bottom - box.top + 4
      stage.style.clipPath = `inset(${ceiling.toFixed(0)}px 0 0 0)`
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

    // Measure again after the layout changed, and keep the dino on its feet:
    // standing on a row (or flipping on it), it moves with the row's new top
    // rather than hanging where the row used to be.
    const remeasure = () => {
      measure()
      const here = levels[level]
      if (!here) return
      if (mode === 'walk') y = here.y
      else if (mode === 'flip') flip.floor = here.y
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
    let roarWord = 0 // the roar showing (ROAR_WORDS)
    const nextRoarWord = (() => {
      const pick = bag(ROARS.map((_, i) => i))
      return () => {
        let next = pick()
        if (next === roarWord && ROARS.length > 1) next = pick()
        return next
      }
    })()
    // Once it has come in from a side (or dropped in), where in the panel it
    // walks to before it may turn round or choose to leave (panel x, in its
    // walking direction), so it never peeks in and straight back out. Panel
    // position, not distance walked: a row moving against it carries it back,
    // and on a narrow panel distance alone let it choose barely inside. A
    // time cap lets it go on if a row holds it in place.
    let commit: { to: number; dir: 1 | -1; left: number } | null = null
    const COMMIT_FOR = 6 // s at most
    let hue = 210 // the body's last random hue
    // The game (see ROUND): a round's time left and catches, the best so far,
    // and how long the final score has left on screen.
    let roundLeft = 0
    let catches = 0
    let resultLeft = 0
    let pace = 1
    let best = 0
    let beatBest = false // this round's catches went past the best so far
    try {
      best = Number(localStorage.getItem(BEST_KEY)) || 0
    } catch {
      // Storage blocked: the best score lasts this page view only.
    }
    // The scoreboards' text, written straight to the DOM (no re-render per
    // frame): the catches, the round's countdown and the best score.
    const texts = new Map<HTMLElement, string>()
    const show = (el: HTMLElement, text: string) => {
      if (texts.get(el) === text) return
      texts.set(el, text)
      el.textContent = text
      el.dataset.shown = text ? 'true' : 'false'
    }
    const timerText = timer.querySelector<HTMLElement>('[data-dino-timer-text]')!
    let timerShown = ''
    const scoreboard = () => {
      const playing = roundLeft > 0 || resultLeft > 0
      // The countdown: big digits over a bar that drains with the round, red
      // and pulsing for the last URGENT seconds.
      const secs = Math.ceil(roundLeft)
      const clock = roundLeft > 0 ? `0:${String(secs).padStart(2, '0')}` : ''
      if (clock !== timerShown) {
        timerShown = clock
        timerText.textContent = clock
        timer.dataset.shown = clock ? 'true' : 'false'
        timer.dataset.urgent = roundLeft > 0 && roundLeft <= URGENT ? 'true' : 'false'
      }
      timerBar.style.transform = `scaleX(${Math.max(0, roundLeft / roundFor).toFixed(3)})`
      if (roundLeft > 0) {
        show(score, `Catches ${catches}`)
      } else if (resultLeft > 0) {
        show(score, `Time! ${catches} ${catches === 1 ? 'catch' : 'catches'}${beatBest ? ' · New best!' : ''}`)
      } else {
        show(score, '')
      }
      // During a round the best counts this round's catches as they pass it.
      show(bestEl, playing ? `Best ${Math.max(best, catches)}` : '')
      bestEl.dataset.new = playing && catches > 0 && (beatBest || catches > best) ? 'true' : 'false'
    }
    // What it says now and then (DINO_LINES), each once per visit.
    let nextLine = 0
    try {
      nextLine = Number(sessionStorage.getItem(LINE_KEY)) || 0
    } catch {
      // Storage blocked: start from the first line on every page view.
    }
    const timing = (window as { __n8DinoTiming?: DinoTiming }).__n8DinoTiming
    const roundFor = timing?.round ?? ROUND
    const lineGap = timing?.lineGap ?? LINE_GAP
    let lineWait = timing?.firstLineAfter ?? FIRST_LINE_AFTER
    let line = -1 // the line showing, if any
    let lineLeft = 0
    let flip = { t: 0, h: 0, floor: 0 }
    let angle = 0
    // Roaming (see the top of the file).
    const roam = timing?.roam ?? true
    const stayFor = timing?.stay ?? STAY
    let stayLeft = between(stayFor)
    let leaving = false // heading for the side of the panel to leave
    let awayLeft = 0
    let climb = { t: 0, from: 0, to: 0, h: 0, vx: 0, target: 0 }
    const nextChoice = timing?.choices?.length ? cycle(timing.choices) : bag(CHOICES)
    const nextReaction = timing?.reactions?.length ? cycle(timing.reactions) : bag(REACTIONS)
    let dashLeft = 0 // s of dashing left
    const nextEntry = timing?.entries?.length ? cycle(timing.entries) : bag(ENTRIES)

    // The first time in (and without roaming, every time): it drops onto the
    // top row a little way in, walking right, so it is seen straight away.
    const respawn = () => {
      level = -1
      dir = 1
      mode = 'fall'
      x = Math.max(16, panelW * 0.3)
      y = -H
      vy = 0
      carry = 0
      leaving = false
      stayLeft = between(stayFor)
    }

    // Back in after leaving: dropping in from above anywhere along the top,
    // or walking in from either side on any row.
    const enter = () => {
      const entry = nextEntry()
      const floors = levels.flatMap((l, i) => (l.row ? [i] : []))
      respawn()
      if (entry === 'drop' || !floors.length) {
        x = panelW * (0.25 + Math.random() * 0.5)
        dir = Math.random() < 0.5 ? 1 : -1
        commit = { to: x + dir * panelW * 0.2, dir, left: COMMIT_FOR }
        return
      }
      level = floors[Math.floor(Math.random() * floors.length)]
      dir = entry === 'left' ? 1 : -1
      x = entry === 'left' ? -W : panelW
      y = levels[level].y
      mode = 'walk'
      reentering = true
      // From the side it walks over a third of the way in first.
      commit = { to: entry === 'left' ? panelW * 0.35 : panelW * 0.65 - W, dir, left: COMMIT_FOR }
    }

    const goAway = () => {
      mode = 'away'
      awayLeft = between(AWAY)
      x = -W * 3
      leaving = false
      if (line >= 0) lineLeft = Math.min(lineLeft, 0.1)
    }

    // A leap up to the row above: a forward arc that ends coming down onto
    // its tiles, as high as the panel's top edge allows (it clips).
    const startClimb = (target: number) => {
      const from = y
      const to = levels[target].y
      const d = from - to
      let h = d * 0.45 + 10
      // The arc's highest point, for a height h: keep it inside the panel.
      const peak = (hh: number) => {
        const p = Math.min((4 * hh + d) / (8 * hh), 1)
        return from - d * p - hh * 4 * p * (1 - p)
      }
      while (h > d / 4 + 1 && peak(h) - H < ceiling) h -= 2
      // Aim for a tile of the row above where it will be on landing (that
      // row moves too), as near as possible to an ordinary forward leap.
      const row = levels[target].row
      const foot = x + W / 2
      let spotX = foot + dir * SPEED * 0.9 * CLIMB_T
      if (row) {
        const shift = row.velocity * CLIMB_T
        let best = Infinity
        for (const [a, b] of intervals(row, panel.getBoundingClientRect().left)) {
          const lo = a + shift + 6
          const hi = b + shift - 6
          if (lo > hi) continue
          const spot = Math.min(Math.max(spotX, lo), hi)
          // Forward, and not so far it would have to fly.
          const reach = (spot - foot) * dir
          if (reach < SPEED * 0.3 * CLIMB_T || reach > SPEED * 1.6 * CLIMB_T) continue
          if (Math.abs(spot - spotX) < Math.abs(best - spotX)) best = spot
        }
        if (best !== Infinity) spotX = best
      }
      climb = { t: 0, from, to, h, vx: (spotX - foot) / CLIMB_T, target }
      mode = 'climb'
    }

    // A row's speed for a fall to carry, never more than a row can move.
    const rowSpeed = (row: Row | null | undefined) =>
      Math.max(-MAX_ROW_SPEED, Math.min(MAX_ROW_SPEED, row?.velocity ?? 0))

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
      stayLeft = between(stayFor)
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
      const by = Math.max(floor - H - b.h + 12, ceiling)
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
      // The round's clock, and the final score's time on screen.
      if (roundLeft > 0) {
        roundLeft -= dt
        if (roundLeft <= 0) {
          roundLeft = 0
          resultLeft = RESULT_FOR
          pace = 1
          beatBest = catches > best
          if (catches > best) {
            best = catches
            try {
              localStorage.setItem(BEST_KEY, String(best))
            } catch {
              // Storage blocked: the best score lasts this page view only.
            }
          }
          dino.dataset.game = 'over'
        }
      } else if (resultLeft > 0) {
        resultLeft -= dt
        if (resultLeft <= 0) dino.dataset.game = 'idle'
      }
      scoreboard()
      const panelBox = panel.getBoundingClientRect()
      const panelLeft = panelBox.left

      // Row speeds, and whether the visitor just paused the one the dino is
      // on. A pause of any other row (hovered, tapped or focused) leaves its
      // jumps alone: the row under its feet is still moving.
      const onRow = levels[level]?.row
      let relaidOut = false
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
          if (Math.abs(delta) > Math.max(MAX_ROW_SPEED * realDt, 4)) {
            // Laid out again, not moved: nothing rides the jump.
            relaidOut = true
          } else {
            row.delta = delta
            row.velocity = delta / realDt
            const paused = Math.abs(row.velocity) < STILL
            if (paused && !row.paused && settled > 10 && row === onRow) missPending = true
            row.paused = paused
          }
        }
        row.lastLeft = left
      }
      settled++
      if (relaidOut) remeasure()
      const current = levels[level]

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
        const speed = SPEED * pace * (dashLeft > 0 ? DASH_SPEED : 1)
        dashLeft = Math.max(0, dashLeft - dt)
        x += dir * speed * dt
        walked += speed * dt
        if (commit) {
          commit.left -= dt
          // Done once it gets there, or once it has turned round (at an edge,
          // say), when the spot ahead of it no longer is.
          if (
            commit.left <= 0 ||
            dir !== commit.dir ||
            (commit.dir > 0 ? x >= commit.to : x <= commit.to)
          )
            commit = null
        }
        stayLeft -= dt * pace
        if (walked >= STEP_EVERY) {
          walked = 0
          frame = frame === 'stepA' ? 'stepB' : 'stepA'
        }
        if (frame !== 'stepA' && frame !== 'stepB') frame = 'stepA'
        // Roaming, it only leaves the panel when it has chosen to: heading
        // into a side fade otherwise, it turns back (a tile can reach past
        // the panel's side, so this can't wait for a tile's edge). Not while
        // its row has just been paused: it walks on to its next jump and
        // misses it, even on a narrow panel where that gap is in the fade.
        if (roam && !leaving && !reentering && !missPending && (dir > 0 ? x + W > panelW * 0.85 : x < panelW * 0.15))
          dir = dir > 0 ? -1 : 1
        if (spans) {
          const under = support(foot, spans)
          if (under) reentering = false
          if (!under && reentering) {
            // Still off the edge: keep walking.
          } else if (!under) {
            mode = 'fall'
            carry = rowSpeed(current.row)
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
                carry = rowSpeed(current.row)
                missPending = false
              } else if (roam && stayLeft <= 0 && !leaving && !reentering && !commit) {
                // Been here a while: it does something else.
                stayLeft = between(stayFor)
                const choice = nextChoice()
                const above = levels[level - 1]
                const below = levels[level + 1]
                if (choice === 'change' && above?.row) {
                  startClimb(level - 1)
                } else if (choice === 'change' && below) {
                  // On purpose: a little hop that comes down in the gap.
                  const T = 0.24
                  const target = edge + dir * gap * 0.5
                  hop = { t: 0, T, h: 10, floor: current.y, vx: (target - foot) / T }
                  mode = 'drop'
                  carry = rowSpeed(current.row)
                } else if (choice === 'turn') {
                  dir = dir > 0 ? -1 : 1
                } else {
                  // Walks on, hopping as usual, until it leaves the panel.
                  leaving = true
                }
              } else {
                // A lunge sized to the gap: it clears it and lands a little
                // way onto the next tile (relative to the row, which carries
                // it along meanwhile), in an arc that grows with it.
                const reach = gap + LANDING
                const T = Math.min(Math.max(reach / (SPEED * 1.4), 0.26), 0.6)
                // The top row's arc stays inside the panel (which clips).
                const h = Math.max(0, Math.min(8 + gap * 0.4, current.y - H - ceiling))
                hop = { t: 0, T, h, floor: current.y, vx: (dir * reach) / T }
                mode = 'hop'
              }
            }
          }
        }
      } else if (mode === 'hop' || mode === 'miss' || mode === 'drop') {
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
            if (mode === 'hop') carry = rowSpeed(current?.row)
            mode = 'fall'
            vy = 0
          }
        }
      } else if (mode === 'climb') {
        // Through the air on its own (no row carries it), landing on the row
        // above; if that comes down in a gap, it falls back to where it was.
        climb.t += dt
        const p = Math.min(climb.t / CLIMB_T, 1)
        x += climb.vx * dt
        y = climb.from + (climb.to - climb.from) * p - climb.h * 4 * p * (1 - p)
        frame = 'hop'
        if (p >= 1) {
          level = climb.target
          missPending = false
          const target = levels[level]
          const up = target.row ? intervals(target.row, panelLeft) : null
          land(target, up)
          if (up && !support(x + W / 2, up)) {
            mode = 'fall'
            carry = 0
            frame = 'fall'
          } else frame = 'stepA'
        }
      } else if (mode === 'away') {
        awayLeft -= dt
        if (awayLeft <= 0) enter()
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
          if (roam) goAway()
          else respawn()
        }
      }

      // Off one end of a level: roaming, it is gone for a moment and comes
      // back somewhere else; otherwise it comes back in at the other end.
      if (mode === 'walk' && roam && ((dir > 0 && x > panelW) || (dir < 0 && x < -W))) {
        goAway()
      } else if (mode === 'walk') {
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
      // view (clear of the edge fades, and well inside the window, so the
      // line is seen), never over a roar.
      const onPage = panelBox.top + y
      const clear =
        x > panelW * 0.22 &&
        x + W < panelW * 0.78 &&
        onPage > innerHeight * 0.1 &&
        onPage < innerHeight * 0.9
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
          lineWait = between(lineGap)
        }
      }
      if (line >= 0) {
        lineLeft = roarLeft > 0 ? 0 : lineLeft - dt
        place(lineEls[line], LINES[line], lineLeft, LINE_FOR)
        if (lineLeft <= 0) line = -1
      }
      if (roarLeft > 0) {
        roarLeft -= dt
        place(roarEls[roarWord], ROARS[roarWord], roarLeft, ROAR_FOR)
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
      // A new word: the last one's bubble goes, the next one's shows.
      roarEls[roarWord].style.visibility = 'hidden'
      roarWord = nextRoarWord()
      dino.dataset.roar = ROAR_WORDS[roarWord]
      roarLeft = ROAR_FOR
      // A catch: the first click starts a round (or a new one once the last
      // score has had a moment on screen), then every click counts.
      if (roundLeft > 0) {
        catches += 1
      } else if (resultLeft < RESULT_FOR - 1.5) {
        roundLeft = roundFor
        resultLeft = 0
        beatBest = false
        catches = 1
        dino.dataset.game = 'on'
      }
      pace = roundLeft > 0 ? Math.min(1 + catches * PACE_PER_CATCH, MAX_PACE) : 1
      dino.dataset.catches = String(catches)
      scoreboard()
      // A new colour every time; sometimes a rainbow.
      const rainbow =
        Math.random() < RAINBOW_ODDS || roars === RAINBOW_CLICK || (roundLeft > 0 && catches % 10 === 0)
      if (rainbow) {
        dino.style.setProperty('--dino-body', `url(#${rainbowId})`)
        dino.dataset.rainbow = 'true'
      } else {
        const next = randomHue(hue)
        hue = next.hue
        dino.style.setProperty('--dino-body', next.color)
        delete dino.dataset.rainbow
      }
      dino.dataset.roars = String(roars)
      // A reaction, if it is walking (mid-jump or falling, it only roars).
      const current = levels[level]
      if (mode === 'walk' && current) {
        let reaction = nextReaction()
        // On the top row there is nothing to leap up to: it dashes instead.
        if (reaction === 'leap' && !levels[level - 1]?.row) reaction = 'dash'
        dino.dataset.reaction = reaction
        if (reaction === 'flip') {
          // The arc stays inside the panel on the top row.
          flip = { t: 0, h: Math.max(0, Math.min(44, current.y - H - ceiling)), floor: current.y }
          mode = 'flip'
        } else if (reaction === 'fall') {
          // A startled little pop, then straight down through its row.
          mode = 'fall'
          vy = -90
          carry = 0
          missPending = false
        } else if (reaction === 'leap') {
          startClimb(level - 1)
        } else {
          dir = dir > 0 ? -1 : 1
          dashLeft = DASH_T
        }
      }
    }
    dino.addEventListener('click', roar)

    measure()
    respawn()
    const resize = new ResizeObserver(() => {
      remeasure()
      if (mode !== 'away' && x > panelW) respawn()
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
  }, [rainbowId])

  return (
    <>
      {/* The stage: the dino and its bubbles, clipped below the scoreboards' band. */}
      <div ref={stageRef} className="absolute inset-0">
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
            {/* The rainbow body, its bands turning slowly. */}
            <defs>
              <linearGradient id={rainbowId} x1="0" y1="0" x2="1" y2="1">
                {RAINBOW.map((c, i) => (
                  <stop key={c} offset={i / (RAINBOW.length - 1)} stopColor={c} />
                ))}
                <animateTransform
                  attributeName="gradientTransform"
                  type="rotate"
                  from="0 0.5 0.5"
                  to="360 0.5 0.5"
                  dur="3s"
                  repeatCount="indefinite"
                />
              </linearGradient>
            </defs>
            {FRAMES.map(({ name, paths }) => (
              <g key={name} className={FRAME_CLASS[name]}>
                <path d={paths.body} fill="var(--dino-body)" />
                <path d={paths.eye} fill={COLORS.eye} />
                <path d={paths.shine} fill={COLORS.shine} />
              </g>
            ))}
          </svg>
        </div>
        <div ref={roarsRef} className="contents">
          {ROARS.map((b, i) => (
            <BubbleView key={ROAR_WORDS[i]} bubble={b} name={`roar-${i}`} />
          ))}
        </div>
        <div ref={linesRef} className="contents">
          {LINES.map((b, i) => (
            <BubbleView key={DINO_LINES[i]} bubble={b} name={`line-${i}`} className="opacity-90" />
          ))}
        </div>
      </div>
      {/* The scoreboards, in a band across the top of the panel that the dino
          never enters: the round (catches and clock) and the best score. Shown
          during a round and for a moment after it. A fixed height, so the band
          measures the same empty or full. Decorative, like the dino. */}
      <div
        ref={bandRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-2.5 z-10 flex justify-center gap-2"
      >
        <div
          ref={scoreRef}
          data-dino-score
          data-shown="false"
          className="flex h-[1.625rem] items-center rounded-full whitespace-nowrap border border-white/10 bg-[#081427]/85 px-3 font-mono text-xs font-semibold text-cyan-200 tabular-nums opacity-0 backdrop-blur-sm transition-opacity duration-300 data-[shown=true]:opacity-100"
        />
        {/* The countdown: bigger digits over a bar that drains with the round; red and pulsing near the end. */}
        <div
          ref={timerRef}
          data-dino-timer
          data-shown="false"
          data-urgent="false"
          className="group/timer relative flex h-[1.625rem] items-center overflow-hidden rounded-full border border-cyan-300/30 bg-[#081427]/85 px-3.5 font-mono text-sm font-bold text-cyan-100 tabular-nums opacity-0 backdrop-blur-sm transition-[opacity,color,border-color] duration-300 data-[shown=true]:opacity-100 data-[urgent=true]:animate-pulse data-[urgent=true]:border-rose-400/60 data-[urgent=true]:text-rose-200"
        >
          <span data-dino-timer-text />
          <span
            ref={timerBarRef}
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-[3px] origin-left bg-gradient-to-r from-cyan-400 to-blue-500 group-data-[urgent=true]/timer:from-rose-500 group-data-[urgent=true]/timer:to-orange-400"
            style={{ transform: 'scaleX(1)' }}
          />
        </div>
        {/* A new best lights up. */}
        <div
          ref={bestRef}
          data-dino-best
          data-shown="false"
          data-new="false"
          className="flex h-[1.625rem] items-center rounded-full whitespace-nowrap border border-white/10 bg-[#081427]/85 px-3 font-mono text-xs font-semibold text-slate-300 tabular-nums opacity-0 backdrop-blur-sm transition-[opacity,color,border-color] duration-300 data-[new=true]:border-amber-300/40 data-[new=true]:text-amber-200 data-[shown=true]:opacity-100"
        />
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
