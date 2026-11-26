/**
 * Where a visitor is, for the bold map's line to them: server only (lib/visitor.ts
 * for /api/where, and the lab page's `?from=`). It holds the full list of places,
 * used only to name the place near a visitor, so that list never reaches the
 * browser: the map names nothing but the tech hubs.
 */
// With extensions, so `node --test` (tests/unit/*.test.mts) can load it too.
import {
  cellKinds,
  cellOf,
  LOS_ANGELES,
  miles,
  placeLabel,
  type LngLat,
  type Place,
  type Visitor,
} from './geo.ts'
import { GRID } from './mapData.generated.ts'
import { PLACES } from './mapPlaces.generated.ts'
import { NEAR_LA_MILES } from './text.ts'

const places: Place[] = PLACES.map(([name, state, lon, lat, pop]) => ({
  name,
  state,
  at: [lon, lat] as const,
  pop,
  mi: miles(LOS_ANGELES, [lon, lat]),
}))

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
  if (mi < NEAR_LA_MILES) return { kind: 'here', at, near }
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
