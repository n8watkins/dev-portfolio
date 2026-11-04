import { test, expect } from '@playwright/test'

// /api/health is a public liveness check: status ok and nothing else.
test('the health check answers ok and leaks nothing', async ({ request }) => {
  const response = await request.get('/api/health')
  expect(response.status()).toBe(200)
  expect(response.headers()['cache-control']).toContain('no-store')
  expect(await response.json()).toEqual({ status: 'ok' })
})
