import { test } from 'node:test'
import assert from 'node:assert/strict'
import { miles, techCities, NEAR_LA_MILES } from '../../components/ui/BoldMap/geo.ts'
import { visitorAt } from '../../components/ui/BoldMap/visitorGeo.ts'
import { TECH_CITIES } from '../../components/ui/BoldMap/techCities.ts'

// Great-circle miles from downtown Los Angeles, from published distance tables.
const KNOWN: Record<string, number> = {
  'New York': 2445,
  Seattle: 960,
  Austin: 1229,
  Boston: 2598,
  Denver: 831,
  Miami: 2339,
  'San Francisco': 347,
  Washington: 2297,
  'Salt Lake City': 579,
  Atlanta: 1936,
  Chicago: 1745,
  Raleigh: 2234,
}

test('every tech hub is a real move from Los Angeles, at its true distance', () => {
  assert.equal(techCities.length, Object.keys(KNOWN).length)
  for (const c of techCities) {
    const known = KNOWN[c.name]
    assert.ok(known, `${c.name} has a known distance`)
    assert.ok(
      Math.abs(c.mi - known) <= 10,
      `${c.name}: ${Math.round(c.mi)} mi, expected about ${known}`
    )
    assert.ok(c.mi > 300, `${c.name} is a move, not a commute`)
  }
})

test('the hubs are in the lower 48, once each', () => {
  const names = TECH_CITIES.map((c) => `${c.name}, ${c.state}`)
  assert.equal(new Set(names).size, names.length)
  for (const c of TECH_CITIES) {
    assert.ok(
      c.lat > 24 && c.lat < 49.5 && c.lon > -125 && c.lon < -66,
      `${c.name} is in the lower 48`
    )
  }
})

test('consecutive lines go to different parts of the country', () => {
  const list = [...TECH_CITIES, TECH_CITIES[0]]
  for (let k = 0; k < list.length - 1; k++) {
    const a = list[k]
    const b = list[k + 1]
    const apart = miles([a.lon, a.lat], [b.lon, b.lat])
    assert.ok(apart > 400, `${a.name} then ${b.name} are only ${Math.round(apart)} mi apart`)
  }
})

test('"near Los Angeles" is the LA area: 60 miles', () => {
  assert.equal(NEAR_LA_MILES, 60)
  assert.equal(visitorAt(33.77, -118.19, 'US')?.kind, 'here') // Long Beach
  assert.equal(visitorAt(34.15, -118.14, 'US')?.kind, 'here') // Pasadena
  assert.equal(visitorAt(33.84, -117.91, 'US')?.kind, 'here') // Anaheim
  assert.equal(visitorAt(32.72, -117.16, 'US')?.kind, 'us') // San Diego
  assert.equal(visitorAt(34.42, -119.7, 'US')?.kind, 'us') // Santa Barbara
})
