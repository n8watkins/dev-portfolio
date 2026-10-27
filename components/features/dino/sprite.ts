// The easter-egg dino's pixel art, drawn for this site (not Google's sprite):
// a chunky baby T-rex with back spikes, a round snout and a stubby arm.
// Each string is one row of pixels, facing right: '#' body, 'e' eye,
// 'w' eye shine, '.' empty. The frames share the body and differ in the legs
// (two walking steps, legs tucked for a hop) and the face (a scared one for a
// fall, with the arms up).

const BODY = [
  '.......#.#.#....',
  '......#######...',
  '.....##########.',
  '.....###ew######',
  '.....###ee######',
  '.....##########.',
  '#....######.....',
  '#...#########...',
  '##.##########...',
  '###########.#...',
  '.##########.....',
  '..########......',
]

const SCARED = [
  '.......#.#.#....',
  '......#######...',
  '.....##########.',
  '.....##eew######',
  '.....##eee######',
  '.....###########',
  '#....#####.##...',
  '#...########.#..',
  '##.##########...',
  '###########.....',
  '.##########.....',
  '..########......',
]

const LEGS = {
  stepA: ['...##....##.....', '...#......##....'],
  stepB: ['....##..##......', '.....##..#......'],
  tucked: ['...##...##......', '................'],
  dangling: ['...#......#.....', '..#........#....'],
} as const

export type DinoFrame = 'stepA' | 'stepB' | 'hop' | 'fall'

export const DINO_FRAMES: Record<DinoFrame, string[]> = {
  stepA: [...BODY, ...LEGS.stepA],
  stepB: [...BODY, ...LEGS.stepB],
  hop: [...BODY, ...LEGS.tucked],
  fall: [...SCARED, ...LEGS.dangling],
}

export const DINO_COLS = 16
export const DINO_ROWS = 14

/** One SVG path per colour, with a 1x1 square per pixel. */
export function framePaths(rows: string[]) {
  const paths: Record<'body' | 'eye' | 'shine', string> = { body: '', eye: '', shine: '' }
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const key = row[x] === '#' ? 'body' : row[x] === 'e' ? 'eye' : row[x] === 'w' ? 'shine' : null
      if (key) paths[key] += `M${x} ${y}h1v1h-1z`
    }
  })
  return paths
}
