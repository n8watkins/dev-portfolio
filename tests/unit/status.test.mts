// Unit tests for lib/status.ts (node --test; Node strips the types).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { STALE_AFTER_MS, describe, formatUptime, toStatusMap } from '../../lib/status.ts'

const NOW = Date.UTC(2026, 9, 25, 20, 0)
const feed = (updatedAt: number, services: unknown[]) => ({ updatedAt, groups: [{ name: null, services }] })

test('a fresh feed keeps each service as reported', () => {
  const map = toStatusMap(
    feed(NOW - 60_000, [
      { name: 'Echo', state: 'operational', uptime90d: 92.914, bars: [], description: null },
      { name: 'Scout', state: 'down', uptime90d: 81 },
    ]),
    NOW,
  )
  assert.deepEqual(map, { Echo: { state: 'operational', uptime90d: 92.914 }, Scout: { state: 'down', uptime90d: 81 } })
})

test('a stale feed (off-hours, nothing checking) reads as asleep, but keeps a real outage', () => {
  const map = toStatusMap(
    feed(NOW - STALE_AFTER_MS - 1, [
      { name: 'Echo', state: 'operational', uptime90d: 93 },
      { name: 'Scout', state: 'degraded', uptime90d: 93 },
      { name: 'GeminiGPT', state: 'down', uptime90d: 93 },
      { name: 'Net', state: 'maintenance', uptime90d: 93 },
    ]),
    NOW,
  )
  assert.equal(map.Echo.state, 'scheduled_off')
  assert.equal(map.Scout.state, 'scheduled_off')
  assert.equal(map.GeminiGPT.state, 'down')
  assert.equal(map.Net.state, 'maintenance')
})

test('anything unexpected in the feed is ignored or read as unknown', () => {
  assert.deepEqual(toStatusMap(null, NOW), {})
  assert.deepEqual(toStatusMap({ groups: 'no' }, NOW), {})
  const map = toStatusMap(feed(NOW, [{ name: 'A', state: 'exploded', uptime90d: 'lots' }, { state: 'operational' }, null]), NOW)
  // Read before deepEqual, which narrows `map` to the literal it was compared with.
  const a = map.A!
  assert.deepEqual(map, { A: { state: 'unknown', uptime90d: null } })
  assert.equal(describe(a), null)
})

test('labels and uptime read naturally', () => {
  assert.equal(describe({ state: 'scheduled_off', uptime90d: null })?.label, 'Asleep')
  assert.equal(describe({ state: 'suspended', uptime90d: null })?.label, 'Asleep')
  assert.equal(formatUptime(92.914), '93% uptime')
  assert.equal(formatUptime(99.46), '99.5% uptime')
  assert.equal(formatUptime(100), '100% uptime')
  assert.equal(formatUptime(null), null)
})
