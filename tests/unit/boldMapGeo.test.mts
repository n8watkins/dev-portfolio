import { test } from 'node:test'
import assert from 'node:assert/strict'
import { visitorAt, visitorFromQuery } from '../../components/ui/BoldMap/visitorGeo.ts'

test('a visitor in Austin gets a line, named near Austin, about 1,230 miles out', () => {
  const v = visitorAt(30.27, -97.74, 'US')
  assert.equal(v?.kind, 'us')
  assert.equal(v.near, 'Austin, TX')
  assert.ok(Math.abs((v as { mi: number }).mi - 1230) < 30, `mi ${(v as { mi: number }).mi}`)
})

test('the point that reaches the page is rounded to half a degree', () => {
  const v = visitorAt(39.7392, -104.9903, 'US')
  assert.deepEqual(v?.at, [-105, 39.5])
})

test('a visitor near Los Angeles is "here", with no line', () => {
  assert.equal(visitorAt(34.1, -118.3, 'US')?.kind, 'here')
  assert.equal(visitorAt(33.8, -117.9, 'US')?.kind, 'here')
})

test('outside the lower 48 there is no visitor at all', () => {
  assert.equal(visitorAt(51.5, -0.12, 'GB'), null) // London
  assert.equal(visitorAt(43.65, -79.38, 'CA'), null) // Toronto, by country
  assert.equal(visitorAt(21.3, -157.86, 'US'), null) // Honolulu, off the map
  assert.equal(visitorAt(61.2, -149.9, 'US'), null) // Anchorage, off the map
  assert.equal(visitorAt(Number.NaN, 0, 'US'), null)
})

test('the lab page reads ?from= as lat,lng, a listed place or a test name', () => {
  assert.equal(visitorFromQuery('40.7,-74')?.near, 'New York, NY')
  assert.equal(visitorFromQuery('Denver')?.near, 'Denver, CO')
  assert.equal(visitorFromQuery('austin, tx')?.near, 'Austin, TX')
  assert.equal(visitorFromQuery('Los Angeles')?.kind, 'here')
  assert.equal(visitorFromQuery('London'), null)
  assert.equal(visitorFromQuery('nowhere at all'), null)
})
