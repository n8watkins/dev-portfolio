import { expect, test, type Locator } from './fixtures/test'

/**
 * /lab/map: the test bed for the home page's bold map (tests/home.spec.ts
 * covers the map itself there): a hidden page, not in the nav or the sitemap,
 * noindex, that takes the visitor from `?from=` so the line to the visitor can
 * be seen without Cloudflare. The map (components/ui/BoldMap) counts the frames
 * it draws (`data-frames`), says whether it moves (`data-mode`) and whether
 * its loop runs (`data-running`).
 */
const frames = (map: Locator) => map.evaluate((el) => Number((el as HTMLElement).dataset.frames))

test('the lab page shows the map at the home card size, then larger', async ({ page }) => {
  await page.goto('/lab/map?from=Austin')
  await expect(page.getByRole('heading', { level: 1, name: 'The bold map' })).toBeVisible()
  const maps = page.locator('[data-bold-map]')
  await expect(maps).toHaveCount(2)
  await expect(maps.first()).toHaveAttribute('data-ready', 'true')
  // What the map says, for screen readers; the drawing itself is hidden from them.
  await expect(maps.first().locator('.sr-only')).toHaveText(
    /where Nathan is based, to the tech hubs he would move to\. You seem to be near Austin, TX, about 1,230 miles away\./
  )
  await expect(maps.first().locator('canvas')).toHaveAttribute('aria-hidden', 'true')
})

test('from Los Angeles: no line and no "You" label, the chip greets you instead', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/lab/map?from=Los%20Angeles')
  const map = page.locator('[data-bold-map]').first()
  await map.scrollIntoViewIfNeeded()
  await expect(map).toHaveAttribute('data-ready', 'true')
  await expect(map).toHaveAttribute('data-visitor', 'here')
  await expect(map.locator('[data-chip] [data-neighbour]')).toHaveText('Hey, neighbor')
  await expect(map.locator('[data-on]')).toHaveCount(0)
  await expect(page.locator('[data-visitor-source]')).toContainText('within 60 miles')
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
