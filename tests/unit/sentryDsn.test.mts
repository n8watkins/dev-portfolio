// Unit tests for lib/sentryDsn.mjs (node --test).
import { test } from 'node:test'
import assert from 'node:assert/strict'

// The DSN is read once, when the module loads, so each case imports its own copy.
const load = async (disabled: string | undefined, copy: string) => {
  const before = process.env.NEXT_PUBLIC_SENTRY_DISABLED
  if (disabled === undefined) delete process.env.NEXT_PUBLIC_SENTRY_DISABLED
  else process.env.NEXT_PUBLIC_SENTRY_DISABLED = disabled
  try {
    return (await import(`../../lib/sentryDsn.mjs?${copy}`)).SENTRY_DSN as string | undefined
  } finally {
    if (before === undefined) delete process.env.NEXT_PUBLIC_SENTRY_DISABLED
    else process.env.NEXT_PUBLIC_SENTRY_DISABLED = before
  }
}

test('production (no switch) has the portfolio DSN', async () => {
  assert.match((await load(undefined, 'prod')) ?? '', /^https:\/\/\w+@o4507767562371072\.ingest\.us\.sentry\.io\/4507817472098304$/)
})

test('NEXT_PUBLIC_SENTRY_DISABLED=1 leaves the DSN out, so Sentry sends nothing', async () => {
  assert.equal(await load('1', 'disabled'), undefined)
})

test('only the value 1 turns it off', async () => {
  assert.ok(await load('0', 'zero'))
  assert.ok(await load('', 'empty'))
})
