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
  // data/stack.tsx: 7 agents and models, 3 local AI tools, 25 in the dev stack
  // (owner, 2026-11-25: Claude Fable 5.2 in; Cursor, OpenAI, Upstash and Figma out).
  expect(names).toHaveLength(35)
  expect(new Set(names).size).toBe(35)
  for (const dropped of ['Cursor', 'OpenAI', 'Upstash', 'Figma']) expect(names).not.toContain(dropped)
  expect(names).toContain('Claude Fable 5.2')
  for (const reason of await items.locator('p.text-sm').allTextContents()) {
    expect(reason.trim().length).toBeGreaterThan(5)
  }
})

// data/stack.tsx: the tiles whose description names a project (owner, 2026-11-25).
const LINKED_TILES = 18

test('/stack links each tool to the project that uses it', async ({ page }) => {
  await page.goto('/stack')
  const links = page.locator('[data-stack-layer] a')
  // One per linked tile: a link whose words are missing from its description would show none.
  await expect(links).toHaveCount(LINKED_TILES)
  // The portfolio's own projects go to their card on the home page.
  // (Never Wren: the tiles also show on n8builds.dev, which Wren left on 2026-11-11.)
  await expect(page.locator('main')).not.toContainText(/\bWren\b/)
  await expect(links.filter({ hasText: 'NetTrailers' })).toHaveAttribute('href', '/#project-net-trailers')
  for (const pr of await links.filter({ hasText: 'Portfolio Rank' }).all()) {
    await expect(pr).toHaveAttribute('href', '/#project-portfolio-rank')
    await expect(pr).not.toHaveAttribute('target', '_blank')
  }
  // AWS, backed by the resume and Portfolio Rank's S3 API uploads (2026-11-25).
  await expect(page.locator('[data-stack-layer] li', { hasText: 'AWS' }).locator('p.text-sm')).toHaveText(
    "S3, Lambda and Amplify. Portfolio Rank's screenshots use the S3 API."
  )
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
      await expect(tiles).toHaveCount(35)
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

  // The tiles are 188 x 84 (app/globals.css), tighter than the shared 208 x 112
  // tile (owner, 2026-11-25), and they are that size from the first paint:
  // checked in the server's HTML (scripts off, so nothing can resize them
  // later) and again once the page has hydrated and the loop has started.
  const firstTile = (path: string) =>
    `${path === '/' ? '#about ' : ''}[data-dino-panel] [data-marquee-row] > :first-child > figure`
  const tileSize = (f: Element) => {
    const r = f.getBoundingClientRect()
    return [Math.round(r.width), Math.round(r.height)]
  }
  for (const path of ['/', '/stack']) {
    test(`${path}: the tiles are 188 x 84 once the page is live`, async ({ page }) => {
      await page.goto(path)
      // The loop's copies appear after hydration.
      await expect(page.locator('[data-dino-panel] [data-marquee-row] > :nth-child(2)').first()).toBeAttached()
      await page.waitForTimeout(1000)
      expect(await page.locator(firstTile(path)).first().evaluate(tileSize)).toEqual([188, 84])
    })
  }

  test.describe('no script', () => {
    test.use({ javaScriptEnabled: false })
    for (const path of ['/', '/stack']) {
      test(`${path}: the server's HTML already has the tiles at 188 x 84`, async ({ page }) => {
        await page.goto(path)
        expect(await page.locator(firstTile(path)).first().evaluate(tileSize)).toEqual([188, 84])
      })
    }
  })

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

  test('hovering or tapping a tile, then its link, lands on the project on the home page', async ({ page, hasTouch }) => {
    await page.goto('/stack')
    const tile = page
      .getByRole('region', { name: 'AI kit' })
      .locator('figure')
      .filter({ has: page.locator('[data-tile-name]', { hasText: /^Gemini$/ }) })
    await tile.scrollIntoViewIfNeeded()
    const link = tile.getByRole('link', { name: 'Portfolio Rank' })
    // At rest the description is shut (clipped to no height): its link can't be hit.
    expect(
      await link.evaluate((a) => {
        const box = a.getBoundingClientRect()
        return a.contains(document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2))
      })
    ).toBe(false)
    if (hasTouch) await tile.tap()
    else await tile.hover()
    await expect(tile.locator('.description')).toHaveCSS('opacity', '1')
    if (hasTouch) await link.tap()
    else await link.click()
    await expect(page).toHaveURL(/\/#project-portfolio-rank$/)
    await expect(page.locator('#project-portfolio-rank')).toHaveAttribute('data-landed', '')
  })
})

/**
 * A stack link to one of the portfolio's projects lands on its card on the
 * home page (owner, 2026-11-25: "scroll us down to the projects";
 * lib/projectAnchor.ts): a scroll there (smooth, or a jump under reduced
 * motion), the hash in the address, a short highlight and focus on the card.
 * Each test waits for `data-landed`, set once the scroll has settled, before
 * measuring anything.
 */
