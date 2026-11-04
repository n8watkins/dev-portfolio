// Unit tests for lib/consent.ts (node --test; Node strips the types). The
// same bootstrap runs on n8builds.dev; its suite there is the fuller one.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { CONSENT_COOKIE, CONSENT_REGIONS, CONSENT_STORAGE_KEY, GA_GRACE_MS, consentBootstrapScript, isConsentTimeZone } from '../../lib/consent.ts'

type Api = { state: string; choice: string | null; ask: boolean; gpc: boolean; set: (v: 'granted' | 'denied') => void }

/** Runs the inline bootstrap against a fake browser. */
// Timers fire at once unless held, so "GA loads" means it loads eventually.
function boot({ timeZone = 'America/Los_Angeles', cookie = '', stored = null as string | null, gpc = false, hostname = 'portfolio.n8builds.dev', holdTimers = false } = {}) {
  const jar = new Map<string, string>()
  for (const part of cookie.split(';').map((p) => p.trim()).filter(Boolean)) {
    const [name, value] = part.split('=')
    jar.set(name, value)
  }
  const cookieWrites: string[] = []
  const scripts: string[] = []
  const storage = new Map<string, string>(stored ? [[CONSENT_STORAGE_KEY, stored]] : [])
  const document = {
    readyState: 'complete',
    get cookie() {
      return [...jar].map(([k, v]) => `${k}=${v}`).join('; ')
    },
    set cookie(value: string) {
      cookieWrites.push(value)
      const [name, v] = value.split(';')[0].split('=')
      if (/Max-Age=0/.test(value)) jar.delete(name)
      else jar.set(name, v)
    },
    createElement: () => ({ async: false, src: '' }),
    head: { appendChild: (s: { src: string }) => scripts.push(s.src) },
  }
  const timers: { fn: () => void; ms: number }[] = []
  const listeners = new Map<string, () => void>()
  const window: Record<string, unknown> = {
    location: { hostname, protocol: 'https:' },
    navigator: { globalPrivacyControl: gpc },
    localStorage: { getItem: (k: string) => storage.get(k) ?? null, setItem: (k: string, v: string) => void storage.set(k, v) },
    requestIdleCallback: (f: () => void) => f(),
    setTimeout: (fn: () => void, ms: number) => (holdTimers ? timers.push({ fn, ms }) : fn()),
    addEventListener: (type: string, fn: () => void) => void listeners.set(type, fn),
    removeEventListener: (type: string, fn: () => void) => {
      if (listeners.get(type) === fn) listeners.delete(type)
    },
    dispatchEvent: () => {},
  }
  const Intl = { DateTimeFormat: () => ({ resolvedOptions: () => ({ timeZone }) }) }
  class CustomEvent {}
  new Function('window', 'document', 'Intl', 'CustomEvent', consentBootstrapScript('G-TEST'))(window, document, Intl, CustomEvent)
  return { consent: window.n8Consent as Api, scripts, cookieWrites, jar, timers, listeners }
}

test('asks European and Quebec time zones only', () => {
  for (const tz of ['Europe/Berlin', 'Atlantic/Reykjavik', 'America/Toronto', 'America/Montreal']) assert.equal(isConsentTimeZone(tz), true, tz)
  for (const tz of ['America/Los_Angeles', 'America/New_York', 'UTC', '']) assert.equal(isConsentTimeZone(tz), false, tz)
  assert.ok((CONSENT_REGIONS as readonly string[]).includes('CA-QC'))
})

test('elsewhere: granted, GA loads', () => {
  const { consent, scripts } = boot()
  assert.equal(consent.state, 'granted')
  assert.deepEqual(scripts, ['https://www.googletagmanager.com/gtag/js?id=G-TEST'])
})

test('GA waits for a first interaction, or GA_GRACE_MS after load, and loads once', () => {
  const run = boot({ holdTimers: true })
  assert.deepEqual(run.scripts, [])
  assert.deepEqual([...run.listeners.keys()], ['pointerdown', 'keydown', 'scroll', 'touchstart', 'wheel'])
  assert.deepEqual(run.timers.map((t) => t.ms), [GA_GRACE_MS])
  run.listeners.get('pointerdown')!()
  assert.equal(run.scripts.length, 1)
  assert.equal(run.listeners.size, 0)
  run.timers[0].fn()
  assert.equal(run.scripts.length, 1)

  const idle = boot({ holdTimers: true })
  idle.timers[0].fn()
  assert.equal(idle.scripts.length, 1)

  const accepted = boot({ timeZone: 'Europe/Berlin', holdTimers: true })
  accepted.consent.set('granted')
  assert.equal(accepted.scripts.length, 1, 'an Accept loads GA at once')
})

test('Europe or Quebec without a choice: pending, no GA', () => {
  for (const timeZone of ['Europe/Berlin', 'America/Toronto']) {
    const { consent, scripts } = boot({ timeZone })
    assert.equal(consent.state, 'pending')
    assert.deepEqual(scripts, [])
  }
})

test('Global Privacy Control declines until a choice is made', () => {
  assert.equal(boot({ gpc: true }).consent.state, 'denied')
  assert.deepEqual(boot({ gpc: true }).scripts, [])
  assert.equal(boot({ gpc: true, cookie: `${CONSENT_COOKIE}=granted` }).consent.state, 'granted')
})

test('a choice made on n8builds.dev (the shared cookie) applies here, ahead of localStorage', () => {
  const { consent, scripts } = boot({ timeZone: 'Europe/Berlin', cookie: `${CONSENT_COOKIE}=denied`, stored: 'granted' })
  assert.equal(consent.state, 'denied')
  assert.deepEqual(scripts, [])
})

test('choosing writes the shared cookie on .n8builds.dev', () => {
  const run = boot({ timeZone: 'Europe/Berlin', cookie: '_ga=1' })
  run.consent.set('denied')
  assert.equal(run.cookieWrites[0], `${CONSENT_COOKIE}=denied; Max-Age=31536000; Path=/; SameSite=Lax; Domain=.n8builds.dev; Secure`)
  assert.equal(run.jar.has('_ga'), false)
})
