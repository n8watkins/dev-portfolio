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
