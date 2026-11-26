/**
 * The bold map's geography: the Albers plane its grid was sampled on, the
 * places, and where a visitor is. Pure functions, used on the server (to turn
 * Cloudflare's request data into a coarse visitor) and in the browser.
 */
// With its extension, so `node --test` (tests/unit/boldMapGeo.test.mts) can load it too.
import { GRID, KINDS, PLACES } from './mapData.generated.ts'

const rad = Math.PI / 180
const p1 = 29.5 * rad
const p2 = 45.5 * rad
const l0 = -96 * rad
const f0 = 37.5 * rad
const n = (Math.sin(p1) + Math.sin(p2)) / 2
const C = Math.cos(p1) ** 2 + 2 * n * Math.sin(p1)
const rho0 = Math.sqrt(C - 2 * n * Math.sin(f0)) / n

export type LngLat = readonly [number, number]

/** A longitude and latitude as a position on the grid, in cells (x east, y south). */
export function cellOf([lon, lat]: LngLat): [number, number] {
  const rho = Math.sqrt(C - 2 * n * Math.sin(lat * rad)) / n
  const th = n * (lon * rad - l0)
  return [
    (rho * Math.sin(th) - GRID.x0) / GRID.pitch,
    (-(rho0 - rho * Math.cos(th)) - GRID.y0) / GRID.pitch,
  ]
}

/** Great-circle distance in miles. */
export function miles(a: LngLat, b: LngLat): number {
  const dla = (b[1] - a[1]) * rad
  const dlo = (b[0] - a[0]) * rad
  const h =
    Math.sin(dla / 2) ** 2 + Math.cos(a[1] * rad) * Math.cos(b[1] * rad) * Math.sin(dlo / 2) ** 2
  return 3959 * 2 * Math.asin(Math.sqrt(h))
}

export const LOS_ANGELES: LngLat = [-118.24, 34.05]

export type Place = {
  name: string
  state: string
  at: LngLat
  pop: number
  /** The map's own routes may go here (a hand-checked list, one per metro). */
  route: boolean
  /** Miles from Los Angeles. */
  mi: number
}

export const places: Place[] = PLACES.map(([name, state, lon, lat, pop, route]) => ({
  name,
  state,
  at: [lon, lat] as const,
  pop,
  route: route === 1,
  mi: miles(LOS_ANGELES, [lon, lat]),
}))

export const placeLabel = (p: Pick<Place, 'name' | 'state'>) =>
  p.state ? `${p.name}, ${p.state}` : p.name

export { formatMiles } from './text.ts'

/**
 * What the map is told about the visitor. Never more than a coarse point (half
 * a degree, about 35 miles) and the name of a place near it.
 */
export type Visitor =
  /** Within 120 miles of Los Angeles: no line, a "you're here too" label. */
  | { kind: 'here'; at: LngLat; near: string | null }
  /** Elsewhere in the lower 48: a line from Los Angeles to them. */
  | { kind: 'us'; at: LngLat; near: string | null; mi: number }

/** Base64 to bytes, in the browser and on the server (Workers and Node both have atob). */
export const bytesOf = (b64: string) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))

let kindsCache: Uint8Array | null = null
/** One byte per cell: 0 water, 1 the United States, 2 a neighbour. */
export const cellKinds = () => (kindsCache ??= bytesOf(KINDS))

/** Whether a point is on the lower 48 of the grid (or within a cell of its coast). */
function onLower48(at: LngLat): boolean {
  const kinds = cellKinds()
  const [x, y] = cellOf(at)
  for (let dj = -1; dj <= 1; dj++) {
    for (let di = -1; di <= 1; di++) {
      const i = Math.floor(x) + di
      const j = Math.floor(y) + dj
      if (i < 0 || j < 0 || i >= GRID.cols || j >= GRID.rows) continue
      if (kinds[j * GRID.cols + i] === 1) return true
    }
  }
  return false
}

const coarse = (v: number) => Math.round(v * 2) / 2

/** The place to name near a point: a city of 100,000 or more within 60 miles, else any listed place within 40. */
function nearName(at: LngLat): Place | null {
  let best: Place | null = null
  let bd = Infinity
  for (const p of places) {
    const d = miles(at, p.at)
    if (p.pop >= 100_000 ? d > 60 : d > 40) continue
    // A larger place wins over a hamlet a little nearer.
    const score = p.pop >= 100_000 ? d / (2 + Math.log10(p.pop / 100_000)) : d
    if (score < bd) {
      bd = score
      best = p
    }
  }
  return best
}

/**
 * A visitor from a latitude and longitude (and, from Cloudflare, a country).
 * Outside the United States, or off the lower 48 (Alaska, Hawaii), there is no
 * visitor: the map draws no line rather than a wrong one.
 */
export function visitorAt(lat: number, lng: number, country?: string | null): Visitor | null {
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180)
    return null
  if (country && country !== 'US') return null
  const at: LngLat = [coarse(lng), coarse(lat)]
  if (!onLower48(at)) return null
  const place = nearName(at)
  const near = place ? placeLabel(place) : null
  const mi = miles(LOS_ANGELES, place ? place.at : at)
  if (mi < 120) return { kind: 'here', at, near }
  return { kind: 'us', at, near, mi }
}

/** Named test places for the lab page's `?from=`, besides any listed place ("Denver", "Austin, TX"). */
const ALIASES: Record<string, LngLat | 'abroad'> = {
  la: LOS_ANGELES,
  nyc: [-73.98, 40.75],
  london: 'abroad',
  abroad: 'abroad',
  toronto: 'abroad',
}

/**
 * Reads the lab page's `?from=`: "lat,lng", a listed place ("Denver",
 * "Austin, TX"), or "london"/"abroad" (no line). Anything else: no visitor.
 */
export function visitorFromQuery(from: string): Visitor | null {
  const q = from.trim().toLowerCase()
  const nums = q.match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/)
  if (nums) return visitorAt(Number(nums[1]), Number(nums[2]))
  const alias = ALIASES[q]
  if (alias === 'abroad') return null
  if (alias) return visitorAt(alias[1], alias[0])
  const [name, state] = q.split(',').map((s) => s.trim())
  const matches = places.filter(
    (p) => p.name.toLowerCase() === name && (!state || p.state.toLowerCase() === state)
  )
  const p = matches.sort((a, b) => b.pop - a.pop)[0]
  return p ? visitorAt(p.at[1], p.at[0]) : null
}
