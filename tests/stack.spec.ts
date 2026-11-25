import { test, expect } from './fixtures/test'

/**
 * The stack (owner, 2026-11-08): the home page's tech stack card (with the
 * dino) has "See my stack" to /stack, with every tool by layer (each with a line on why) and
 * the dino game as a proper play area, roomy on phones too.
 */
test("the home page's tech stack card leads to /stack", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  const link = page.locator('#about').getByRole('link', { name: 'See my stack' })
  await link.scrollIntoViewIfNeeded()
  await link.click()
  await expect(page).toHaveURL(/\/stack$/)
  await expect(page.getByRole('heading', { level: 1, name: 'What I build with' })).toBeVisible()
})

test('/stack lists every tool once, by layer, each with its reason', async ({ page }) => {
  await page.goto('/stack')
  const items = page.locator('[data-stack-layer] > li')
  const names = await items.locator('p.font-semibold').allTextContents()
  // data/stack.tsx: 8 agents and models, 3 local AI tools, 27 in the dev stack.
  expect(names).toHaveLength(38)
  expect(new Set(names).size).toBe(38)
  for (const reason of await items.locator('p.text-sm').allTextContents()) {
    expect(reason.trim().length).toBeGreaterThan(5)
  }
})

// data/stack.tsx: the tiles whose description names a project (owner, 2026-11-25).
const LINKED_TILES = 16

test('/stack links each tool to the project that uses it', async ({ page }) => {
  await page.goto('/stack')
  const links = page.locator('[data-stack-layer] a')
  // One per linked tile: a link whose words are missing from its description would show none.
  await expect(links).toHaveCount(LINKED_TILES)
  // The portfolio's own projects open their page here.
  await expect(links.filter({ hasText: 'Wren' })).toHaveAttribute('href', '/projects/wren')
  await expect(links.filter({ hasText: 'NetTrailers' })).toHaveAttribute('href', '/projects/net-trailers')
  for (const pr of await links.filter({ hasText: 'Portfolio Rank' }).all()) {
    await expect(pr).toHaveAttribute('href', '/projects/portfolio-rank')
    await expect(pr).not.toHaveAttribute('target', '_blank')
  }
  // The other builds open theirs on n8builds.dev, in a new tab that says so.
  const voicedock = links.filter({ hasText: 'VoiceDock' })
  await expect(voicedock).toHaveAttribute('href', 'https://n8builds.dev/builds/voicedock')
  await expect(voicedock).toHaveAttribute('target', '_blank')
  await expect(voicedock).toHaveAccessibleName('VoiceDock (opens in a new tab)')
  await expect(links.filter({ hasText: "N8's Notions" })).toHaveAttribute('href', 'https://n8builds.dev/blog')
})

test.describe('the tech stack tiles (motion allowed)', () => {
  test.use({ contextOptions: { reducedMotion: 'no-preference' } })

  // Every tile, its description shown (focused, with transitions off so it
  // opens at once): at most three lines, and all of it inside the tile.
  for (const width of [1440, 390]) {
    test(`every description fits its tile at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 })
      await page.addInitScript(() => {
        document.addEventListener('DOMContentLoaded', () => {
          const style = document.createElement('style')
          style.textContent = '*, *::before, *::after { transition: none !important }'
          document.head.append(style)
        })
      })
      await page.goto('/stack')
      const tiles = page.locator('[data-dino-panel] [data-marquee-row] > :first-child > figure')
      await expect(tiles).toHaveCount(38)
      const misfits = await tiles.evaluateAll((figures) =>
        figures.flatMap((figure) => {
          ;(figure as HTMLElement).focus({ preventScroll: true })
          const tile = figure.getBoundingClientRect()
          const caption = figure.querySelector('figcaption')!.getBoundingClientRect()
          const p = figure.querySelector<HTMLElement>('.description')!
          const style = getComputedStyle(p)
          const lines = Math.round(
            (p.getBoundingClientRect().height - parseFloat(style.paddingTop)) / parseFloat(style.lineHeight)
          )
          const name = figure.querySelector('[data-tile-name]')!.textContent
          const inside = caption.top >= tile.top && caption.bottom <= tile.bottom
          return lines <= 3 && inside ? [] : [`${name}: ${lines} lines, ${inside ? 'inside' : 'spills out of'} its tile`]
        })
      )
      expect(misfits).toEqual([])
    })
  }

  test('a tile with a project link: Tab reaches the link, its description stays open', async ({ page }) => {
    await page.goto('/stack')
    const tile = page
      .locator('[data-dino-panel] [data-marquee-row] > :first-child > figure')
      .filter({ has: page.locator('[data-tile-name]', { hasText: /^Piper$/ }) })
    await tile.evaluate((el: HTMLElement) => el.focus({ preventScroll: true }))
    await page.keyboard.press('Tab')
    const link = tile.getByRole('link', { name: /VoiceDock/ })
    await expect(link).toBeFocused()
    await expect(tile.locator('.description')).toHaveCSS('opacity', '1')
    // The loop's copies keep their links out of the tab order.
    const copies = page.locator('[data-dino-panel] [data-marquee-row] > :not(:first-child) a')
    await expect.poll(() => copies.count()).toBeGreaterThan(0)
    for (const copy of await copies.all()) await expect(copy).toHaveAttribute('tabindex', '-1')
  })
})

test.describe('the tech stack tiles (reduced motion: they hold still)', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } })

  test('hovering or tapping a tile, then its link, opens the project', async ({ page, hasTouch }) => {
    await page.goto('/stack')
    const tile = page
      .getByRole('region', { name: 'AI kit' })
      .locator('figure')
      .filter({ has: page.locator('[data-tile-name]', { hasText: /^Gemini$/ }) })
    await tile.scrollIntoViewIfNeeded()
    const link = tile.getByRole('link', { name: 'Wren' })
    // At rest the description is shut: its link has no size to hit.
    expect((await link.boundingBox())?.height ?? 0).toBe(0)
    if (hasTouch) await tile.tap()
    else await tile.hover()
    await expect(tile.locator('.description')).toHaveCSS('opacity', '1')
    if (hasTouch) await link.tap()
    else await link.click()
    await expect(page).toHaveURL(/\/projects\/wren$/)
  })
})

for (const width of [320, 390]) {
  test(`the dino's play area is full width and tall enough at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 })
    await page.goto('/stack')
    const area = page.getByRole('region', { name: 'My tech stack, with the dino game' })
    const box = (await area.boundingBox())!
    // Edge to edge: as wide as the page (on desktop the page keeps a scrollbar gutter).
    const pageWidth = await page.evaluate(() => document.documentElement.getBoundingClientRect().width)
    expect(box.width).toBeGreaterThanOrEqual(pageWidth - 1)
    expect(box.height).toBeGreaterThanOrEqual(440)
    await expect(area.locator('[data-dino-panel]')).toBeAttached()
  })
}
