'use client'

import React, { useEffect, useMemo, useRef } from 'react'
import { eqPose, ORDER, POSES, RANK_BASE, RANK_H, rankPose, type MarkKind } from './marks'
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

// The bird's yard: how many cells it may walk either way from home, how many
// rows above it a seed may be dropped from, and how many seeds may wait.
const PAD = 5
const SKY = 2
const MAX_SEEDS = 4
// Every this many seeds it is given, it puffs up and sings.
const REWARD_EVERY = 3
// A hover easter egg does not play again for this long after the last one.
const HOVER_REST = 1200

const between = ([min, max]: readonly [number, number]) => min + Math.random() * (max - min)
const chance = (p: number) => Math.random() < p
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n))

type Slot = { i: number; j: number; el: HTMLElement | null; ch: string }
/** A pose placed on the mark's cells: `rows` with its top left at cell (x, y). */
type Bitmap = { rows: readonly string[]; x: number; y: number }
type Seed = { i: number; el: HTMLElement; landed: boolean; auto: boolean }

const bm = (rows: readonly string[], x = 0, y = 0): Bitmap => ({ rows, x, y })
/** A pose facing the other way. */
const turned = (rows: readonly string[]) => rows.map((r) => [...r].reverse().join(''))

/** Every cell (as "i,j") a mark may ever light, so a change of pose only flips existing cells. */
function cellsOf(kind: MarkKind): string[] {
  const keys = new Set<string>()
  const add = (rows: readonly string[], x = 0, y = 0) =>
    rows.forEach((line, j) =>
      [...line].forEach((ch, i) => {
        if (ch !== '.') keys.add(`${i + x},${j + y}`)
      })
    )
  if (kind === 'rank') add(rankPose([7, 7, 7]))
  else if (kind === 'play') add(eqPose([7, 7, 7, 7, 7, 7]))
  else
    // The bird, in every pose, facing either way, anywhere in its yard, and
    // a row up for a hop.
    for (const rows of Object.values(POSES.wren))
      for (const face of [rows, turned(rows)])
        for (let dx = -PAD; dx <= PAD; dx++) for (const dy of [0, -1]) add(face, dx, dy)
  return [...keys]
}

