/**
 * The About page's pixel pictures (preview ?bg=1): one per scene, drawn in
 * the background grid's own squares, in the gap above the scene.
 *
 * Every pose is a bitmap, one character per grid cell ('.' is open grid).
 * All poses of a picture share one box; going from one pose to the next
 * flips only the cells that change, like a split-flap board.
 */

export interface Frame {
  pose: string[]
  /** How long to hold it before the next frame (ms). */
  hold: number
  /** How long each cell's flip takes (ms). */
  flip?: number
}

export interface Art {
  id: string
  /** The colour of each character, as "r,g,b". */
  colors: Record<string, string>
  base: string[]
  /** Small idle actions; one is played every few seconds. */
  idles: Frame[][]
  /** How the picture builds when it flips in: from the ground up, or left to right. */
  order: 'up' | 'across'
}

const blank = (w: number) => '.'.repeat(w)

// ---- In LA: a sun setting between two palm trees ----
// A palm, 7 wide and 7 tall: a crown of fronds drooping over a trunk that
// leans out (`lean`: 1 right, -1 left). `sway` moves the crown a cell.
function palm(sway: 0 | 1 | -1, lean: 1 | -1): string[] {
  const crown =
    sway === 0
      ? ['..FFF..', '.FF.FF.']
      : sway === 1
        ? ['...FFF.', '..FF.FF']
        : ['.FFF...', 'FF.FF..']
  const low = lean === 1 ? '....T..' : '..T....'
  return [...crown, 'F..T..F', '...T...', low, low, low]
}
// The sun, 5 wide: a ray row, then a disc with a ray at each side. At rest
// its top ray is on row 2; `drop` lowers it, and the horizon (row 7) cuts it.
function sun(drop: number, rays: boolean): string[] {
  const rows = Array(7).fill(blank(5))
  const shape = [rays ? 's.s.s' : blank(5), '.SSS.', rays ? 'sSSSs' : '.SSS.', '.SSS.']
  shape.forEach((r, n) => {
    const j = 2 + drop + n
    if (j < 7) rows[j] = r
  })
  return rows
}
/** Draws `rows` onto `canvas` at column x, its lit cells over what is there. */
function stamp(canvas: string[][], rows: readonly string[], x: number) {
  rows.forEach((r, j) => [...r].forEach((ch, i) => ch !== '.' && (canvas[j][x + i] = ch)))
}
/**
 * The scene: the sun between two palms, over the horizon. `tight` (phones)
 * stands the palms a cell closer in on each side, over the sun's edge rays.
 */
function scene(tight: boolean, opts: { sway?: 0 | 1 | -1; drop?: number; rays?: boolean } = {}) {
  const width = tight ? 15 : 17
  const canvas = Array.from({ length: 7 }, () => [...blank(width)])
  stamp(canvas, sun(opts.drop ?? 0, opts.rays ?? true), tight ? 5 : 6)
  // The palms stand in front of the sun.
  stamp(canvas, palm(opts.sway ?? 0, -1), 0)
  stamp(canvas, palm(opts.sway ?? 0, 1), tight ? 8 : 10)
  return [...canvas.map((r) => r.join('')), 'G'.repeat(width)]
}

const laArt = (tight: boolean): Art => {
  const la = (opts: Parameters<typeof scene>[1] = {}) => scene(tight, opts)
  return {
    id: 'la',
    colors: {
      F: '45,212,191', // teal-400 fronds
      T: '180,120,70', // warm trunk
      S: '251,191,36', // amber-400 sun
      s: '251,146,60', // orange-400 rays
      G: '14,165,233', // sky-500 horizon
    },
    base: la(),
    order: 'up',
    idles: [
      // The rays pulse.
      [
        { pose: la({ rays: false }), hold: 420 },
        { pose: la(), hold: 420 },
        { pose: la({ rays: false }), hold: 420 },
        { pose: la(), hold: 300 },
      ],
      // A breeze: the fronds sway one way, then the other.
      [
        { pose: la({ sway: 1 }), hold: 380 },
        { pose: la(), hold: 300 },
        { pose: la({ sway: -1 }), hold: 380 },
        { pose: la(), hold: 300 },
      ],
      // The sun sets behind the horizon and comes back up.
      [
        { pose: la({ drop: 1 }), hold: 450, flip: 240 },
        { pose: la({ drop: 2, rays: false }), hold: 450, flip: 240 },
        { pose: la({ drop: 3, rays: false }), hold: 450, flip: 240 },
        { pose: la({ drop: 4, rays: false }), hold: 1300, flip: 240 },
        { pose: la({ drop: 3, rays: false }), hold: 450, flip: 240 },
        { pose: la({ drop: 2, rays: false }), hold: 450, flip: 240 },
        { pose: la({ drop: 1 }), hold: 450, flip: 240 },
        { pose: la(), hold: 400, flip: 260 },
      ],
    ],
  }
}
export const LA = laArt(false)
const LA_TIGHT = laArt(true)

