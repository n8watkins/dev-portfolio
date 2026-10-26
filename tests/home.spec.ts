import { test, expect } from '@playwright/test'

/** The n8builds.dev card: it sells how the work is built, and links to the case study. */
test('the n8builds card shows how I build and links to the case study', async ({ page }) => {
  await page.goto('/')
  const link = page.getByRole('link', { name: "How it's built and tested" })
  await link.scrollIntoViewIfNeeded()
  await expect(link).toHaveAttribute('href', 'https://n8builds.dev/builds/n8builds')
  await expect(page.getByText('See how I build')).toBeVisible()
  await expect(page.getByText(/test suite on five browsers/)).toBeVisible()
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
