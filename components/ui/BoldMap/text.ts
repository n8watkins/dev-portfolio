/**
 * The bold map's words, without its data: the card's screen-reader sentence
 * and the check on the location answer. Kept apart from geo.ts so the card's
 * placeholder (BoldMapLazy) can say them before the map and its data load.
 */
import type { Visitor } from './geo'

/** Miles rounded to tens, with a thousands comma: "1,230". */
export const formatMiles = (m: number) => (Math.round(m / 10) * 10).toLocaleString('en-US')

/** What the map says, for screen readers (the map itself is decorative). */
export function boldMapText(visitor: Visitor | null) {
  const base =
    'A map of the United States: Nathan is in Los Angeles, California, and open to relocating anywhere.'
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
