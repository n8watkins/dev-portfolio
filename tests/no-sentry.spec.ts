import { expect, test } from '@playwright/test'

/**
 * Test runs never report to the real Sentry project (2026-11-25): the Playwright web server
 * builds the site with NEXT_PUBLIC_SENTRY_DISABLED=1 (playwright.config.ts), which leaves the DSN
 * out of every bundle (lib/sentryDsn.mjs). Before that, each test page loaded Sentry once it was
 * idle and sent traces, errors and some Session Replays to the owner's project as if it were a
 * visitor. The browser sends them through the same-origin /monitoring tunnel, so that counts too.
 *
 * Also fails when a server already running on the port was built without the switch
 * (reuseExistingServer): stop it and let Playwright build its own.
 */
const isSentryRequest = ({ hostname, pathname }: URL) => {
  return hostname === 'sentry.io' || hostname.endsWith('.sentry.io') || pathname.startsWith('/monitoring')
}

test('a page under test sends nothing to Sentry, not even an error', async ({ page }) => {
  const seen: string[] = []
  // Count and block: nothing reaches the real project even if this test fails.
  await page.route(isSentryRequest, (route) => {
    seen.push(route.request().url())
    return route.abort()
  })
  await page.goto('/')
  await page.waitForLoadState('load')
  // Sentry loads once the page is idle (at the latest after 8 s: instrumentation-client.ts), and
  // does its sending asynchronously; an uncaught error gives it something to send either way.
  await page.waitForTimeout(3_000)
  await page.evaluate(() =>
    setTimeout(() => {
      throw new Error('no-sentry.spec: a test error that must not be reported')
    })
  )
  await page.waitForTimeout(3_000)
  expect(seen).toEqual([])
})
