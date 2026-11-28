import { test, expect, type Locator, type Page } from '@playwright/test'
import sharp from 'sharp'

/**
 * The hero portrait on a slow first visit (2026-11-27).
 *
 * The circle must never be a black or empty disc while the photo is on its way:
 * it shows a soft, real blurred copy of the portrait (scripts/gen-portrait-blur.mjs)
 * and the photo fades in over it. The same holds for a portrait that rotates in later.
 * The bug this guards (found on n8builds.dev first): a hand-pasted generic 1x1 placeholder
 * painted solid black, and the entrance revealed it before the photo arrived.
 */
test.describe('the hero portrait on a slow first visit', () => {
  test.use({ viewport: { width: 1280, height: 800 }, hasTouch: false, contextOptions: { reducedMotion: 'no-preference' } })

  const circle = (page: Page) => page.locator('#home [data-hero-portrait]')
  const photo = (page: Page) => page.locator('#home [data-hero-portrait] img').first()

  /** Painted opacity of an element: its own times every ancestor's. */
  const paintedOpacity = (locator: Locator) =>
    locator.evaluate((el) => {
      let opacity = 1
      for (let node: Element | null = el; node; node = node.parentElement) opacity *= Number(getComputedStyle(node).opacity)
      return opacity
    })

  /** Mean 0-255 brightness of the middle of the circle, from a screenshot of what is painted. */
  async function meanBrightness(page: Page): Promise<number> {
    const png = await circle(page).screenshot({ animations: 'disabled' })
    const { width, height } = await sharp(png).metadata()
    const inset = Math.round(width! * 0.2)
    const { data } = await sharp(png)
      .extract({ left: inset, top: inset, width: width! - 2 * inset, height: height! - 2 * inset })
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })
    let sum = 0
    for (const value of data) sum += value
    return sum / data.length
  }

  test('shows a soft version of the portrait, never a black disc, then fades the photo in', { tag: '@cross-browser' }, async ({ page, browserName }) => {
    let release!: () => void
    const held = new Promise<void>((resolve) => (release = resolve))
    await page.route('**/_next/image**', async (route) => {
      await held
      await route.continue()
    })
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await expect(circle(page)).toBeVisible()
    // Settled: past the entrance (0.5s slide) with the photo still held back.
    await expect.poll(() => paintedOpacity(circle(page)), { timeout: 5_000 }).toBe(1)
    await page.waitForTimeout(1_500)
    expect(await photo(page).evaluate((img: HTMLImageElement) => img.complete), 'the photo is still held back').toBe(false)

    if (browserName === 'chromium') {
      const mean = await meanBrightness(page)
      console.log(`MEAN_BRIGHTNESS ${mean.toFixed(1)}`)
      expect(mean, `the circle's mean brightness while the photo loads (${mean.toFixed(1)} of 255): a black disc is about 0`).toBeGreaterThan(30)
    }

    // The placeholder is an image made from the portrait, and not dark. Decoded in the page
    // (WebKit's screenshot would wait on the held request).
    const frame = page.locator('#home [data-portrait-frame]').first()
    await expect(frame).toBeVisible()
    const mean = await frame.evaluate(async (el) => {
      const match = /url\("(.+)"\)/.exec(getComputedStyle(el).backgroundImage)
      if (!match) return -1
      const image = new Image()
      image.src = match[1]
      await image.decode()
      const canvas = document.createElement('canvas')
      canvas.width = canvas.height = 12
      const context = canvas.getContext('2d')!
      context.drawImage(image, 0, 0, 12, 12)
      const { data } = context.getImageData(0, 0, 12, 12)
      let sum = 0
      for (let i = 0; i < data.length; i += 4) sum += data[i] + data[i + 1] + data[i + 2]
      return sum / (data.length / 4) / 3
    })
    expect(mean, `the placeholder's mean brightness (${mean.toFixed(1)} of 255); -1 means none`).toBeGreaterThan(30)

    // The photo arrives: it fades in over the placeholder and ends fully opaque.
    release()
    await expect.poll(() => photo(page).evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true)
    await expect.poll(() => photo(page).evaluate((img) => getComputedStyle(img).opacity), { timeout: 5_000 }).toBe('1')
    await expect(frame).not.toHaveAttribute('data-waiting', '')
  })

  test('a portrait that rotates in later has its own placeholder, never a black flash', { tag: '@cross-browser' }, async ({ page }) => {
    // Only the second portrait is held back; the first loads normally.
    let release!: () => void
    const held = new Promise<void>((resolve) => (release = resolve))
    await page.route('**/_next/image**', async (route) => {
      if (decodeURIComponent(route.request().url()).includes('portrait-watercolor')) await held
      await route.continue()
    })
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    // The rotation starts after 3s; the second portrait's layer mounts over the first.
    // Found by its own photo, not by position: later layers come and go every 3s.
    const second = page.locator('#home [data-hero-portrait] [data-portrait-frame]:has(img[src*="watercolor"])')
    await expect(second).toBeAttached({ timeout: 10_000 })
    await expect(second).toHaveAttribute('data-waiting', '')
    const bg = await second.evaluate((el) => getComputedStyle(el).backgroundImage)
    expect(bg, 'the layer carries its own placeholder made from its portrait').toMatch(/^url\("data:image\/jpeg;base64,/)
    const secondPhoto = second.locator('img')
    await expect.poll(() => secondPhoto.evaluate((img) => getComputedStyle(img).opacity), { message: 'the held photo is transparent, not a black box' }).toBe('0')
    release()
    await expect.poll(() => secondPhoto.evaluate((img) => getComputedStyle(img).opacity), { timeout: 5_000 }).toBe('1')
  })
})

test.describe('the hero portrait without JavaScript or with reduced motion', () => {
  test.use({ viewport: { width: 1280, height: 800 } })

  test('is in the server HTML and visible with JavaScript off', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, reducedMotion: 'no-preference' })
    const page = await context.newPage()
    await page.goto('/')
    const img = page.locator('#home [data-hero-portrait] img').first()
    await expect(img).toBeVisible()
    await expect.poll(() => img.evaluate((el) => getComputedStyle(el).opacity)).toBe('1')
    await context.close()
  })

  test('is fully visible at once under reduced motion', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' })
    const page = await context.newPage()
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    const img = page.locator('#home [data-hero-portrait] img').first()
    await expect(img).toBeVisible()
    await expect.poll(() => img.evaluate((el) => getComputedStyle(el).opacity)).toBe('1')
    await context.close()
  })
})
