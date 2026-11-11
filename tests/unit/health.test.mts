// Unit tests for worker/health.js (node --test).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { healthCheck } from '../../worker/health.js'

const URL_BASE = 'https://portfolio.n8builds.dev'

test('GET /healthz answers an uncached plain-text ok', async () => {
  const response = healthCheck(new Request(`${URL_BASE}/healthz`))
  assert.equal(response?.status, 200)
  assert.equal(await response?.text(), 'ok')
  assert.equal(response?.headers.get('Content-Type'), 'text/plain; charset=utf-8')
  assert.equal(response?.headers.get('Cache-Control'), 'no-store')
  assert.equal(response?.headers.get('Set-Cookie'), null)
})

test('HEAD /healthz has no body', async () => {
  const response = healthCheck(new Request(`${URL_BASE}/healthz`, { method: 'HEAD' }))
  assert.equal(response?.status, 200)
  assert.equal(await response?.text(), '')
})

test('every other path and method is left to the app', () => {
  assert.equal(healthCheck(new Request(`${URL_BASE}/`)), null)
  assert.equal(healthCheck(new Request(`${URL_BASE}/healthz/x`)), null)
  assert.equal(healthCheck(new Request(`${URL_BASE}/healthz`, { method: 'POST' })), null)
})
