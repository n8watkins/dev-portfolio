/**
 * The About page's pixel pictures: one per scene, drawn in the background
 * grid's own squares in the gap above the scene (owner, 2026-11-25: "cool
 * box art like on the main page, where LA is like a sun with two palm
 * trees"). PixelPicture.tsx draws and animates them.
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

/**
 * A colour: `rgb` as "r,g,b". A cell's square is a deep shade of it with its
 * own colour as the edge, as the Projects experiment's marks are; a `glow`
 * colour (the sun, the bubble, a cursor) is lit at full strength instead.
 */
export interface Paint {
  rgb: string
  glow?: boolean
}

export interface Picture {
  id: string
  paints: Record<string, Paint>
  base: string[]
  /** Small idle actions; one plays every few seconds while it is on screen. */
  idles: Frame[][]
  /** How it builds when it flips in: from the ground up, or left to right. */
  order: 'up' | 'across'
}

const blank = (w: number) => '.'.repeat(w)

/** Draws `rows` onto `canvas` at column x, its lit cells over what is there. */
function stamp(canvas: string[][], rows: readonly string[], x: number) {
  rows.forEach((r, j) => [...r].forEach((ch, i) => ch !== '.' && (canvas[j][x + i] = ch)))
}

// ---- Los Angeles: the sun setting between two palm trees ----

/**
 * A palm, 7 wide and 7 tall: a crown of fronds drooping over a trunk that
 * leans out (`lean`: 1 right, -1 left). `sway` moves the crown a cell.
 */
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

/**
 * The sun, 5 wide: a ray row, then a disc with a ray at each side. At rest
 * its top ray is on row 2; `drop` lowers it and the horizon (row 7) cuts it.
 */
function sun(drop: number, rays: boolean): string[] {
  const rows = Array(7).fill(blank(5))
  const shape = [rays ? 's.s.s' : blank(5), '.SSS.', rays ? 'sSSSs' : '.SSS.', '.SSS.']
  shape.forEach((r, n) => {
    const j = 2 + drop + n
    if (j < 7) rows[j] = r
  })
  return rows
}

type LaPose = { sway?: 0 | 1 | -1; drop?: number; rays?: boolean }

/**
 * The sun between two palms, over the horizon. `tight` (small cells, narrow
 * screens) stands the palms a cell closer in on each side.
 */
function la(tight: boolean, opts: LaPose = {}) {
  const width = tight ? 15 : 17
  const canvas = Array.from({ length: 7 }, () => [...blank(width)])
  stamp(canvas, sun(opts.drop ?? 0, opts.rays ?? true), tight ? 5 : 6)
  // The palms stand in front of the sun.
  stamp(canvas, palm(opts.sway ?? 0, -1), 0)
  stamp(canvas, palm(opts.sway ?? 0, 1), tight ? 8 : 10)
  return [...canvas.map((r) => r.join('')), 'G'.repeat(width)]
}

function laPicture(tight: boolean): Picture {
  const pose = (opts: LaPose = {}) => la(tight, opts)
  return {
    id: 'la',
    paints: {
      F: { rgb: '52,211,153' }, // emerald-400 fronds
      T: { rgb: '217,155,98' }, // warm trunks
      S: { rgb: '252,196,45', glow: true }, // amber sun
      s: { rgb: '251,140,60', glow: true }, // orange rays
      G: { rgb: '56,189,248' }, // sky-400 horizon
    },
    base: pose(),
    order: 'up',
    idles: [
      // The rays pulse.
      [
        { pose: pose({ rays: false }), hold: 420 },
        { pose: pose(), hold: 420 },
        { pose: pose({ rays: false }), hold: 420 },
        { pose: pose(), hold: 300 },
      ],
      // A breeze: the fronds sway one way, then the other.
      [
        { pose: pose({ sway: 1 }), hold: 380 },
        { pose: pose(), hold: 300 },
        { pose: pose({ sway: -1 }), hold: 380 },
        { pose: pose(), hold: 300 },
      ],
      // The sun sets behind the horizon and comes back up.
      [
        { pose: pose({ drop: 1 }), hold: 450, flip: 240 },
        { pose: pose({ drop: 2, rays: false }), hold: 450, flip: 240 },
        { pose: pose({ drop: 3, rays: false }), hold: 450, flip: 240 },
        { pose: pose({ drop: 4, rays: false }), hold: 1300, flip: 240 },
        { pose: pose({ drop: 3, rays: false }), hold: 450, flip: 240 },
        { pose: pose({ drop: 2, rays: false }), hold: 450, flip: 240 },
        { pose: pose({ drop: 1 }), hold: 450, flip: 240 },
        { pose: pose(), hold: 400, flip: 260 },
      ],
    ],
  }
}

// ---- At work: a call to a business, answered by AI ----

/**
 * A phone (speaker notch on top, home bar below, its screen lit) ringing,
 * with ring waves on both sides; above it an AI spark, and beside that a
 * speech bubble with three dots: the AI answering for the business.
 * Placeholders: o outer ring wave, i inner ring wave, d a dot in the bubble.
 */