/**
 * LAB (exp/project-marks): a project's pixel mark, lit from the section's grid
 * squares in the open space beside its card (wide screens only).
 *
 * It is snapped onto the grid: centred in the space beside the card and on the
 * card's middle, then moved to the nearest cell. Its cells flip in like a
 * split-flap board when it comes into view and flip out when it leaves, every
 * time. While on screen it does one small thing now and then (the bird
 * blinks, pecks, flicks its tail or finds a seed; the play button pauses or
 * runs a playhead; the podium reshuffles), each made of the same flips.
 *
 * Easter eggs, all in the same flips and never following the pointer around:
 * hovering a mark plays its own surprise (the podium races and the winner is
 * crowned; the play button presses in and plays an equaliser; the bird turns
 * to the pointer, hops and sings). Clicking the open grid around the bird
 * drops a seed that falls to the ground; the bird walks over and eats it, and
 * every few seeds it puffs up and sings. The marks stay decorative: hidden
 * from screen readers, nothing focusable. Reduced motion shows them still and
 * complete with no eggs; `still` keeps the flips in and out only.
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
  /** No idle actions and no easter eggs. */
  still?: boolean
  cardRef: React.RefObject<HTMLElement | null>
}) {
  const ref = useRef<HTMLDivElement>(null)
  const layerRef = useRef<HTMLDivElement>(null)
  const yardRef = useRef<HTMLDivElement>(null)
  // How far the bird may walk from home (in cells), set where it is placed.
  const reach = useRef({ lo: 0, hi: 0 })
  // The pointer handlers, set by the life effect.
  const on = useRef<{ hover: (x: number) => void; unhover: () => void; drop: (x: number, y: number) => void }>(null)
  const poses: Record<string, string[]> = POSES[kind]
  const base = poses.base
  const h = base.length
  const w = base[0].length
  const keys = useMemo(() => cellsOf(kind), [kind])
  const homeRows = kind === 'wren' && mirror ? turned(base) : base
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

      // The bird's yard: the open grid it can walk, never nearer the card
      // than half a cell nor nearer the screen's edge than most of one.
      const yard = yardRef.current
      if (yard) {
        const screen = document.documentElement.clientWidth - r.left
        const [a, b] =
          side === 'right'
            ? [cardRight + CELL / 2, screen - CELL * 0.75]
            : [-r.left + CELL * 0.75, cardLeft - CELL / 2]
        const lo = Math.min(0, Math.max(-PAD, Math.ceil((a - left - 1) / CELL)))
        const hi = Math.max(0, Math.min(PAD, Math.floor((b - left - 1) / CELL) - w))
        reach.current = { lo, hi }
        yard.style.left = `${lo * CELL}px`
        yard.style.top = `${-SKY * CELL}px`
        yard.style.width = `${(hi - lo + w) * CELL}px`
        yard.style.height = `${(h + SKY) * CELL}px`
      }
    }
    place()
    const resized = new ResizeObserver(place)
    resized.observe(row)
    resized.observe(grid)
    return () => resized.disconnect()
  }, [cardRef, side, w, h])

  // The life: in and out with the scroll, the idle actions and the easter eggs.
  useEffect(() => {
    const el = ref.current
    const layer = layerRef.current
    if (!el || !layer || typeof IntersectionObserver === 'undefined') return
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
    // A wait inside an action. When the mark leaves the screen its timers are
    // cleared, so an action cut short simply never resumes.
    const sleep = (ms: number) => new Promise<void>((done) => later(done, ms))
    const at = (b: Bitmap, s: Slot) => b.rows[s.j - b.y]?.[s.i - b.x] ?? '.'

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
    const pose = (target: Bitmap, delay: (s: Slot) => number, ms: number, lag = 0) => {
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

    // Sprites: cells drawn on their own, off any pose (seeds, notes, the
    // crown), in a layer under the mark's cells.
    const sprites = new Set<HTMLElement>()
    const sprite = (k: string, i: number, j: number, ms = 160, delay = 0) => {
      const c = document.createElement('i')
      c.className = styles.cell
      c.dataset.k = k
      c.style.setProperty('--f', `${ms}ms`)
      c.style.setProperty('--d', `${delay}ms`)
      move(c, i, j)
      layer.append(c)
      sprites.add(c)
      void c.offsetWidth // start from edge on, so it flips in
      c.setAttribute('data-lit', '')
      return c
    }
    const move = (c: HTMLElement, i: number, j: number) => {
      c.style.left = `${i * CELL}px`
      c.style.top = `${j * CELL}px`
    }
    const unsprite = (c: HTMLElement, ms = 140, delay = 0) => {
      c.style.setProperty('--f', `${ms}ms`)
      c.style.setProperty('--d', `${delay}ms`)
      c.removeAttribute('data-lit')
      later(() => {
        c.remove()
        sprites.delete(c)
      }, delay + ms + 40)
    }

    // The bird: how far it has walked from home, and which way it faces
    // (1 right, -1 left). At home it faces its card.
    const home = mirror ? -1 : 1
    const bird = { dx: 0, face: home }
    const birdPose = (rows: readonly string[], dy = 0) =>
      bm(bird.face > 0 ? rows : turned(rows), bird.dx, dy)
    const shape = (rows: readonly string[]) => (kind === 'wren' ? birdPose(rows) : bm(rows))
    const beak = () => (bird.face > 0 ? bird.dx + w - 1 : bird.dx)
    const ground = h - 1

    // The waves: the podium from the floor, the others the way they face.
    const along = (s: Slot) =>
      ORDER[kind] === 'up'
        ? h - 1 - s.j
        : kind === 'wren'
          ? bird.face > 0
            ? s.i - bird.dx
            : bird.dx + w - 1 - s.i
          : s.i
    const span = ORDER[kind] === 'up' ? h : w
    const wave = (total: number) => (s: Slot) =>
      (clamp(along(s), 0, span - 1) / Math.max(1, span - 1)) * total + Math.random() * 60

    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      el.setAttribute('data-still', '')
      pose(shape(base), () => 0, 0)
      return
    }

    let shown = false
    let ready = false // in, and done flipping in
    let busy = false // an action or easter egg is playing
    let epoch = 0 // bumped on every in and out, so a cut-short action stops
    let holding = false // this mark holds the shared lock
    let rank: [number, number, number] = [...RANK_BASE]
    const seeds: Seed[] = []
    let fed = 0
    let hovered: number | null = null // a hover waiting to play, at this x
    let hoverAt = 0 // no hover egg before this time
    let homing = false

    const hold = () => {
      holding = true
      lockedUntil = performance.now() + 60_000
    }
    const release = (breath: number) => {
      if (!holding) return
      holding = false
      lockedUntil = performance.now() + breath
    }
    /** Plays an action; the next one waits for it. */
    const run = (task: () => Promise<void>, breath = BREATH, done?: () => void) => {
      busy = true
      hold()
      const mine = epoch
      void task().then(() => {
        if (mine !== epoch) return
        busy = false
        release(breath)
        done?.()
        next()
      })
    }

    // ---- The bird's moves ----
    const turn = async (face: number) => {
      bird.face = face
      const mid = bird.dx + (w - 1) / 2
      const ms = pose(birdPose(base), (s) => Math.abs(s.i - mid) * 45, 130, 40)
      await sleep(ms + 60)
    }
    const step = async (d: number) => {
      bird.dx += d
      pose(birdPose(base), () => 0, 100, 40)
      await sleep(200)
    }
    const hop = async () => {
      pose(birdPose(base, -1), () => 0, 90, 30)
      await sleep(170)
      pose(birdPose(base), () => 0, 90, 30)
      await sleep(190)
    }
    /** A few notes rise from the open beak, one a cell, and fade. */
    const sing = async (notes: number, rows: readonly string[] = POSES.wren.chirp) => {
      pose(birdPose(rows), () => 0, 90, 30)
      for (let n = 0; n < notes; n++)
        later(() => {
          const i = beak()
          const c = sprite('N', i, -1, 110)
          // They drift back over the bird, away from the card.
          later(() => move(c, i - bird.face * (n % 2), -2), 260)
          later(() => move(c, i - bird.face, -3), 520)
          later(() => unsprite(c, 160), 700)
        }, n * 240)
      await sleep(notes * 240 + 260)
      pose(birdPose(base), () => 0, 100, 30)
      await sleep(320)
    }
    /** Where to stand to eat a seed in column `i`: beak over it, the shortest walk. */
    const plan = (i: number) => {
      const { lo, hi } = reach.current
      const options = [
        { face: 1, dx: i - (w - 1) },
        { face: -1, dx: i },
      ].filter((o) => o.dx >= lo && o.dx <= hi)
      if (!options.length) {
        const face = i > bird.dx + (w - 1) / 2 ? 1 : -1
        return { face, dx: clamp(face > 0 ? i - (w - 1) : i, lo, hi) }
      }
      const cost = (o: { face: number; dx: number }) =>
        Math.abs(o.dx - bird.dx) + (o.face === bird.face ? 0 : 1.5)
      return options.sort((a, b) => cost(a) - cost(b))[0]
    }
    const eat = async (seed: Seed) => {
      const to = plan(seed.i)
      if (to.face !== bird.face) await turn(to.face)
      while (bird.dx !== to.dx) await step(Math.sign(to.dx - bird.dx))
      pose(birdPose(poses.peck1), () => 0, 110, 50)
      await sleep(180)
      pose(birdPose(poses.peck2), () => 0, 110, 50)
      await sleep(120)
      // Gone, under the beak.
      unsprite(seed.el, 90)
      seeds.splice(seeds.indexOf(seed), 1)
      await sleep(160)
      pose(birdPose(poses.peck1), () => 0, 110, 50)
      await sleep(180)
      pose(birdPose(base), () => 0, 120, 50)
      await sleep(260)
      if (!seed.auto && ++fed % REWARD_EVERY === 0) {
        // Pleased: it puffs up, hops and sings.
        pose(birdPose(poses.puff), wave(200), 150, 40)
        await sleep(650)
        pose(birdPose(base), () => 0, 130, 40)
        await sleep(200)
        await hop()
        await sing(4)
      }
    }
    const goHome = async () => {
      if (bird.dx !== 0) {
        const d = Math.sign(-bird.dx)
        if (bird.face !== d) await turn(d)
        while (bird.dx !== 0) await step(d)
      }
      if (bird.face !== home) await turn(home)
    }
    const away = () => bird.dx !== 0 || bird.face !== home

    /** Drops a seed at this point of the screen; it falls to the ground. */
    const drop = (x: number, y: number) => {
      if (!ready || still || seeds.length >= MAX_SEEDS) return
      const box = el.getBoundingClientRect()
      const i = Math.floor((x - box.left) / CELL)
      const j = clamp(Math.floor((y - box.top) / CELL), -SKY, ground)
      const { lo, hi } = reach.current
      if (i < lo || i > hi + w - 1 || seeds.some((s) => s.i === i)) return
      const seed: Seed = { i, el: sprite('S', i, j, 110), landed: false, auto: false }
      seeds.push(seed)
      // A cell at a time, quicker as it falls.
      let t = 0
      let gap = 120
      for (let r = j + 1; r <= ground; r++) {
        t += gap
        gap = Math.max(60, gap * 0.8)
        later(() => move(seed.el, i, r), t)
      }
      later(() => {
        seed.landed = true
        next()
      }, t + 80)
    }

    // ---- Easter eggs on hover ----
    /** The podium races from the start line; the winner flashes and is crowned. */
    const race = async () => {
      // Down to the start line, top first.
      let ms = pose(bm(rankPose([1, 1, 1])), (s) => s.j * 35, 130)
      await sleep(ms + 200)
      const pace = [0, 1, 2].map(() => 0.4 + Math.random() * 0.45)
      const hs: [number, number, number] = [1, 1, 1]
      while (Math.max(...hs) < RANK_H) {
        hs.forEach((v, b) => {
          if (chance(pace[b])) hs[b] = Math.min(RANK_H, v + 1)
        })
        pose(bm(rankPose(hs)), () => 0, 100)
        await sleep(150)
      }
      // A photo finish goes to one of them; the others stop a cell short.
      const top = [0, 1, 2].filter((b) => hs[b] === RANK_H)
      const winner = top[Math.floor(Math.random() * top.length)]
      top.forEach((b) => b !== winner && (hs[b] = RANK_H - 1))
      ms = pose(bm(rankPose(hs)), () => 0, 100)
      rank = hs
      await sleep(ms + 120)
      const bar = cells.filter((s) => s.i === winner * 2 && s.ch !== '.')
      for (let n = 0; n < 2; n++) {
        bar.forEach((s) => flip(s, 'H', (RANK_H - 1 - s.j) * 25, 80))
        await sleep(330)
        bar.forEach((s) => flip(s, 'X', (RANK_H - 1 - s.j) * 25, 80))
        await sleep(330)
      }
      // The crown, floating a row above the bar: two points over a band.
      const c = winner * 2
      const crown = [
        [c - 1, -2],
        [c, -2],
        [c + 1, -2],
        [c - 1, -3],
        [c + 1, -3],
      ].map(([i, j], n) => sprite('H', i, j, 160, n * 60))
      await sleep(1700)
      crown.forEach((s, n) => unsprite(s, 160, (crown.length - 1 - n) * 50))
      await sleep(400)
    }
    /** The play button presses in, then plays: an equaliser for a moment. */
    const play = async () => {
      let ms = pose(bm(base.map((r) => r.replace(/X/g, 'd'))), () => 0, 90)
      await sleep(ms + 120)
      let hs = [7, 5, 5, 3, 3, 1]
      for (let f = 0; f < 12; f++) {
        hs = hs.map((v) => clamp(v + Math.round((Math.random() - 0.45) * 6), 1, 7))
        pose(bm(eqPose(hs)), () => 0, 70)
        await sleep(150)
      }
      ms = pose(bm(eqPose([0, 0, 0, 0, 0, 0])), (s) => s.j * 30, 110)
      await sleep(ms + 80)
      ms = pose(bm(base), wave(260), 200)
      await sleep(ms)
    }
    /** The bird turns to the pointer, hops twice and sings. */
    const greet = async (x: number) => {
      const box = el.getBoundingClientRect()
      const face = x < box.left + (bird.dx + w / 2) * CELL ? -1 : 1
      if (face !== bird.face) await turn(face)
      await hop()
      await hop()
      await sing(3)
    }

    /** What to do next, once nothing is playing: seeds first, then a hover, then home. */
    const next = () => {
      if (!ready || busy) return
      const seed = seeds.find((s) => s.landed)
      if (seed) return run(() => eat(seed), 600)
      if (hovered !== null) {
        const x = hovered
        hovered = null
        if (performance.now() >= hoverAt)
          return run(
            () => (kind === 'rank' ? race() : kind === 'play' ? play() : greet(x)),
            900,
            () => (hoverAt = performance.now() + HOVER_REST)
          )
      }
      if (kind === 'wren' && away() && !seeds.length && !homing) {
        homing = true
        later(() => {
          homing = false
          if (ready && !busy && !seeds.length && away()) run(goHome, 900)
        }, 2600)
      }
    }

    // One idle action.
    const act = async () => {
      if (kind === 'wren') {
        const r = Math.random()
        if (r < 0.2) {
          // Finds a seed by itself on the open ground nearby, and eats it.
          const { lo, hi } = reach.current
          const free: number[] = []
          for (let i = lo; i <= hi + w - 1; i++)
            if ((i < bird.dx || i > bird.dx + w - 1) && !seeds.some((s) => s.i === i)) free.push(i)
          if (free.length) {
            free.sort((a, b) => Math.abs(a - beak()) - Math.abs(b - beak()))
            const i = free[Math.floor(Math.random() * Math.min(3, free.length))]
            const seed: Seed = { i, el: sprite('S', i, ground, 220), landed: true, auto: true }
            seeds.push(seed)
            await sleep(700)
            return eat(seed)
          }
        }
        if (r < 0.6) {
          // Blink, sometimes twice.
          const eye = cells.find((s) => s.ch === 'o')?.el
          if (!eye) return
          const blink = (t: number) => {
            later(() => eye.setAttribute('data-blink', ''), t)
            later(() => eye.removeAttribute('data-blink'), t + 150)
          }
          blink(0)
          if (chance(0.35)) blink(330)
          return sleep(650)
        }
        if (r < 0.87) {
          // Peck: the head goes down to the ground and comes back, once or twice.
          const peck = (t: number) => {
            later(() => pose(birdPose(poses.peck1), () => 0, 120, 60), t)
            later(() => pose(birdPose(poses.peck2), () => 0, 120, 60), t + 190)
            later(() => pose(birdPose(poses.peck1), () => 0, 120, 60), t + 450)
            later(() => pose(birdPose(base), () => 0, 120, 60), t + 640)
          }
          peck(0)
          const twice = chance(0.45)
          if (twice) peck(950)
          return sleep(twice ? 1800 : 850)
        }
        // Tail flick.
        later(() => pose(birdPose(poses.flick), () => 0, 130, 60), 0)
        later(() => pose(birdPose(base), () => 0, 150, 60), 340)
        return sleep(650)
      }
      if (kind === 'play') {
        if (chance(0.6)) {
          // Pause for a moment, then play again.
          const ms = pose(bm(poses.pause), wave(220), 200)
          later(() => pose(bm(base), wave(220), 200), ms + 1000)
          return sleep(ms * 2 + 1000)
        }
        // A playhead: a brighter column sweeps left to right.
        const lit = cells.filter((s) => s.ch !== '.')
        for (let col = 0; col < w; col++) {
          const column = lit.filter((s) => s.i === col)
          later(() => column.forEach((s) => flip(s, 'H', 0, 120)), col * 170)
          later(() => column.forEach((s) => flip(s, 'X', 0, 140)), col * 170 + 380)
        }
        return sleep(w * 170 + 700)
      }
      // The leaderboard moves: a challenger climbs to the top, the old leader
      // drops a cell or two, third place shifts a little; now and then it
      // settles back to the podium.
      const leader = rank.indexOf(RANK_H)
      let target: [number, number, number]
      if (chance(0.3) && rank.join() !== RANK_BASE.join()) target = [...RANK_BASE]
      else {
        const others = [0, 1, 2].filter((b) => b !== leader)
        const challenger = others[Math.floor(Math.random() * 2)]
        const third = others.find((b) => b !== challenger)!
        target = [...rank]
        target[challenger] = RANK_H
        target[leader] = RANK_H - (chance(0.5) ? 1 : 2)
        const t = rank[third] + (chance(0.5) ? 0 : chance(0.5) ? 1 : -1)
        target[third] = Math.min(target[leader] - 1, Math.max(2, t))
      }
      // Bars that grow flip on from the bottom up; bars that shrink, top down.
      const from = rank
      rank = target
      return sleep(
        pose(
          bm(rankPose(target)),
          (s) => {
            const b = s.i / 2
            const grows = target[b] > from[b]
            const k = grows ? RANK_H - from[b] - 1 - s.j : s.j - (RANK_H - from[b])
            return Math.abs(k) * 110
          },
          200
        )
      )
    }

    let idle: ReturnType<typeof setTimeout> | undefined
    const schedule = (ms: number) => {
      clearTimeout(idle)
      if (still) return
      idle = setTimeout(tick, ms)
    }
    const tick = () => {
      if (!ready || busy || document.hidden) return schedule(between([2000, 4000]))
      const t = performance.now()
      if (t < lockedUntil) return schedule(lockedUntil - t + between([600, 2400]))
      run(act, BREATH, () => schedule(between(IDLE)))
    }

    const enter = () => {
      shown = true
      epoch++
      busy = false
      clear()
      sprites.forEach((c) => c.remove())
      sprites.clear()
      seeds.length = 0
      homing = false
      hovered = null
      bird.dx = 0
      bird.face = home
      const ms = pose(kind === 'rank' ? bm(rankPose(rank)) : shape(base), wave(IN_WAVE), IN_FLIP)
      later(() => {
        ready = true
        schedule(between([1500, 4000]))
      }, ms)
    }
    const leave = () => {
      shown = false
      ready = false
      epoch++
      busy = false
      release(0)
      clearTimeout(idle)
      clear()
      // Mid-action cells may be lit in another colour: they flip out too.
      for (const s of cells) s.el?.removeAttribute('data-blink')
      sprites.forEach((c) => unsprite(c, OUT_FLIP))
      seeds.length = 0
      pose(bm(Array(h).fill('.'.repeat(w))), wave(OUT_WAVE), OUT_FLIP)
      // The bird may be out in its yard: every cell flips out.
      for (const s of cells) flip(s, '.', Math.random() * OUT_WAVE, OUT_FLIP)
    }

    on.current = still
      ? null
      : {
          hover: (x) => {
            if (!ready) return
            hovered = x
            next()
          },
          unhover: () => {
            hovered = null
          },
          drop,
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
      epoch++
      release(0)
      clear()
      clearTimeout(idle)
      sprites.forEach((c) => c.remove())
      on.current = null
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
      {/* Seeds, notes and the crown: under the mark's own cells, so a seed
          falls behind the bird and is eaten under its beak. */}
      <div ref={layerRef} className="contents" />
      {keys.map((key, n) => {
        const [i, j] = key.split(',').map(Number)
        const ch = homeRows[j]?.[i] ?? '.'
        return (
          <i
            key={key}
            ref={(c) => {
              slots.current[n] = { i, j, el: c, ch: slots.current[n]?.ch ?? '.' }
            }}
            className={styles.cell}
            data-k={ch === '.' ? 'X' : ch}
            style={{ left: i * CELL, top: j * CELL }}
          />
        )
      })}
      {!still && kind === 'wren' && (
        // The open grid around the bird: a click drops a seed.
        <div
          ref={yardRef}
          className={`${styles.zone} ${styles.yard}`}
          data-grid-avoid=""
          onClick={(e) => on.current?.drop(e.clientX, e.clientY)}
        />
      )}
      {!still && kind === 'rank' && (
        // Room for the crown: the grid's own lit cells keep off it.
        <span
          className={styles.zone}
          data-grid-avoid=""
          style={{ left: -CELL, top: -3 * CELL, width: (w + 2) * CELL, height: 3 * CELL, pointerEvents: 'none' }}
        />
      )}
      {!still && (
        // The mark's own box: hovering it plays its easter egg.
        <div
          className={`${styles.zone} ${styles.core}`}
          onPointerEnter={(e) => on.current?.hover(e.clientX)}
          onPointerLeave={() => on.current?.unhover()}
        />
      )}
    </div>
  )
}
