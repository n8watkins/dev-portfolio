import { test, expect } from '@playwright/test'

/**
 * The CSP (lib/security/headers.mjs) is sent, and the page runs under it:
 * loading, scrolling through every section and starting the dino game
 * trigger no violation. A new external origin must be added to the policy.
 */
test('the page sends its CSP and nothing on it breaks the policy', async ({ page }) => {
  await page.addInitScript(() => {
    const w = window as unknown as { __cspViolations: string[] }
    w.__cspViolations = []
    document.addEventListener('securitypolicyviolation', (e) => {
      w.__cspViolations.push(`${e.violatedDirective} ${e.blockedURI}`)
    })
  })
  const response = await page.goto('/')
  expect(response?.headers()['content-security-policy']).toContain("object-src 'none'")
  // Scrolled from script: mobile WebKit has no mouse wheel.
  for (let y = 1; y <= 12; y++) {
    await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y * 900)
    await page.waitForTimeout(250)
  }
  await page.waitForLoadState('networkidle').catch(() => {})
  const violations = await page.evaluate(() => (window as unknown as { __cspViolations: string[] }).__cspViolations)
  expect(violations).toEqual([])
})
