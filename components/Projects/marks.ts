/**
 * LAB (exp/project-marks): the pixel marks drawn from the Projects section's
 * grid squares, one per project, beside its card on wide screens.
 *
 * One character per 52px grid cell:
 *   X  the project's colour, full
 *   m  the same at 75% (Portfolio Rank's second place)
 *   d  the same at 55% (third place, the bird's legs and perch)
 *   #  the bright highlight (the leader's cap)
 *   B  Wren's ember beak
 *   o  a body cell carrying the bird's eye
 *   .  open grid
 */
import type { Project } from '@/lib/types'

export type MarkKind = 'rank' | 'play' | 'wren'

/** How a mark builds: from the floor up, or swept the way it faces. */
export type MarkOrder = 'up' | 'across'

export const MARKS: Record<MarkKind, { rows: string[]; order: MarkOrder }> = {
  // Portfolio Rank's icon as a podium: second, first (its gold cap sitting
  // right on top), third.
  rank: {
    rows: ['..#..', '..X..', '..X..', 'm.X..', 'm.X..', 'm.X.d', 'm.X.d'],
    order: 'up',
  },
  // NetTrailers: a play button.
  play: {
    rows: ['X.....', 'XXX...', 'XXXXX.', 'XXXXXX', 'XXXXX.', 'XXX...', 'X.....'],
    order: 'across',
  },
  // Wren: a small perching bird, facing right: its tail cocked up behind, a
  // round body, a head with an eye and an ember beak, two legs. No empty
  // rows or columns around it.
  wren: {
    rows: ['X...XX.', 'XX.XXoB', '.XXXXX.', '..XXX..', '..d.d..'],
    order: 'across',
  },
}

/** Which mark goes with which project, by its accent. */
export const markFor: Record<Project['accent'], MarkKind> = {
  'portfolio-rank': 'rank',
  'net-trailer': 'play',
  wren: 'wren',
}

export type MarksMode = 'off' | 'quiet' | 'medium' | 'bold'

/** `?marks=0` is today's layout; `quiet` and `bold` set the loudness; anything else is the default. */
export function marksMode(value: string | null): MarksMode {
  if (value === '0' || value === 'off') return 'off'
  if (value === 'quiet' || value === 'bold') return value
  return 'medium'
}