test.describe('stack links land on the project on the home page', () => {
  const anchor = (page: import('@playwright/test').Page, slug: string) => page.locator(`#project-${slug}`)
  // The home page, once it handles the links (hydrated; before that a click is the browser's own jump).
  const goHome = async (page: import('@playwright/test').Page) => {
    await page.goto('/')
    await expect(page.locator('html')).toHaveAttribute('data-project-links', 'ready')
  }
  // The landed card sits below the fixed nav, at the landing offset, unless the page ends first.
  const expectInView = async (page: import('@playwright/test').Page, slug: string) => {
    const m = await anchor(page, slug).evaluate((el) => {
      const nav = document.querySelector('[aria-label="Main navigation"]')!.getBoundingClientRect()
      const box = el.getBoundingClientRect()
      const atEnd = document.documentElement.scrollHeight - window.innerHeight - window.scrollY < 2
      return { top: box.top, navBottom: nav.bottom, atEnd, height: innerHeight }
    })
    expect(m.top, 'card top below the nav').toBeGreaterThanOrEqual(m.navBottom)
    if (!m.atEnd) expect(Math.abs(m.top - 96), `card top ${m.top}px, aimed at 96px`).toBeLessThanOrEqual(8)
    expect(m.top, 'card top on screen').toBeLessThan(m.height / 2)
  }
  // The home page's tech stack card: a linked tile's link (the loop's first copy
  // while the rows move; under reduced motion there is only the one).
  const homeLink = (page: import('@playwright/test').Page, tile: string, text: string) =>
    page
      .locator('#about [data-dino-panel] [data-marquee-row] figure')
      .filter({ has: page.locator('[data-tile-name]', { hasText: new RegExp(`^${tile}$`) }) })
      .first()
      .getByRole('link', { name: text })

  test.describe('motion allowed', () => {
    test.use({ contextOptions: { reducedMotion: 'no-preference' } })

    test('from the home page: it scrolls to the card, highlights it, focuses it and puts it in the address', async ({ page }) => {
      await goHome(page)
      const link = homeLink(page, 'Gemini', 'Portfolio Rank')
      await expect(link).toHaveAttribute('href', '/#project-portfolio-rank')
      // A click on the link itself (the row moves, so not by pointer position).
      await link.evaluate((a: HTMLElement) => a.click())
      await expect(page).toHaveURL(/\/#project-portfolio-rank$/)
      const card = anchor(page, 'portfolio-rank')
      await expect(card).toHaveAttribute('data-landed', '', { timeout: 10_000 })
      await expect(card).toHaveAttribute('data-project-highlight', '')
      await expect(card).toBeFocused()
      await expectInView(page, 'portfolio-rank')
      // The highlight is brief.
      await expect(card).not.toHaveAttribute('data-project-highlight', '', { timeout: 5_000 })
      // Back returns to where the link was.
      await page.goBack()
      await expect(page).toHaveURL(/\/$/)
    })

    test('from /stack: the link goes home and lands on the card once the page has loaded', async ({ page }) => {
      await page.goto('/stack')
      await page.locator('[data-stack-layer] a', { hasText: 'NetTrailers' }).click()
      await expect(page).toHaveURL(/\/#project-net-trailers$/)
      const card = anchor(page, 'net-trailers')
      await expect(card).toHaveAttribute('data-landed', '', { timeout: 10_000 })
      await expect(card).toBeFocused()
      await expectInView(page, 'net-trailers')
    })

    test('by keyboard: Enter on a tile’s link lands on the card, and the next Tab goes into it', async ({ page, hasTouch }) => {
      test.skip(hasTouch, 'keyboard')
      await goHome(page)
      const tile = page
        .locator('#about [data-dino-panel] [data-marquee-row] > :first-child > figure')
        .filter({ has: page.locator('[data-tile-name]', { hasText: /^Turso$/ }) })
      await tile.evaluate((el: HTMLElement) => el.focus({ preventScroll: true }))
      await page.keyboard.press('Tab')
      await expect(tile.getByRole('link', { name: 'Portfolio Rank' })).toBeFocused()
      await page.keyboard.press('Enter')
      const card = anchor(page, 'portfolio-rank')
      await expect(card).toHaveAttribute('data-landed', '', { timeout: 10_000 })
      await expect(card).toBeFocused()
      await expectInView(page, 'portfolio-rank')
      await page.keyboard.press('Tab')
      expect(await card.evaluate((el) => el.contains(document.activeElement) && el !== document.activeElement)).toBe(true)
    })
  })

  test.describe('reduced motion', () => {
    test.use({ contextOptions: { reducedMotion: 'reduce' } })

    test('it jumps straight to the card, and still highlights it', async ({ page }) => {
      await goHome(page)
      const link = homeLink(page, 'Gemini', 'Portfolio Rank')
      // Where the page is one frame after the click: already at the card.
      const jumped = await link.evaluate(
        (a: HTMLElement) =>
          new Promise<number>((resolve) => {
            a.click()
            requestAnimationFrame(() =>
              resolve(Math.abs(document.getElementById('project-portfolio-rank')!.getBoundingClientRect().top - 96))
            )
          })
      )
      expect(jumped, 'px off the landing spot one frame later').toBeLessThanOrEqual(8)
      const card = anchor(page, 'portfolio-rank')
      await expect(card).toHaveAttribute('data-landed', '')
      await expect(card).toHaveAttribute('data-project-highlight', '')
      await expectInView(page, 'portfolio-rank')
    })

    test('a shared link (/#project-net-trailers) opens at the card', async ({ page }) => {
      await page.goto('/#project-net-trailers')
      const card = anchor(page, 'net-trailers')
      await expect(card).toHaveAttribute('data-landed', '', { timeout: 10_000 })
      await expectInView(page, 'net-trailers')
    })
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
