import { test, expect } from './fixtures/test'

/**
 * The About page, only about me (owner, 2026-11-08): one portrait, then the
 * story in photo scenes (at work, in LA, the setup), with stickers drifting
 * around them. The work (projects, experience, stack) is on the home page.
 */
test('the home page opens with About and the bento, and links to the full page', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  const teaser = page.locator('#about')
  await expect(teaser.getByRole('heading', { name: 'About me' })).toBeAttached()
  await expect(teaser).toContainText(/ready to relocate/i)
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

test('/about ends with ways on: where you were, the experience, and the top of the home page', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  // Straight to /about: nothing to return to, so no "Continue where you were".
  await page.goto('/about')
  const ways = page.getByRole('navigation', { name: 'Where to next' })
  await ways.scrollIntoViewIfNeeded()
  await expect(ways.getByRole('link', { name: 'Back to the top of the home page' })).toHaveAttribute('href', '/')
  await expect(ways.getByRole('link', { name: 'See my experience' })).toBeVisible()
  await expect(ways.getByRole('link', { name: 'Continue where you were' })).toHaveCount(0)

  // From the home page's "More about me": back to the same spot, the section
  // at the top of the screen and how far into it, as saved on the way out.
  // (A click before the page has hydrated is a plain page load, which leaves
  // nothing to return to; wait for it, as a visitor's first scroll would.)
  await page.goto('/', { waitUntil: 'networkidle' })
  const more = page.locator('#about').getByRole('link', { name: 'More about me' })
  await more.scrollIntoViewIfNeeded()
  await more.click()
  await expect(page).toHaveURL(/\/about$/)
  await expect
    .poll(() => page.evaluate(() => sessionStorage.getItem('portfolio-left-home-at')))
    .not.toBeNull()
  const saved = JSON.parse(
    (await page.evaluate(() => sessionStorage.getItem('portfolio-left-home-at')))!
  ) as { section: string; offset: number }
  const back = page.getByRole('navigation', { name: 'Where to next' }).getByRole('link', { name: 'Continue where you were' })
  await back.scrollIntoViewIfNeeded()
  await back.click()
  await expect(page).toHaveURL(/\/$/)
  const offsetNow = () =>
    page.evaluate(
      (section) =>
        section
          ? -document.getElementById(section)!.getBoundingClientRect().top
          : window.scrollY,
      saved.section
    )
  await expect.poll(async () => Math.abs((await offsetNow()) - saved.offset)).toBeLessThanOrEqual(3)

  // "See my experience" lands on the home page's experience.
  await page.goto('/about')
  const exp = page.getByRole('navigation', { name: 'Where to next' }).getByRole('link', { name: 'See my experience' })
  await exp.scrollIntoViewIfNeeded()
  await exp.click()
  await expect(page).toHaveURL(/\/$/)
  await expect(page.locator('#experience')).toBeInViewport()
})
