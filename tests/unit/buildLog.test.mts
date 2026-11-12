import { test } from 'node:test'
import assert from 'node:assert/strict'
import { FEED_HEADERS, toLogMonths } from '../../lib/buildLog.ts'

test('a version 1 feed keeps each month, newest first, as sent', () => {
  const months = toLogMonths({
    version: 1,
    months: [
      { id: '2026-11', title: 'November 2026', changes: 3, days: [{ day: '2026-11-01', count: 3 }, { day: '2026-11-02', count: 0, future: true }] },
      { id: '2026-10', title: 'October 2026', changes: 1, days: [{ day: '2026-10-01', count: 1 }] },
    ],
  })
  assert.deepEqual(months.map((m) => m.id), ['2026-11', '2026-10'])
  assert.deepEqual(months[0].days[1], { day: '2026-11-02', count: 0, future: true })
})

test('anything malformed is dropped, so a change upstream can only fall back', () => {
  assert.deepEqual(toLogMonths(null), [])
  assert.deepEqual(toLogMonths({ version: 2, months: [] }), [])
  const months = toLogMonths({
    version: 1,
    months: [
      { id: 'bad', title: 'No days', changes: 1, days: [] },
      { id: 'neg', title: 'Negative', changes: -1, days: [{ day: '2026-09-01', count: 1 }] },
      { id: '2026-09', title: 'September 2026', changes: 2, days: [{ day: 'not a day', count: 1 }, { day: '2026-09-02', count: 2 }, { day: '2026-09-03', count: 1.5 }] },
    ],
  })
  assert.deepEqual(months, [{ id: '2026-09', title: 'September 2026', changes: 2, days: [{ day: '2026-09-02', count: 2 }] }])
})

test('at most a year of months', () => {
  const month = (i: number) => ({ id: `m${i}`, title: `M ${i}`, changes: 0, days: [{ day: '2026-01-01', count: 0 }] })
  assert.equal(toLogMonths({ version: 1, months: Array.from({ length: 20 }, (_, i) => month(i)) }).length, 12)
})

test('server fetches name themselves, since n8builds.dev challenges nameless clients', () => {
  assert.match(FEED_HEADERS['User-Agent'], /^n8builds-portfolio /)
})
