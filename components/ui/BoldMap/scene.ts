/**
 * The bold map's world, worked out once per page: one column per grid cell of
 * the United States and its neighbours, its height from real elevation, a cast
 * shadow from a low sun in the west, and the places that sit on the columns.
 *
 * World units: one per cell; x east, z south, y up; origin at the grid's middle.
 */
import { GRID, RELIEF } from './mapData.generated'
import {
  bytesOf,
  cellKinds,
  cellOf,
  LOS_ANGELES,
  lights as litPlaces,
  techCities,
  type Place,
} from './geo'

export type Cell = {
  i: number
  j: number
  X: number
  Z: number
  us: boolean
  /** Column height. */
  Hh: number
  /** 0, a light; up to 1, a large city; 2, Los Angeles. */
  city: number
  shadow: number
  rand: number
}

export type ScenePlace = Place & { cell: Cell }

export type Scene = {
  cells: Cell[]
  lights: ScenePlace[]
  targets: ScenePlace[]
  la: Cell
  bounds: { x0: number; x1: number; z0: number; z1: number }
  cx: number
  cz: number
  nearestUs: (x: number, z: number) => Cell
}

/** A small seeded random source, so the map looks the same on every visit. */
export function seeded(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

let cached: Scene | null = null

export function scene(): Scene {
  if (cached) return cached
  const { cols, rows } = GRID
  const kinds = cellKinds()
  const heights = bytesOf(RELIEF)
  const metres = (i: number, j: number) =>
    i < 0 || j < 0 || i >= cols || j >= rows ? 0 : (heights[j * cols + i] / 255) ** 2 * 4000
  const cx = cols / 2
  const cz = rows / 2
  const rnd = seeded(20261111)
  const grid: (Cell | null)[] = new Array(cols * rows).fill(null)
  const cells: Cell[] = []
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const kind = kinds[j * cols + i]
      if (!kind) continue
      const us = kind === 1
      const m = metres(i, j)
      // Real relief, exaggerated: a slab above the sea plus about one cell per 1000 m.
      const c: Cell = {
        i,
        j,
        X: i + 0.5 - cx,
        Z: j + 0.5 - cz,
        us,
        Hh: us ? 0.4 + (m / 1000) * 1.05 : 0.14 + (m / 1000) * 0.2,
        city: 0,
        shadow: 0,
        rand: rnd(),
      }
      cells.push(c)
      grid[j * cols + i] = c
    }
  }
  // Shadows cast from a low sun in the west.
  for (const c of cells) {
    let s = 0
    for (let k = 1; k <= 7; k++) {
      const o = c.i - k >= 0 ? grid[c.j * cols + c.i - k] : null
      if (o && o.Hh - c.Hh > k * 0.45) s = Math.max(s, 1 - (k - 1) / 9)
    }
    c.shadow = s
  }
  const usCells = cells.filter((c) => c.us)
  const nearestUs = (x: number, z: number) => {
    let best = usCells[0]
    let bd = Infinity
    for (const c of usCells) {
      const d = (c.X - x) ** 2 + (c.Z - z) ** 2
      if (d < bd) {
        bd = d
        best = c
      }
    }
    return best
  }
  const onGrid = (at: readonly [number, number]) => {
    const [x, y] = cellOf(at)
    return nearestUs(x - cx, y - cz)
  }
  // The larger places are lights on the map (never named: only the hubs are).
  const lights: ScenePlace[] = litPlaces.map((p) => ({ ...p, cell: onGrid(p.at) }))
  for (const p of lights) {
    p.cell.city = Math.max(p.cell.city, Math.max(0.3, Math.min(1, (Math.log10(p.pop) - 4.6) / 2.4)))
  }
  const la = onGrid(LOS_ANGELES)
  la.city = 2
  // The map's own routes go to the curated tech hubs (techCities.ts), in their order.
  const targets: ScenePlace[] = techCities.map((c) => ({ ...c, cell: onGrid(c.at) }))
  let x0 = Infinity
  let x1 = -Infinity
  let z0 = Infinity
  let z1 = -Infinity
  for (const c of usCells) {
    x0 = Math.min(x0, c.X)
    x1 = Math.max(x1, c.X)
    z0 = Math.min(z0, c.Z)
    z1 = Math.max(z1, c.Z)
  }
  cached = {
    cells,
    lights,
    targets,
    la,
    bounds: { x0, x1, z0, z1 },
    cx,
    cz,
    nearestUs,
  }
  return cached
}
