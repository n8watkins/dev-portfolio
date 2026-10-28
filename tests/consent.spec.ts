import { test, expect, type BrowserContext, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
const E2E_BASE_URL = `http://localhost:${Number(process.env.E2E_PORT) || 4829}`

/**
 * The analytics consent banner and the GA loader (lib/consent.ts,
 * components/consent), the same as on n8builds.dev. The test build uses a made-up GA ID; gtag.js requests
 * are answered here with an empty script and counted, so nothing reaches Google.
 */

const banner = (page: Page) => page.getByRole('dialog', { name: 'Cookies' })

/** Counts gtag.js requests in this context (answered with an empty script). */
async function countGtag(context: BrowserContext) {
  const requests: string[] = []
  await context.route('https://www.googletagmanager.com/**', (route) => {
    requests.push(route.request().url())
    return route.fulfill({ contentType: 'text/javascript', body: '' })
  })
  return requests
}

/** Waits until the page has loaded and gone idle, when GA would load if allowed. */
async function settle(page: Page) {
  await page.waitForLoadState('load')
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        const idle = window.requestIdleCallback ?? ((f: () => void) => setTimeout(f, 1))
        idle(() => setTimeout(resolve, 300))
      }),
  )
}

const consentCookie = async (context: BrowserContext) =>
  (await context.cookies()).find((c) => c.name === 'n8-consent')

test.describe('in a European time zone', () => {
  test.use({ timezoneId: 'Europe/Berlin' })

  test('asks first, and GA loads only after Accept', async ({ page, context }) => {
    const gtag = await countGtag(context)
    await page.goto('/')
    await expect(banner(page)).toBeVisible()
    await settle(page)
    expect(gtag, 'no GA before consent').toEqual([])

    await banner(page).getByRole('button', { name: 'Accept' }).click()
    await expect(banner(page)).toBeHidden()
    await expect.poll(() => gtag.length).toBe(1)
    expect(gtag[0]).toContain('gtag/js?id=G-E2ETEST000')
    expect((await consentCookie(context))?.value).toBe('granted')

    // The choice sticks: no banner next time, and GA loads.
    await page.reload()
    await settle(page)
    await expect(banner(page)).toBeHidden()
    expect(gtag).toHaveLength(2)
  })

  test('Decline keeps GA from ever loading', async ({ page, context }) => {
    const gtag = await countGtag(context)
    await page.goto('/')
    await banner(page).getByRole('button', { name: 'Decline' }).click()
    await expect(banner(page)).toBeHidden()
    expect((await consentCookie(context))?.value).toBe('denied')

    await page.reload()
    await settle(page)
    await expect(banner(page)).toBeHidden()
    expect(gtag).toEqual([])
  })

  test('Accept is the larger button on the right; Decline is a real button beside it', async ({ page }) => {
    await page.goto('/')
    const declineButton = banner(page).getByRole('button', { name: 'Decline' })
    await expect(declineButton).toBeVisible()
    const decline = await declineButton.boundingBox()
    const accept = await banner(page).getByRole('button', { name: 'Accept' }).boundingBox()
    expect(decline && accept).toBeTruthy()
    expect(accept!.x).toBeGreaterThan(decline!.x)
    expect(accept!.width * accept!.height).toBeGreaterThan(decline!.width * decline!.height)
    // Easy to hit: at least 40px tall, with readable, solid styling.
    expect(decline!.height).toBeGreaterThanOrEqual(40)
    expect(decline!.width).toBeGreaterThanOrEqual(60)
  })

  test('choosing plays the exit animation, then the bar is gone and focus is on the page', async ({ page }) => {
    await page.goto('/')
    const bar = banner(page)
    await expect(bar).toBeVisible()
    await bar.getByRole('button', { name: 'Decline' }).focus()
    await page.keyboard.press('Enter')
    // Mid-exit: still on screen, marked closing and inert (no double clicks).
    await expect(bar).toHaveAttribute('data-closing', 'true')
    await expect(bar).toHaveAttribute('inert', '')
    await expect(page.locator('#main-content')).toBeFocused()
    // Then unmounted, with the choice applied.
    await expect(page.getByRole('dialog', { name: 'Cookies', includeHidden: true })).toHaveCount(0)
    expect(await page.evaluate(() => window.n8Consent?.state)).toBe('denied')
  })

  test('under reduced motion the bar closes at once', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    await banner(page).getByRole('button', { name: 'Accept' }).click()
    // No exit animation: gone as soon as the click is handled.
    expect(await page.locator('[role="dialog"][aria-labelledby]').count()).toBe(0)
    expect(await page.evaluate(() => window.n8Consent?.state)).toBe('granted')
  })

  test('the banner links to the privacy policy and has no serious a11y issues', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    await expect(banner(page)).toBeVisible()
    await expect(banner(page).getByRole('link', { name: /^Privacy/ })).toHaveAttribute('href', 'https://n8builds.dev/privacy#cookies')
    const results = await new AxeBuilder({ page }).include('[role="dialog"]').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
    expect(results.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([])
  })

  test('Global Privacy Control counts as Decline: no banner, no GA', async ({ page, context }) => {
    await context.addInitScript(() => Object.defineProperty(Navigator.prototype, 'globalPrivacyControl', { get: () => true }))
    const gtag = await countGtag(context)
    await page.goto('/')
    await settle(page)
    await expect(banner(page)).toBeHidden()
    expect(gtag).toEqual([])
  })
})

