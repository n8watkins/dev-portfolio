import { test, expect } from '@playwright/test'

/**
 * The n8builds.dev card in "My workshop": where I build in public, all open
 * source, with the case study and the source a click away (owner, 2026-10-27).
 */
test('the n8builds card says where I build and links to the case study and the source', async ({
  page,
}) => {
  await page.goto('/')
  const card = page.getByRole('article', { name: 'Where I build in public' })
  const link = card.getByRole('link', { name: "How it's built and tested" })
  await link.scrollIntoViewIfNeeded()
  await expect(link).toHaveAttribute('href', 'https://n8builds.dev/builds/n8builds')
  await expect(card.getByRole('link', { name: /Source code/ })).toHaveAttribute(
    'href',
    'https://github.com/n8watkins/n8builds-web'
  )
  await expect(card.getByText(/All open source, this portfolio included/)).toBeVisible()
  // It talks about where I build, not the CI behind it.
  await expect(card).not.toContainText('five browsers')
})

/**
 * The n8builds.dev teaser under the projects: one build at a time, each with
 * "See the build" on its n8builds.dev page, and its live site when it has one
 * (owner, 2026-10-26).
 */
test('the n8builds.dev teaser links each build to its n8builds.dev page', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  const teaser = page.getByRole('region', { name: 'Building in public' })
  await teaser.scrollIntoViewIfNeeded()
  for (const [name, slug, live] of [
    ['Solara', 'solara', 'https://solara-uv.web.app'],
    ['TL;DW', 'tldw', null],
  ] as const) {
    // A click that lands before the carousel hydrates does nothing (seen in
    // Firefox on CI), so click until the counter shows the build.
    await expect(async () => {
      await teaser.getByRole('button', { name: `Show ${name}` }).click()
      await expect(teaser.getByText(new RegExp(`^${name}, \\d+ of \\d+$`))).toBeVisible({ timeout: 1000 })
    }).toPass()
    const link = teaser.getByRole('link', { name: `See the build: ${name} on n8builds.dev` })
    await expect(link).toHaveAttribute('href', `https://n8builds.dev/builds/${slug}`)
    await expect(link).toHaveAttribute('target', '_blank')
    const site = teaser.getByRole('link', { name: `Live site of ${name} (opens in a new tab)` })
    if (live) await expect(site).toHaveAttribute('href', live)
    else await expect(site).toHaveCount(0)
  }
})

/**
 * The map card's arcs (components/ui/BentoComponents/MapAnimations.tsx) draw
 * themselves in a GSAP loop. Under reduced motion they show fully drawn and
 * hold still; otherwise they keep drawing.
 */
test.describe('the map arcs', () => {
  const offsets = (page: import('@playwright/test').Page) =>
    page
      .locator('.neon-path')
      .evaluateAll((paths) => paths.map((p) => getComputedStyle(p).strokeDashoffset))

  test('hold still, fully drawn, under reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    const arcs = page.locator('.neon-path')
    await arcs.first().scrollIntoViewIfNeeded()
    await expect(arcs).toHaveCount(3)
    const before = await offsets(page)
    await page.waitForTimeout(1500)
    expect(await offsets(page)).toEqual(before)
    expect(
      before.every((o) => parseFloat(o) === 0),
      `offsets ${before}`
    ).toBe(true)
  })

  test('keep drawing when motion is allowed', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await page.goto('/')
    const arcs = page.locator('.neon-path')
    await arcs.first().scrollIntoViewIfNeeded()
    await expect(arcs).toHaveCount(3)
    const before = await offsets(page)
    await expect.poll(() => offsets(page)).not.toEqual(before)
  })
})

/**
 * Tech for Pros (techforpros.com) is where I work now (owner, 2026-11-01): the
 * hero's card and the workshop's card name the site, show its mark and link
 * to it, and the hero card's tag fits on one line.
 */
test("Tech for Pros' cards name techforpros.com, show its mark and link to it", async ({
  page,
}) => {
  await page.goto('/')
  const door = page.getByRole('link', { name: /Where I work\s*techforpros\.com/ }).first()
  await expect(door).toHaveAttribute('href', 'https://techforpros.com')
  await expect(door.locator('img[src*="techforpros-icon"]')).toHaveCount(1)
  // The tag is short enough to sit on one line, like n8builds.dev's.
  const tag = door.getByText('For service businesses', { exact: true })
  await expect(tag).toBeVisible()
  const box = await tag.boundingBox()
  expect(box!.height).toBeLessThan(30)

  const card = page.getByRole('article', { name: /Run a service business/ })
  await card.scrollIntoViewIfNeeded()
  await expect(card.getByText('techforpros.com', { exact: true })).toBeVisible()
  await expect(card.locator('img[src*="techforpros-icon"]')).toHaveCount(1)
  await expect(card.getByRole('link', { name: /Visit techforpros\.com/ })).toHaveAttribute(
    'href',
    'https://techforpros.com'
  )
})

