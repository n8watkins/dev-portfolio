import { expect, test, type Locator } from '@playwright/test'

/**
 * /lab/map: the bold 3D map on trial (owner, 2026-11-24), a hidden page: not
 * in the nav or the sitemap, noindex. The map (components/ui/BoldMap) counts
 * the frames it draws on its card (`data-frames`), says whether it moves
 * (`data-mode`) and whether its loop runs (`data-running`).
 */
const frames = (map: Locator) => map.evaluate((el) => Number((el as HTMLElement).dataset.frames))

test('the lab page shows the new map beside the current one, then larger', async ({ page }) => {
  await page.goto('/lab/map?from=Austin')
  await expect(page.getByRole('heading', { level: 1, name: 'The bold map' })).toBeVisible()
  const maps = page.locator('[data-bold-map]')
  await expect(maps).toHaveCount(2)
  await expect(maps.first()).toHaveAttribute('data-ready', 'true')
  // The current map is there for comparison.
  await expect(page.locator('.neon-path')).toHaveCount(3)
  // What the map says, for screen readers; the drawing itself is hidden from them.
  await expect(maps.first().locator('.sr-only')).toHaveText(
    /Nathan is in Los Angeles, California, and open to relocating anywhere\. You seem to be near Austin, TX, about 1,230 miles away\./
  )
  await expect(maps.first().locator('canvas')).toHaveAttribute('aria-hidden', 'true')
})

test('the lab page is hidden: noindex, out of the sitemap and the nav', async ({
  page,
  request,
}) => {
  await page.goto('/lab/map')
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/)
  const sitemap = await (await request.get('/sitemap.xml')).text()
  expect(sitemap).toContain('<loc>')
  expect(sitemap).not.toContain('/lab')
  await expect(page.locator('nav a[href*="/lab"]')).toHaveCount(0)
})

test('the map holds still, fully drawn, under reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/lab/map?from=Denver')
  const map = page.locator('[data-bold-map]').first()
  await map.scrollIntoViewIfNeeded()
  await expect(map).toHaveAttribute('data-mode', 'still')
  await expect(map).toHaveAttribute('data-ready', 'true')
  // The line to the visitor is drawn at once and labelled.
  await expect(map.locator('[data-on]', { hasText: 'near Denver, CO' })).toBeVisible()
  const before = await frames(map)
  await page.waitForTimeout(1500)
  expect(await frames(map)).toBe(before)
  await expect(map).toHaveAttribute('data-running', 'false')
})

test('the map moves on screen and pauses off screen', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.goto('/lab/map')
  const map = page.locator('[data-bold-map]').first()
  await map.scrollIntoViewIfNeeded()
  await expect(map).toHaveAttribute('data-ready', 'true')
  test.skip(
    (await map.getAttribute('data-renderer')) === '2d',
    'no WebGL2 in this browser: the map is the still 2D picture (tested below)'
  )
  await expect(map).toHaveAttribute('data-mode', 'moving')
  await expect(map).toHaveAttribute('data-running', 'true')
  const before = await frames(map)
  await expect.poll(() => frames(map)).toBeGreaterThan(before + 2)
  // Scrolled well past it, it stops drawing.
  await page.locator('footer').scrollIntoViewIfNeeded()
  await expect(map).toHaveAttribute('data-running', 'false')
  const paused = await frames(map)
  await page.waitForTimeout(800)
  expect(await frames(map)).toBe(paused)
})

test('without WebGL2 the map is drawn once, still, on a 2D canvas', async ({ page }) => {
  await page.addInitScript(() => {
    const get = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type: string,
      ...rest: unknown[]
    ) {
      if (type === 'webgl2') return null
      return (get as (...a: unknown[]) => RenderingContext | null).call(this, type, ...rest)
    } as typeof get
  })
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  await page.goto('/lab/map?from=Seattle')
  const map = page.locator('[data-bold-map]').first()
  await map.scrollIntoViewIfNeeded()
  await expect(map).toHaveAttribute('data-renderer', '2d')
  await expect(map).toHaveAttribute('data-mode', 'still')
  await expect(map.locator('[data-on]', { hasText: 'near Seattle, WA' })).toBeVisible()
  // Something was painted: the canvas is not one flat colour.
  const colours = await map.locator('canvas').evaluate((c: HTMLCanvasElement) => {
    const d = c.getContext('2d')!.getImageData(0, 0, c.width, c.height).data
    const seen = new Set<number>()
    for (let i = 0; i < d.length; i += 4 * 97) seen.add((d[i] << 16) | (d[i + 1] << 8) | d[i + 2])
    return seen.size
  })
  expect(colours).toBeGreaterThan(20)
  expect(errors).toEqual([])
})

test('?from= places the visitor: a line and a label, or nothing from abroad', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/lab/map?from=40.7,-74')
  const map = page.locator('[data-bold-map]').first()
  await expect(
    map.locator('[data-on]', { hasText: /You · near New York, NY · 2,4\d0 mi/ })
  ).toBeVisible()
  await expect(page.locator('[data-visitor-source]')).toContainText('near New York, NY')

  await page.goto('/lab/map?from=London')
  await expect(page.locator('[data-bold-map]').first()).toHaveAttribute('data-ready', 'true')
  // No visitor label is ever shown (the place labels stay off under reduced motion).
  await expect(page.locator('[data-bold-map]').first().locator('[data-on]')).toHaveCount(0)
  await expect(page.locator('[data-visitor-source]')).toContainText('no line to you')

  // Locally there is no Cloudflare data: no visitor, and the map still draws.
  await page.goto('/lab/map')
  await expect(page.locator('[data-bold-map]').first()).toHaveAttribute('data-ready', 'true')
  await expect(page.locator('[data-visitor-source]')).toContainText('nothing known here')
})
