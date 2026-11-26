import { test } from 'node:test'
import assert from 'node:assert/strict'
import { asLimiter, checkLimit, type Limiter } from '../../lib/whereLimit.ts'

/** A limiter like Cloudflare's: `limit` reads its own state through `this`. */
class FakeLimiter implements Limiter {
  seen: string[] = []
  allow: number
  constructor(allow: number) {
    this.allow = allow
  }
  async limit({ key }: { key: string }) {
    this.seen.push(key)
    return { success: this.seen.filter((k) => k === key).length <= this.allow }
  }
}

test('under the limit the request is counted and passes; over it, it is limited', async () => {
  const limiter = new FakeLimiter(2)
  assert.equal(await checkLimit(limiter, '203.0.113.7'), 'ok')
  assert.equal(await checkLimit(limiter, '203.0.113.7'), 'ok')
  assert.equal(await checkLimit(limiter, '203.0.113.7'), 'limited')
  // Another connection has its own count.
  assert.equal(await checkLimit(limiter, '198.51.100.4'), 'ok')
  assert.deepEqual(limiter.seen, ['203.0.113.7', '203.0.113.7', '203.0.113.7', '198.51.100.4'])
})

test('with no binding (next dev, next start) the state says so', async () => {
  assert.equal(await checkLimit(undefined, '203.0.113.7'), 'absent')
  assert.equal(asLimiter(undefined), undefined)
  assert.equal(asLimiter({}), undefined)
  assert.equal(asLimiter({ limit: 'no' }), undefined)
})

test('a limiter that throws or answers nonsense is an error, logged without the request', async () => {
  const lines: unknown[][] = []
  const original = console.error
  console.error = (...args: unknown[]) => lines.push(args)
  try {
    const throws: Limiter = {
      limit: async () => {
        throw new TypeError('Illegal invocation')
      },
    }
    assert.equal(await checkLimit(throws, '203.0.113.7'), 'error')
    const nonsense = { limit: async () => ({}) } as unknown as Limiter
    assert.equal(await checkLimit(nonsense, '203.0.113.7'), 'error')
  } finally {
    console.error = original
  }
  assert.equal(lines.length, 2)
  for (const line of lines) assert.doesNotMatch(String(line), /203\.0\.113\.7/)
  assert.match(String(lines[0]), /TypeError/)
})

test('a request without an address still gets one shared, named key', async () => {
  const limiter = new FakeLimiter(5)
  assert.equal(await checkLimit(limiter, null), 'ok')
  assert.deepEqual(limiter.seen, ['no-address'])
})
