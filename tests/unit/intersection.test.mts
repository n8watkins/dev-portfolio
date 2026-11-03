// Unit tests for lib/intersection.ts (node --test; Node strips the types).
// The same helper is shared with n8builds.dev, which tests it with vitest.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { latestEntry } from '../../lib/intersection.ts'

const entry = (isIntersecting: boolean) => ({ isIntersecting }) as IntersectionObserverEntry

test('reads the last entry: a scroll before the first delivery batches "out" then "in"', () => {
  assert.equal(latestEntry([entry(false), entry(true)]).isIntersecting, true)
})

test('and "in" then "out" when the target left again', () => {
  assert.equal(latestEntry([entry(true), entry(false)]).isIntersecting, false)
})

test('returns the only entry of an ordinary delivery', () => {
  const only = entry(true)
  assert.equal(latestEntry([only]), only)
})
