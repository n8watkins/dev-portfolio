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
