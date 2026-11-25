/**
 * LAB (exp/project-marks): the pixel marks drawn from the Projects section's
 * grid squares, one per project, beside its card on wide screens.
 *
 * Every pose is a bitmap, one character per 52px grid cell:
 *   X  the project's colour
 *   d  the same, dimmer (the bird's legs)
 *   B  Wren's ember beak
 *   o  a body cell carrying the bird's eye
 *   H  a brighter cell (the play button's playhead, the podium's crown)
 *   .  open grid
 * and, drawn on their own outside a pose (PixelMark's sprites):
 *   S  a seed for the bird
 *   N  a note the bird sings, a small square inside its cell
 * All poses of a mark share one box, so the mark never moves on the grid;
 * going from one pose to the next flips only the cells that change.
 */
import type { Project } from '@/lib/types'

export type MarkKind = 'rank' | 'play' | 'wren'

/** How a mark builds: from the floor up, or swept the way it faces. */
export type MarkOrder = 'up' | 'across'

/** Portfolio Rank's three bars (left, middle, right), in cells, as a 5x7 bitmap. */
export function rankPose(heights: readonly [number, number, number]): string[] {
  const rows: string[] = []
  for (let j = 0; j < RANK_H; j++) {
    const lit = (h: number) => (RANK_H - j <= h ? 'X' : '.')
    rows.push(`${lit(heights[0])}.${lit(heights[1])}.${lit(heights[2])}`)
  }
  return rows
}
export const RANK_H = 7
/** The podium at rest: second, first, third. */
export const RANK_BASE = [4, 7, 2] as const

export const POSES = {
  rank: { base: rankPose(RANK_BASE) },
  play: {
    base: ['X.....', 'XXX...', 'XXXXX.', 'XXXXXX', 'XXXXX.', 'XXX...', 'X.....'],
    pause: ['......', 'XX.XX.', 'XX.XX.', 'XX.XX.', 'XX.XX.', 'XX.XX.', '......'],
  },
  // A small perching bird, facing right: tail cocked up behind, round body,
  // head with an eye, ember beak, two legs.
  wren: {
    base: ['X...XX.', 'XX.XXoB', '.XXXXX.', '..XXX..', '..d.d..'],
    // Head lowered a row, then down to the ground to eat.
    peck1: ['X......', 'XX..XX.', '.XXXXoB', '..XXX..', '..d.d..'],
    peck2: ['X......', 'XX.....', '.XXXXX.', '..XXXXo', '..d.d.B'],
    // The tail swept down and back.
    flick: ['....XX.', 'X..XXoB', 'XXXXXX.', '..XXX..', '..d.d..'],
    // Beak open to sing: the upper half up a row, the lower half down one.
    chirp: ['X...XXB', 'XX.XXo.', '.XXXXXB', '..XXX..', '..d.d..'],
    // Puffed up, pleased with itself (after a few seeds).
    puff: ['X..XXX.', 'XXXXXoB', '.XXXXXX', '..XXXX.', '..d.d..'],
  },
} satisfies Record<MarkKind, Record<string, string[]>>

/**
 * The play button's equaliser (its hover easter egg): six bars of these
 * heights, in cells, standing in its 6x7 box, each topped with a bright cell.
 */
export function eqPose(heights: readonly number[]): string[] {
  const rows: string[] = []
  for (let j = 0; j < 7; j++)
    rows.push(heights.map((h) => (7 - j < h ? 'X' : 7 - j === h ? 'H' : '.')).join(''))
  return rows
}

export const ORDER: Record<MarkKind, MarkOrder> = { rank: 'up', play: 'across', wren: 'across' }

/** Which mark goes with which project, by its accent. */
export const markFor: Record<Project['accent'], MarkKind> = {
  'portfolio-rank': 'rank',
  'net-trailer': 'play',
  wren: 'wren',
}

export type MarksMode = 'off' | 'still' | 'quiet' | 'default' | 'bold'

/**
 * `?marks=0` is today's layout; `quiet` and `bold` set the loudness around
 * the default; `still` keeps the flips in and out but no idle actions.
 */
export function marksMode(value: string | null): MarksMode {
  if (value === '0' || value === 'off') return 'off'
  if (value === 'quiet' || value === 'bold' || value === 'still') return value
  return 'default'
}
