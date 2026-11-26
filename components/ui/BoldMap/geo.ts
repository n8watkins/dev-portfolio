/**
 * The bold map's geography, for the browser and the server: the Albers plane
 * its grid was sampled on, distances, the tech hubs and the lit cities.
 * Where a visitor is (from the full list of places) is visitorGeo.ts, on the
 * server only, so that list never reaches the browser.
 */
// With its extension, so `node --test` (tests/unit/*.test.mts) can load it too.
import { GRID, KINDS, LIGHTS } from './mapData.generated.ts'
import { TECH_CITIES } from './techCities.ts'

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
  /** Miles from Los Angeles. */
  mi: number
}

/** The map's route destinations (techCities.ts), with their miles from Los Angeles. */
export const techCities: Place[] = TECH_CITIES.map((c) => ({
  name: c.name,
  state: c.state,
  at: [c.lon, c.lat] as LngLat,
  pop: 0,
  mi: miles(LOS_ANGELES, [c.lon, c.lat]),
}))

/** The larger places (300,000 or more), lit on the map; never named by it. */
export const lights: Place[] = LIGHTS.map(([name, state, lon, lat, pop]) => ({
  name,
  state,
  at: [lon, lat] as const,
  pop,
  mi: miles(LOS_ANGELES, [lon, lat]),
}))

export const placeLabel = (p: Pick<Place, 'name' | 'state'>) =>
  p.state ? `${p.name}, ${p.state}` : p.name

export { formatMiles, NEAR_LA_MILES } from './text.ts'

/**
 * What the map is told about the visitor. Never more than a coarse point (half
 * a degree, about 35 miles) and the name of a place near it.
 */
export type Visitor =
  /** Within NEAR_LA_MILES of Los Angeles: no line; the Los Angeles chip greets them. */
  | { kind: 'here'; at: LngLat; near: string | null }
  /** Elsewhere in the lower 48: a line from Los Angeles to them. */
  | { kind: 'us'; at: LngLat; near: string | null; mi: number }

/** Base64 to bytes, in the browser and on the server (Workers and Node both have atob). */
export const bytesOf = (b64: string) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))

let kindsCache: Uint8Array | null = null
/** One byte per cell: 0 water, 1 the United States, 2 a neighbour. */
export const cellKinds = () => (kindsCache ??= bytesOf(KINDS))
