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
 * "Building in public": builds that aren't featured here link to their pages on
 * n8builds.dev, never to their own repos or sites, and Scribe isn't featured.
 */
test('the "Building in public" card links each build to its n8builds.dev page', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  const card = page.getByRole('region', { name: 'Building in public' })
  await card.scrollIntoViewIfNeeded()
  for (const [name, slug] of [['TL;DW', 'tldw'], ['Portfolio Rank', 'portfolio-rank']]) {
    await card.getByRole('button', { name: `Show ${name}` }).click()
    const link = card.getByRole('link', { name: `See the build: ${name} on n8builds.dev` })
    await expect(link).toHaveAttribute('href', `https://n8builds.dev/builds/${slug}`)
    await expect(link).toHaveAttribute('target', '_blank')
    await expect(card.locator('a[href*="github.com"]')).toHaveCount(0)
  }
  await expect(card.getByRole('button', { name: /Scribe/ })).toHaveCount(0)
  const html = await page.content()
  expect(html).not.toContain('LocalDictate')
  expect(html).not.toContain('github.com/n8watkins/scribe')
  expect(html).not.toContain('scribe.n8builds.dev')
})
