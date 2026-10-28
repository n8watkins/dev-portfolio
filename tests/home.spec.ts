import { test, expect } from '@playwright/test'

/**
 * The n8builds.dev card in "My workshop": where I build in public, all open
 * source, with the case study and the source a click away (owner, 2026-10-27).
 */
test('the n8builds card says where I build and links to the case study and the source', async ({ page }) => {
  await page.goto('/')
  const card = page.getByRole('article', { name: 'Where I build in public' })
  const link = card.getByRole('link', { name: "How it's built and tested" })
  await link.scrollIntoViewIfNeeded()
  await expect(link).toHaveAttribute('href', 'https://n8builds.dev/builds/n8builds')
  await expect(card.getByRole('link', { name: /Source code/ })).toHaveAttribute('href', 'https://github.com/n8watkins/n8builds-web')
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
    ['Portfolio Rank', 'portfolio-rank', 'https://portfoliorank.vercel.app'],
    ['TL;DW', 'tldw', null],
  ] as const) {
    await teaser.getByRole('button', { name: `Show ${name}` }).click()
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
    page.locator('.neon-path').evaluateAll((paths) => paths.map((p) => getComputedStyle(p).strokeDashoffset))

  test('hold still, fully drawn, under reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/')
    const arcs = page.locator('.neon-path')
    await arcs.first().scrollIntoViewIfNeeded()
    await expect(arcs).toHaveCount(3)
    const before = await offsets(page)
    await page.waitForTimeout(1500)
    expect(await offsets(page)).toEqual(before)
    expect(before.every((o) => parseFloat(o) === 0), `offsets ${before}`).toBe(true)
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