test.describe('in an Eastern Canada (Quebec) time zone', () => {
  test.use({ timezoneId: 'America/Toronto' })

  test('asks first', async ({ page, context }) => {
    const gtag = await countGtag(context)
    await page.goto('/')
    await expect(banner(page)).toBeVisible()
    await settle(page)
    expect(gtag).toEqual([])
  })
})

test.describe('elsewhere (America/Los_Angeles)', () => {
  test.use({ timezoneId: 'America/Los_Angeles' })

  test('no banner, and GA loads after the page is idle', async ({ page, context }) => {
    const gtag = await countGtag(context)
    await page.goto('/')
    await settle(page)
    await expect.poll(() => gtag.length).toBe(1)
    await expect(banner(page)).toHaveCount(0)
  })

  test('Global Privacy Control keeps GA from loading', async ({ page, context }) => {
    await context.addInitScript(() => Object.defineProperty(Navigator.prototype, 'globalPrivacyControl', { get: () => true }))
    const gtag = await countGtag(context)
    await page.goto('/')
    await settle(page)
    expect(gtag).toEqual([])
  })

  test('"Cookie settings" reopens the banner, by keyboard too', async ({ page, context }) => {
    await countGtag(context)
    await page.goto('/')
    const settings = page.getByRole('button', { name: 'Cookie settings' })
    await settings.scrollIntoViewIfNeeded()
    // A press before React has hydrated the footer does nothing (Firefox in CI
    // can still be hydrating at load): wait until the button has its handler.
    await expect
      .poll(() => settings.evaluate((el) => Object.keys(el).some((key) => key.startsWith('__reactProps'))))
      .toBe(true)
    await settings.focus()
    await page.keyboard.press('Enter')

    // Focus moves to the bar itself, which says what is set now.
    await expect(banner(page)).toBeVisible()
    await expect(banner(page)).toBeFocused()
    await expect(banner(page)).toContainText('Currently: accepted')

    // Escape closes it and gives focus back.
    await page.keyboard.press('Escape')
    await expect(banner(page)).toBeHidden()
    await expect(settings).toBeFocused()

    // Tab reaches Decline first; Enter declines.
    await page.keyboard.press('Enter')
    await expect(banner(page)).toBeFocused()
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await expect(banner(page).getByRole('button', { name: 'Decline' })).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(banner(page)).toBeHidden()
    await expect(settings).toBeFocused()
    expect((await consentCookie(context))?.value).toBe('denied')
  })
})

test.describe('on portfolio.n8builds.dev itself', () => {
  test.use({ timezoneId: 'Europe/Berlin' })

  test('the choice is a cookie on .n8builds.dev that n8builds.dev shares', async ({ page, context }) => {
    // Serve https://portfolio.n8builds.dev and https://n8builds.dev from the
    // test server, so the page runs on the real domain.
    await context.route(/^https:\/\/(portfolio\.)?n8builds\.dev\//, async (route) => {
      const url = new URL(route.request().url())
      const response = await route.fetch({ url: `${E2E_BASE_URL}${url.pathname}${url.search}` })
      await route.fulfill({ response })
    })
    await countGtag(context)

    await page.goto('https://portfolio.n8builds.dev/')
    await banner(page).getByRole('button', { name: 'Accept' }).click()
    // The choice is stored once the exit animation is over.
    await expect(banner(page)).toHaveCount(0)
    const cookie = await consentCookie(context)
    expect(cookie).toMatchObject({ value: 'granted', domain: '.n8builds.dev', path: '/', secure: true, sameSite: 'Lax' })
    const days = (cookie!.expires * 1000 - Date.now()) / 86_400_000
    expect(days).toBeGreaterThan(364)
    expect(days).toBeLessThan(366)

    await page.goto('https://n8builds.dev/')
    await settle(page)
    await expect(banner(page)).toHaveCount(0)
    expect(await page.evaluate(() => window.n8Consent?.state)).toBe('granted')
    // Requests still in flight (error reporting, say) would hit a closed context.
    await context.unrouteAll({ behavior: 'ignoreErrors' })
  })
})
