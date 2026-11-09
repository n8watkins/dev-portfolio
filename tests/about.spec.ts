import { test, expect } from '@playwright/test'

/**
 * The About page, only about me (owner, 2026-11-08): one portrait, then the
 * story in photo scenes (at work, in LA, the setup), with stickers drifting
 * around them. The work (projects, experience, stack) is on the home page.
 */
test('the home page teases About and links to the full page', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  const teaser = page.locator('#about')
  await expect(teaser.getByRole('heading', { name: 'About me' })).toBeAttached()
  await expect(teaser).toContainText('ready to relocate')
  await teaser.getByRole('link', { name: 'More about me' }).click()
  await expect(page).toHaveURL(/\/about$/)
  await expect(page.getByRole('heading', { level: 1, name: 'About me' })).toBeVisible()
})

test('the About page tells the story in scenes with one portrait, and nothing else', async ({
  page,
}) => {
  await page.goto('/about')
  await expect(page).toHaveTitle('About | Nathan Watkins')
  const main = page.locator('main')
  await expect(main.getByRole('img', { name: 'Photo of Nathan Watkins' })).toHaveCount(1)
  await expect(main.getByRole('img', { name: /watercolor/i })).toHaveCount(0)
  for (const title of ['Building Tech for Pros', 'Teaching, in LA, and open to moving', 'Where I build in public']) {
    await expect(main.getByRole('heading', { level: 2, name: title })).toBeAttached()
  }
  // The work lives on the home page and its detail pages.
  for (const gone of ['What I bring', "Where I've built", 'My workshop', 'What I build with']) {
    await expect(main.getByRole('heading', { name: gone })).toHaveCount(0)
  }
  await expect(page.getByText(/Every role in full/)).toHaveCount(0)
})

test('the stickers drift, hold still under reduced motion, and never block a click', async ({
  page,
}) => {
  await page.goto('/about')
  const decal = page.locator('.decal').first()
  await expect(decal).toBeVisible()
  expect(await decal.evaluate((el) => getComputedStyle(el).animationName)).toBe('decal-drift')
  expect(await decal.evaluate((el) => getComputedStyle(el.parentElement!).pointerEvents)).toBe('none')

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.reload()
  expect(await page.locator('.decal').first().evaluate((el) => getComputedStyle(el).animationName)).toBe(
    'none'
  )
})

test('the pages are in the sitemap and not redirected', async ({ request }) => {
  const sitemap = await (await request.get('/sitemap.xml')).text()
  for (const path of ['/about', '/projects', '/stack']) {
    expect((await request.get(path, { maxRedirects: 0 })).status(), path).toBe(200)
    expect(sitemap, path).toContain(`https://portfolio.n8builds.dev${path}<`)
  }
})

test("a subpage's nav jumps to the home page's sections", async ({ page, isMobile }) => {
  test.skip(isMobile, 'The same nav on phones; one viewport is enough.')
  await page.goto('/about')
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'Experience' })
    .click()
  await expect(page).toHaveURL(/\/$/)
  await expect(page.locator('#experience')).toBeInViewport()
})