// ---- At work: a ringing phone, answered by AI ----
// A phone, ring waves, a speech bubble with typing dots, and an AI spark.
function work(
  opts: { ring?: 0 | 1 | 2; dots?: number; screen?: boolean; spark?: 'on' | 'big' | 'off' } = {}
) {
  // At rest one ring wave shows, so it reads as a call.
  const ring = opts.ring ?? 1
  const p = opts.screen ? 'L' : 'p'
  const r1 = ring >= 2 ? 'R' : '.'
  const r0 = ring >= 1 ? 'R' : '.'
  // Dots: the holes in the bubble light up one by one (0 to 3).
  const dot = (n: number) => ((opts.dots ?? 0) > n ? 'D' : '.')
  const spark = opts.spark ?? 'on'
  const a = spark === 'off' ? '.' : 'A'
  const c = spark === 'off' ? '.' : 'a'
  const big = spark === 'big' ? 'A' : '.'
  return [
    `PPP...........${big}.`.slice(0, 16),
    `P${p}P.${r1}.WWWWWWW.${a}.`,
    `P${p}P${r0}..W${dot(0)}W${dot(1)}W${dot(2)}W${a}${c}${a}`,
    `P${p}P${r0}..WWWWWWW.${a}.`,
    `P${p}P.${r1}..W..........`.slice(0, 16),
    'PPP.............',
  ]
}

export const WORK: Art = {
  id: 'work',
  colors: {
    P: '56,189,248', // sky-400 phone
    p: '12,74,110', // its dark screen
    L: '186,230,253', // its screen lit by the call
    R: '251,191,36', // amber ring
    W: '186,230,253', // sky-200 bubble
    D: '37,99,235', // blue-600 typing dots
    A: '34,211,238', // cyan-400 spark
    a: '240,249,255', // its bright heart
  },
  base: work(),
  order: 'across',
  idles: [
    // A call comes in; the AI picks up and types its answer.
    [
      { pose: work({ ring: 1, screen: true }), hold: 220, flip: 120 },
      { pose: work({ ring: 2, screen: true }), hold: 220, flip: 120 },
      { pose: work({ ring: 0, screen: true }), hold: 200, flip: 120 },
      { pose: work({ ring: 1, screen: true }), hold: 220, flip: 120 },
      { pose: work({ ring: 2, screen: true }), hold: 220, flip: 120 },
      { pose: work({ ring: 0, screen: true, spark: 'big' }), hold: 360, flip: 140 },
      { pose: work({ dots: 1, screen: true }), hold: 260, flip: 140 },
      { pose: work({ dots: 2, screen: true }), hold: 260, flip: 140 },
      { pose: work({ dots: 3, screen: true }), hold: 700, flip: 140 },
      { pose: work(), hold: 300 },
    ],
    // The spark twinkles.
    [
      { pose: work({ spark: 'big' }), hold: 300, flip: 140 },
      { pose: work(), hold: 260, flip: 140 },
      { pose: work({ spark: 'big' }), hold: 300, flip: 140 },
      { pose: work(), hold: 200, flip: 140 },
    ],
  ],
}

// ---- Where I build in public: a monitor typing code, with a live dot ----
// `typed` cells of code are on screen (two lines), the cursor after them.
const LINE1 = 4
const LINE2 = 3
function setup(opts: { typed?: number; cursor?: boolean; live?: boolean } = {}) {
  const typed = opts.typed ?? LINE1 + LINE2
  const cursor = opts.cursor ?? true
  const live = (opts.live ?? true) ? 'L' : 'm'
  // Line 1 starts at column 2, line 2 (indented) at column 3; interior is columns 1 to 9.
  const row1 = [...'mmmmmmmmm']
  const row2 = [...'mmmmmmmmm']
  for (let n = 0; n < Math.min(typed, LINE1); n++) row1[1 + n] = 'C'
  for (let n = 0; n < Math.max(0, typed - LINE1); n++) row2[2 + n] = 'c'
  if (cursor) {
    if (typed < LINE1) row1[1 + typed] = 'U'
    else row2[2 + (typed - LINE1)] = 'U'
  }
  row1[8] = live
  return [
    'MMMMMMMMMMM',
    `M${row1.join('')}M`,
    `M${row2.join('')}M`,
    'MmmmmmmmmmM',
    'MMMMMMMMMMM',
    '....MMM....',
    '..MMMMMMM..',
  ]
}

export const SETUP: Art = {
  id: 'setup',
  colors: {
    M: '56,189,248', // sky-400 frame and stand
    m: '15,42,68', // the dark screen
    C: '103,232,249', // cyan-300 code
    c: '165,180,252', // indigo-300 code
    U: '240,249,255', // the cursor
    L: '239,68,68', // red-500 live dot
  },
  base: setup(),
  order: 'up',
  idles: [
    // Clear the screen and type the two lines again, the cursor riding along.
    [
      { pose: setup({ typed: 0 }), hold: 500, flip: 160 },
      ...Array.from({ length: LINE1 + LINE2 }, (_, n) => ({
        pose: setup({ typed: n + 1 }),
        hold: 150 + Math.round(Math.random() * 120),
        flip: 110,
      })),
      { pose: setup({ cursor: false }), hold: 380, flip: 100 },
      { pose: setup(), hold: 380, flip: 100 },
      { pose: setup({ cursor: false }), hold: 380, flip: 100 },
      { pose: setup(), hold: 300, flip: 100 },
    ],
    // On air: the live dot blinks.
    [
      { pose: setup({ live: false }), hold: 420, flip: 140 },
      { pose: setup(), hold: 420, flip: 140 },
      { pose: setup({ live: false }), hold: 420, flip: 140 },
      { pose: setup(), hold: 300, flip: 140 },
    ],
  ],
}

/** Which picture goes above which scene. */
export function artFor(id: string, wide: boolean): Art | undefined {
  if (id === 'la') return wide ? LA : LA_TIGHT
  return id === 'work' ? WORK : id === 'setup' ? SETUP : undefined
}
