import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  asCounters,
  checkLimit,
  counterName,
  rateLimitIpKey,
  WHERE_LIMIT,
  WHERE_WINDOW_MS,
  type CounterNamespace,
} from '../../lib/whereLimit.ts'
import { slide } from '../../worker/sliding-window.js'

/**
 * The Durable Object namespace as Cloudflare runs it for worker/rate-limit-counter.js:
 * one counter per name, each a sliding window over its own stored hits, on a clock
 * the test moves.
 */
function fakeCounters(clock: { now: number }) {
  const stores = new Map<string, number[]>()
  const names: string[] = []
  const ns: CounterNamespace = {
    idFromName(name) {
      names.push(name)
      return name
    },
    get(id) {
      return {
        async limit(max, windowMs) {
          const { allowed, hits } = slide(stores.get(id as string) ?? [], clock.now, max, windowMs)
          if (allowed) stores.set(id as string, hits)
          return allowed
        },
      }
    },
  }
  return { ns, names, stores }
}

const quietly = async <T,>(run: () => Promise<T>) => {
  const lines: unknown[][] = []
  const original = console.error
  console.error = (...args: unknown[]) => lines.push(args)
  try {
    return { value: await run(), lines }
  } finally {
    console.error = original
  }
}

test('30 a minute pass, the 31st is limited, and a refused request is not counted', async () => {
  const clock = { now: 1_000_000 }
  const { ns } = fakeCounters(clock)
  for (let k = 0; k < WHERE_LIMIT; k++) {
    assert.equal(await checkLimit(ns, '203.0.113.7'), 'ok', `request ${k + 1}`)
    clock.now += 100
  }
  assert.equal(await checkLimit(ns, '203.0.113.7'), 'limited')
  assert.equal(await checkLimit(ns, '203.0.113.7'), 'limited')
})

test('the window slides: once the oldest hits are a minute old, requests pass again', async () => {
  const clock = { now: 5_000_000 }
  const { ns } = fakeCounters(clock)
  for (let k = 0; k < WHERE_LIMIT; k++) await checkLimit(ns, '203.0.113.7')
  assert.equal(await checkLimit(ns, '203.0.113.7'), 'limited')
  clock.now += WHERE_WINDOW_MS - 1
  assert.equal(await checkLimit(ns, '203.0.113.7'), 'limited')
  clock.now += 1
  assert.equal(await checkLimit(ns, '203.0.113.7'), 'ok')
})

test('each connection has its own count; IPv6 counts per /64', async () => {
  const clock = { now: 9_000_000 }
  const { ns } = fakeCounters(clock)
  for (let k = 0; k < WHERE_LIMIT; k++) await checkLimit(ns, '203.0.113.7')
  assert.equal(await checkLimit(ns, '203.0.113.7'), 'limited')
  assert.equal(await checkLimit(ns, '198.51.100.4'), 'ok')
  for (let k = 0; k < WHERE_LIMIT; k++) await checkLimit(ns, `2001:db8:1:2::${k.toString(16)}`)
  // Another address in the same /64 is the same subscriber.
  assert.equal(await checkLimit(ns, '2001:db8:1:2:ffff::1'), 'limited')
  assert.equal(await checkLimit(ns, '2001:db8:1:3::1'), 'ok')
})

test('the counter is named by a hash, never the address', async () => {
  const clock = { now: 0 }
  const { ns, names } = fakeCounters(clock)
  await checkLimit(ns, '203.0.113.7')
  await checkLimit(ns, '2001:db8:1:2::9')
  for (const name of names) {
    assert.match(name, /^where:[0-9a-f]{32}$/)
    assert.doesNotMatch(name, /203|2001|db8/)
  }
  assert.equal(await counterName('203.0.113.7'), await counterName(' 203.0.113.7 '))
  assert.equal(await counterName('2001:db8:1:2::9'), await counterName('2001:db8:1:2:aaaa::1'))
  assert.notEqual(await counterName('203.0.113.7'), await counterName('203.0.113.8'))
  assert.equal(rateLimitIpKey('::ffff:203.0.113.7'), '203.0.113.7')
  assert.equal(rateLimitIpKey('2001:DB8:0001:0002:3:4:5:6'), '2001:db8:1:2::/64')
})

test('with no counters (next dev, next start) the state says so', async () => {
  assert.equal(await checkLimit(undefined, '203.0.113.7'), 'absent')
  assert.equal(asCounters(undefined), undefined)
  assert.equal(asCounters({ get: () => null }), undefined)
})

test('failing counters fail open, as an error logged without the request', async () => {
  const throws: CounterNamespace = {
    idFromName: (n) => n,
    get: () => ({
      limit: async () => {
        throw new Error('Durable Object reset')
      },
    }),
  }
  const nonsense = {
    idFromName: (n: string) => n,
    get: () => ({ limit: async () => 'yes' }),
  } as unknown as CounterNamespace
  const { value, lines } = await quietly(async () => [
    await checkLimit(throws, '203.0.113.7'),
    await checkLimit(nonsense, '203.0.113.7'),
  ])
  assert.deepEqual(value, ['error', 'error'])
  assert.equal(lines.length, 2)
  for (const line of lines) assert.doesNotMatch(String(line), /203\.0\.113\.7|where:[0-9a-f]/)
})

test('a counter slower than 3 seconds fails open', async () => {
  const slow: CounterNamespace = {
    idFromName: (n) => n,
    get: () => ({
      limit: () => new Promise<boolean>((done) => setTimeout(() => done(true), 3500)),
    }),
  }
  const started = Date.now()
  const { value } = await quietly(() => checkLimit(slow, '203.0.113.7'))
  assert.equal(value, 'error')
  assert.ok(Date.now() - started < 3400)
})