const WORK_ROWS = [
  '........A.WWWWWWW',
  '.......AaAWdWdWdW',
  '..PKKP..A.WWWWWWW',
  'o.PppP.o...W.....',
  '.iPppPi..........',
  '.iPppPi..........',
  'o.PppP.o.........',
  '..PHHP...........',
]

type WorkPose = { ring?: 0 | 1 | 2; typed?: number; spark?: boolean }

function work(opts: WorkPose = {}) {
  const ring = opts.ring ?? 2
  const typed = opts.typed ?? 3
  const spark = opts.spark ?? true
  return WORK_ROWS.map((row) => {
    let dot = 0
    return [...row]
      .map((ch) => {
        if (ch === 'o') return ring >= 2 ? 'R' : '.'
        if (ch === 'i') return ring >= 1 ? 'R' : '.'
        // The bubble's dots are open grid until typed, then blue.
        if (ch === 'd') return dot++ < typed ? 'D' : '.'
        if (ch === 'A' || ch === 'a') return spark ? ch : '.'
        return ch
      })
      .join('')
  })
}

const WORK: Picture = {
  id: 'work',
  paints: {
    P: { rgb: '125,211,252' }, // sky-300 phone
    K: { rgb: '30,41,59' }, // its speaker notch
    p: { rgb: '56,189,248', glow: true }, // its lit screen
    H: { rgb: '224,242,254', glow: true }, // its home bar
    R: { rgb: '252,196,45', glow: true }, // amber ring waves
    W: { rgb: '224,242,254', glow: true }, // the bright bubble
    D: { rgb: '37,99,235', glow: true }, // its dots
    A: { rgb: '34,211,238', glow: true }, // the cyan AI spark
    a: { rgb: '255,255,255', glow: true }, // its bright heart
  },
  base: work(),
  order: 'across',
  idles: [
    // It rings, then the AI types its answer.
    [
      { pose: work({ ring: 0 }), hold: 180, flip: 110 },
      { pose: work({ ring: 1 }), hold: 180, flip: 110 },
      { pose: work({ ring: 2 }), hold: 220, flip: 110 },
      { pose: work({ ring: 0 }), hold: 180, flip: 110 },
      { pose: work({ ring: 1 }), hold: 180, flip: 110 },
      { pose: work({ ring: 2, typed: 0 }), hold: 320, flip: 130 },
      { pose: work({ typed: 1 }), hold: 260, flip: 130 },
      { pose: work({ typed: 2 }), hold: 260, flip: 130 },
      { pose: work({ typed: 3 }), hold: 500, flip: 130 },
    ],
    // The spark twinkles.
    [
      { pose: work({ spark: false }), hold: 260, flip: 140 },
      { pose: work(), hold: 260, flip: 140 },
      { pose: work({ spark: false }), hold: 260, flip: 140 },
      { pose: work(), hold: 200, flip: 140 },
    ],
  ],
}

// ---- Where I build in public: a monitor typing code, live ----

const LINE1 = 4
const LINE2 = 3

/** `typed` cells of code on screen (two lines), the cursor after them, and the live dot. */
function setup(opts: { typed?: number; cursor?: boolean; live?: boolean } = {}) {
  const typed = opts.typed ?? LINE1 + LINE2
  const cursor = opts.cursor ?? true
  // The screen's inside is columns 1 to 9: line 1 starts at column 2, line 2 (indented) at 3.
  const row1 = [...'mmmmmmmmm']
  const row2 = [...'mmmmmmmmm']
  for (let n = 0; n < Math.min(typed, LINE1); n++) row1[1 + n] = 'C'
  for (let n = 0; n < Math.max(0, typed - LINE1); n++) row2[2 + n] = 'c'
  if (cursor) {
    if (typed < LINE1) row1[1 + typed] = 'U'
    else row2[2 + (typed - LINE1)] = 'U'
  }
  row1[8] = (opts.live ?? true) ? 'L' : 'm'
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

// Typing speed varies a little per key, fixed here so every visit is the same.
const KEY_HOLDS = [190, 150, 230, 170, 210, 160, 200]

const SETUP: Picture = {
  id: 'setup',
  paints: {
    M: { rgb: '125,211,252' }, // sky-300 frame and stand
    m: { rgb: '30,58,95' }, // the dark screen
    C: { rgb: '103,232,249', glow: true }, // cyan-300 code
    c: { rgb: '165,180,252', glow: true }, // indigo-300 code
    U: { rgb: '255,255,255', glow: true }, // the cursor
    L: { rgb: '248,82,82', glow: true }, // the red live dot
  },
  base: setup(),
  order: 'up',
  idles: [
    // The screen clears and the code types itself again, the cursor riding along.
    [
      { pose: setup({ typed: 0 }), hold: 500, flip: 160 },
      ...KEY_HOLDS.map((hold, n) => ({ pose: setup({ typed: n + 1 }), hold, flip: 110 })),
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

const LA = laPicture(false)
const LA_TIGHT = laPicture(true)

/** The picture above a scene, by the scene's id; `tight` for small cells. */
export function pictureFor(id: string, tight: boolean): Picture | undefined {
  if (id === 'la') return tight ? LA_TIGHT : LA
  return id === 'work' ? WORK : id === 'setup' ? SETUP : undefined
}
