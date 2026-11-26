/**
 * The bold map's words, without its data: the card's screen-reader sentence
 * and the check on the location answer. Kept apart from geo.ts so the card's
 * placeholder (BoldMapLazy) can say them before the map and its data load.
 */
import type { Visitor } from './geo'

/**
 * "Near Los Angeles" (owner, 2026-11-25): within 60 miles of downtown, measured
 * to the visitor's coarse point or the place named near it. That is the LA
 * area people mean (Long Beach, Pasadena, the Valley, Orange County,
 * Riverside); San Diego and Santa Barbara are a real move and get a line.
 */
export const NEAR_LA_MILES = 60

/** Miles rounded to tens, with a thousands comma: "1,230". */
export const formatMiles = (m: number) => (Math.round(m / 10) * 10).toLocaleString('en-US')

/*
 * The card's words, the owner's picks (2026-11-25: "dont need those captions,
 * i just wanted to prioritize the right cities being cycled. i like the home
 * base one, i like the hey neighbor, and i like ready to relocate still").
 * No caption; the chip says where he is, the card's title ("Ready to relocate",
 * gridItem2.tsx) says what he wants, and the screen-reader sentence says what
 * the lines are.
 */
/** The chip under Los Angeles: the one place the card names the city. */
export const CHIP_TEXT = 'Los Angeles · home base'
/** Under the chip, for a visitor in the LA area, instead of a label of their own. */
export const NEIGHBOUR_TEXT = 'Hey, neighbor'

/** What the map says, for screen readers (the map itself is decorative). */
export function boldMapText(visitor: Visitor | null) {
  const base =
    'A map of the United States with lines from Los Angeles, where Nathan is based, to the tech hubs he would move to.'
  if (visitor?.kind === 'us') {
    const near = visitor.near ? `near ${visitor.near}, ` : ''
    return `${base} You seem to be ${near}about ${formatMiles(visitor.mi)} miles away.`
  }
  if (visitor?.kind === 'here') return `${base} You seem to be in the Los Angeles area too.`
  return base
}

const num = (v: unknown, lo: number, hi: number) =>
  typeof v === 'number' && Number.isFinite(v) && v >= lo && v <= hi
const point = (v: unknown) =>
  Array.isArray(v) && v.length === 2 && num(v[0], -180, 180) && num(v[1], -90, 90)
const name = (v: unknown) => v === null || (typeof v === 'string' && v.length <= 80)

/** A visitor as /api/where sends it, or null for anything else. */
export function asVisitor(v: unknown): Visitor | null {
  if (!v || typeof v !== 'object') return null
  const o = v as Record<string, unknown>
  if (!point(o.at) || !name(o.near)) return null
  const at = [(o.at as number[])[0], (o.at as number[])[1]] as const
  const near = o.near as string | null
  if (o.kind === 'here') return { kind: 'here', at, near }
  if (o.kind === 'us' && num(o.mi, 0, 4000)) return { kind: 'us', at, near, mi: o.mi as number }
  return null
}