/**
 * Appturnity appears only as a past role in Experience (Full Stack Developer,
 * with its client sites), never anywhere else and never linked (owner,
 * 2026-11-01).
 */
test('Appturnity shows only as a past role in Experience, never linked', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('a[href*="appturnity"]')).toHaveCount(0)
  const experience = page.locator('#experience')
  const card = experience.locator('div.group\\/exp', { hasText: 'Appturnity' })
  await expect(card).toHaveCount(1)
  await expect(card.getByRole('heading', { name: 'Full Stack Developer', exact: true })).toBeAttached()
  await expect(card.getByText('Appturnity', { exact: true })).toBeAttached()
  await expect(card.getByRole('link', { name: /comfort1hvac\.com/ })).toHaveAttribute(
    'href',
    'https://comfort1hvac.com/'
  )
  // Nowhere outside Experience.
  const outside = await page.evaluate(() => {
    const exp = document.getElementById('experience')!
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
    const hits: string[] = []
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      if (/appturnity/i.test(n.textContent ?? '') && !exp.contains(n)) hits.push(n.textContent!)
    }
    return hits
  })
  expect(outside).toEqual([])
  await expect(page.locator('head')).not.toContainText(/appturnity/i)
  await expect(experience.getByRole('link', { name: 'Tech for Pros' })).toHaveAttribute(
    'href',
    'https://techforpros.com'
  )
  await expect(page.locator('#about')).toContainText(
    'three years building client apps at a consulting firm'
  )
  await expect(page.locator('#about').getByRole('link', { name: 'Tech for Pros' })).toHaveAttribute(
    'href',
    'https://techforpros.com'
  )
})

/**
 * The footer's "My sites" lists both sites with their marks, and its last
 * line is "Built in public at n8builds.dev" (owner, 2026-11-01).
 */
test('the footer lists my sites with their marks and signs off with n8builds.dev', async ({
  page,
}) => {
  await page.goto('/')
  const sitemap = page.getByRole('navigation', { name: 'Site map' })
  await sitemap.scrollIntoViewIfNeeded()
  await expect(sitemap.getByText('My sites', { exact: true })).toBeVisible()
  await expect(sitemap).not.toContainText('Elsewhere')
  for (const [name, href, mark] of [
    ['n8builds.dev', 'https://n8builds.dev', 'n8-icon'],
    ['techforpros.com', 'https://techforpros.com', 'techforpros-icon'],
  ]) {
    const link = sitemap.getByRole('link', { name: new RegExp(`^${name.replace('.', '\\.')}`) })
    await expect(link).toHaveAttribute('href', href)
    await expect(link.locator(`img[src*="${mark}"]`)).toHaveCount(1)
    // The link (with its mark) fits in its column, never cut off or wrapped.
    const box = (await link.boundingBox())!
    expect(box.height).toBeLessThan(30)
    expect(box.x + box.width).toBeLessThanOrEqual(page.viewportSize()!.width)
  }
  const signOff = page.getByRole('link', { name: /Built in public at n8builds\.dev/ })
  await expect(signOff).toBeVisible()
  await expect(signOff).toHaveAttribute('href', 'https://n8builds.dev')
})

/**
 * On a small phone the experience list is several screens tall: each card
 * fades in as it scrolls into view, rather than the list waiting for a share
 * of itself to show (which it never could, so it stayed hidden).
 */
test('experience cards show on a small phone', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 })
  await page.goto('/')
  const cards = page.locator('#experience').getByRole('heading', { level: 3 })
  for (const i of [0, 1]) {
    await cards.nth(i).scrollIntoViewIfNeeded()
    await expect(cards.nth(i)).toBeInViewport()
    await expect
      .poll(() =>
        cards.nth(i).evaluate((e) => {
          let o = 1
          for (let n: Element | null = e; n; n = n.parentElement)
            o *= Number(getComputedStyle(n).opacity)
          return o
        })
      )
      .toBeGreaterThan(0.99)
  }
})

/**
 * "Message me" sits beside the resume in the top right corner and opens
 * n8builds.dev's contact form (owner, 2026-11-08).
 */
test('the top corner offers Message me beside the resume', async ({ page, isMobile }) => {
  test.skip(isMobile, '"Message me" shows from 768px up; on a phone the footer carries the contact links.')
  await page.goto('/')
  const message = page.getByRole('link', { name: /^Message me/ })
  await expect(message).toBeVisible()
  await expect(message).toHaveAttribute('href', 'https://n8builds.dev/#contact')
  await expect(message).toHaveAttribute('target', '_blank')
})
