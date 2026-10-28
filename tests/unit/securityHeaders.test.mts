// Unit tests for lib/security/headers.mjs (node --test).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildContentSecurityPolicy, securityHeaders, sentryCspReportUri } from '../../lib/security/headers.mjs'
import { SENTRY_DSN } from '../../lib/sentryDsn.mjs'

const directive = (policy: string, name: string) =>
  policy.split('; ').find((d) => d.startsWith(`${name} `))?.slice(name.length + 1).split(' ') ?? []

test('production policy: no eval, no frames, no plugins, and the dino stats origin allowed', () => {
  const policy = buildContentSecurityPolicy()
  assert.ok(!directive(policy, 'script-src').includes("'unsafe-eval'"))
  assert.deepEqual(directive(policy, 'frame-src'), ["'none'"])
  assert.deepEqual(directive(policy, 'object-src'), ["'none'"])
  assert.deepEqual(directive(policy, 'frame-ancestors'), ["'none'"])
  assert.ok(directive(policy, 'connect-src').includes('https://n8builds.dev'))
  assert.ok(directive(policy, 'script-src').includes('https://www.googletagmanager.com'))
  assert.ok(!policy.includes('vercel.live'))
})

test('dev allows eval and the HMR websocket; previews allow the Vercel toolbar', () => {
  const dev = buildContentSecurityPolicy({ dev: true })
  assert.ok(directive(dev, 'script-src').includes("'unsafe-eval'"))
  assert.ok(directive(dev, 'connect-src').includes('ws:'))
  const preview = buildContentSecurityPolicy({ preview: true })
  assert.deepEqual(directive(preview, 'frame-src'), ['https://vercel.live'])
})

test('violations report to the portfolio Sentry project', () => {
  assert.equal(
    sentryCspReportUri(SENTRY_DSN),
    'https://o4507767562371072.ingest.us.sentry.io/api/4507817472098304/security/?sentry_key=5fe024399bcfe69a9436b0e5fa84c17d'
  )
  assert.equal(sentryCspReportUri('not a url'), null)
  const headers = securityHeaders({ sentryDsn: SENTRY_DSN })
  const csp = headers.find((h) => h.key === 'Content-Security-Policy')?.value ?? ''
  assert.match(csp, /report-uri https:\/\/o4507767562371072\.ingest\.us\.sentry\.io\//)
  assert.ok(headers.some((h) => h.key === 'Reporting-Endpoints'))
})
