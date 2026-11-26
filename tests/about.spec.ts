import { test, expect } from './fixtures/test'

/**
 * A move between the home page and /about loads a whole page (the home page
 * is the heaviest on the site: the hero grid, the map, the stack card). With
 * other test workers busy it can take more than the default 5 s to land (seen
 * in repeated full runs of this file, never in 30 runs of the navigation
 * tests alone), so each move gets more time.
 */
const BETWEEN_PAGES = { timeout: 15_000 }

/**
 * The About page, only about me (owner, 2026-11-08): one portrait, then the
 * story in photo scenes (at work, in LA, the setup), with stickers drifting
 * around them. The work (projects, experience, stack) is on the home page.
 */
test('the home page opens with About and the bento, and links to the full page', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  const teaser = page.locator('#about')
  await expect(teaser.getByRole('heading', { name: 'About me' })).toBeAttached()
  await expect(teaser).toContainText(/ready to relocate/i)
  await teaser.getByRole('link', { name: 'More about me' }).click()
  await expect(page).toHaveURL(/\/about$/, BETWEEN_PAGES)
  await expect(page.getByRole('heading', { level: 1, name: 'About me' })).toBeVisible()
})

test('the home About teaser is one compact block with two quick facts', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  const teaser = page.locator('#about')
  const facts = teaser.getByRole('list', { name: 'Quick facts' }).getByRole('listitem')
  await expect(facts).toHaveText([
    '75+ client sites shipped end to end',
    '30+ open source projects',
  ])
  // No dead gap: the paragraph starts right under the heading.
  const heading = teaser.getByRole('heading', { name: 'About me' })
  const copy = teaser.getByText(/full-stack developer in Los Angeles/)
  await expect(copy).toBeVisible()
  const gap = (await copy.boundingBox())!.y - (await heading.boundingBox())!.y
  expect(gap).toBeLessThan(110)
})

test('/about has a Home / About me breadcrumb above the intro, and Home leads to the home page', async ({
  page,
}) => {
  await page.goto('/about')
  const crumbs = page.getByRole('navigation', { name: 'Breadcrumb' })
  await expect(crumbs.locator('li')).toHaveCount(3)
  await expect(crumbs.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/')
  await expect(crumbs.locator('[aria-current="page"]')).toHaveText('About me')
  const above =
    (await crumbs.boundingBox())!.y < (await page.getByText('Get to know me').boundingBox())!.y
  expect(above).toBe(true)
  await crumbs.getByRole('link', { name: 'Home' }).click()
  await expect(page).toHaveURL(/\/$/, BETWEEN_PAGES)
})

test('the About page tells the story in scenes with one portrait, and nothing else', async ({
  page,
}) => {
  await page.goto('/about')
  await expect(page).toHaveTitle('About | Nathan Watkins')
  const main = page.locator('main')
  await expect(main.getByRole('img', { name: 'Photo of Nathan Watkins' })).toHaveCount(1)
  await expect(main.getByRole('img', { name: /watercolor/i })).toHaveCount(0)
  for (const title of [
    'Using AI to help people get things done',
    'In LA, and open to moving',
    'Where I build in public',
  ]) {
    await expect(main.getByRole('heading', { level: 2, name: title })).toBeAttached()
  }
  // Each scene has its photo (stock photos and an n8builds.dev screenshot until
  // the owner makes his own, 2026-11-25), each saying what is in it and none
  // claiming to be Nathan.
  const photo = (id: string) => main.locator(`section[aria-labelledby="scene-${id}"] img`)
  await expect(photo('work')).toHaveAttribute('alt', /electrician/i)
  await expect(photo('la')).toHaveAttribute('alt', /man pointing at a laptop screen while a boy/i)
  await expect(photo('setup')).toHaveAttribute('alt', 'The home page of n8builds.dev')
  const scenePhotos = main.locator('section[aria-labelledby^="scene-"] img')
  await expect(scenePhotos).toHaveCount(3)
  for (const alt of await scenePhotos.evaluateAll((imgs) =>
    imgs.map((img) => img.getAttribute('alt') ?? '')
  )) {
    expect(alt).not.toMatch(/nathan|\bme\b|\bmy\b/i)
  }
  await expect(main.locator('[data-photo-placeholder]')).toHaveCount(0)
  // The LA scene opens with where he is from (owner, 2026-11-25).
  await expect(main.locator('section[aria-labelledby="scene-la"] p').nth(1)).toHaveText(
    "I'm born and raised in LA, and I've traveled all over the country over the years."
  )
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
  expect(await decal.evaluate((el) => getComputedStyle(el.parentElement!).pointerEvents)).toBe(
    'none'
  )

  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.reload()
  expect(
    await page
      .locator('.decal')
      .first()
      .evaluate((el) => getComputedStyle(el).animationName)
  ).toBe('none')
})

/**
 * The background (owner, 2026-11-25): the site's grid, whose squares move but
 * never light behind text, and scenes that rise in as they scroll into view.
 * Geometry is measured in settled states only: once a scene has finished
 * rising in, or under reduced motion (nothing animates).
 */
const SCENES = ['work', 'la', 'setup'] as const

/** Every line box of text in the page's content, and every photo, as plain rects. */
const blockersScript = () => {
  const main = document.querySelector('main')!
  const rects: { what: string; l: number; t: number; r: number; b: number }[] = []
  const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT)
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (!n.textContent?.trim() || n.parentElement?.closest('[aria-hidden="true"], footer')) continue
    // Words still waiting to rise in are not shown yet (and drawn lower for now).
    if (n.parentElement?.checkVisibility?.({ opacityProperty: true }) === false) continue
    const range = document.createRange()
    range.selectNodeContents(n)
    for (const r of range.getClientRects())
      if (r.width && r.height)
        rects.push({
          what: n.textContent.trim().slice(0, 30),
          l: r.left,
          t: r.top,
          r: r.right,
          b: r.bottom,
        })
  }
  for (const img of main.querySelectorAll('img')) {
    const r = img.getBoundingClientRect()
    rects.push({ what: `img ${img.alt}`, l: r.left, t: r.top, r: r.right, b: r.bottom })
  }
  return rects
}

/** The grid's cells lit now, as plain rects. */
const litCellsScript = () =>
  [...document.querySelectorAll<HTMLElement>('[data-wander], [data-rest]')]
    .filter((c) => Number(getComputedStyle(c).opacity) > 0.01)
    .map((c) => {
      const r = c.getBoundingClientRect()
      return { l: r.left, t: r.top, r: r.right, b: r.bottom }
    })

test('the scenes rise in as they scroll into view', async ({ page }) => {
  await page.goto('/about')
  // Below the fold, the last scene waits hidden and lowered (once the page runs).
  const photo = page.locator('section[aria-labelledby="scene-setup"] > div').first()
  await expect.poll(() => photo.evaluate((el) => getComputedStyle(el).opacity)).toBe('0')
  expect(await photo.evaluate((el) => getComputedStyle(el).transform)).not.toBe('none')
  await photo.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }))
  // Then rises all the way and is fully there.
  await expect
    .poll(() =>
      photo.evaluate((el) => {
        const s = getComputedStyle(el)
        return `${s.opacity} ${s.transform}`
      })
    )
    .toBe('1 none')
})

test('the grid squares move, are decorative, and never light behind text', async ({
  page,
  isMobile,
}) => {
  // Three widths, three scenes, a few looks at each: longer than one page check.
  test.setTimeout(90_000)
  const widths = isMobile ? [page.viewportSize()!.width] : [390, 1024, 1440]
  for (const width of widths) {
    if (!isMobile) await page.setViewportSize({ width, height: 900 })
    await page.goto('/about')
    const grid = page.locator('main > [aria-hidden="true"]').first()
    await expect(grid.locator('[data-wander]').first()).toBeAttached()
    expect(await grid.evaluate((el) => getComputedStyle(el).pointerEvents)).toBe('none')
    let seen = 0
    for (const id of SCENES) {
      const words = page.locator(`section[aria-labelledby="scene-${id}"] > div`).nth(1)
      await words.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }))
      // Settled: the scene has risen all the way, so its words are where they rest.
      await expect
        .poll(() =>
          words.evaluate((el) => {
            const s = getComputedStyle(el)
            return `${s.opacity} ${s.transform}`
          })
        )
        .toBe('1 none')
      // The squares hop every second or so: look a few times.
      for (let n = 0; n < 4; n++) {
        const text = (await page.evaluate(blockersScript)).filter((b) => !b.what.startsWith('img'))
        const cells = await page.evaluate(litCellsScript)
        seen += cells.length
        const behind = text
          .filter((b) => cells.some((c) => c.l < b.r && c.r > b.l && c.t < b.b && c.b > b.t))
          .map((b) => b.what)
        expect(behind, `${id} at ${width}, look ${n + 1}`).toEqual([])
        await page.waitForTimeout(600)
      }
    }
    // And they really are lit and moving around the scenes.
    expect(seen, `lit squares at ${width}`).toBeGreaterThan(0)
  }
})

test('under reduced motion no square moves and the scenes are simply there', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/about')
  await expect(page.locator('[data-rest]').first()).toBeAttached()
  const resting = () =>
    page
      .locator('[data-rest]')
      .evaluateAll((els) => els.map((el) => getComputedStyle(el).opacity).join())
  // Once drawn, they rest softly lit.
  await expect.poll(async () => (await resting()).split(',').some((o) => Number(o) > 0)).toBe(true)
  const before = await resting()
  // (Not the mouse wheel: mobile WebKit has none.)
  await page.evaluate(() => window.scrollBy({ top: 1200, behavior: 'instant' }))
  await page.waitForTimeout(2000)
  // The resting squares hold still however you scroll, and nothing wanders.
  expect(await resting()).toBe(before)
  const wandering = await page
    .locator('[data-wander]')
    .evaluateAll((els) => els.filter((el) => Number(getComputedStyle(el).opacity) > 0).length)
  expect(wandering).toBe(0)
  for (const id of SCENES) {
    const photo = page.locator(`section[aria-labelledby="scene-${id}"] > div`).first()
    expect(await photo.evaluate((el) => getComputedStyle(el).opacity)).toBe('1')
  }
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
  await expect(page).toHaveURL(/\/$/, BETWEEN_PAGES)
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
  await expect(
    ways.getByRole('link', { name: 'Back to the top of the home page' })
  ).toHaveAttribute('href', '/')
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
  await expect(page).toHaveURL(/\/about$/, BETWEEN_PAGES)
  await expect
    .poll(() => page.evaluate(() => sessionStorage.getItem('portfolio-left-home-at')))
    .not.toBeNull()
  const saved = JSON.parse(
    (await page.evaluate(() => sessionStorage.getItem('portfolio-left-home-at')))!
  ) as { section: string; offset: number }
  const back = page
    .getByRole('navigation', { name: 'Where to next' })
    .getByRole('link', { name: 'Continue where you were' })
  await back.scrollIntoViewIfNeeded()
  await back.click()
  await expect(page).toHaveURL(/\/$/, BETWEEN_PAGES)
  const offsetNow = () =>
    page.evaluate(
      (section) =>
        section ? -document.getElementById(section)!.getBoundingClientRect().top : window.scrollY,
      saved.section
    )
  await expect.poll(async () => Math.abs((await offsetNow()) - saved.offset)).toBeLessThanOrEqual(3)

  // "See my experience" lands on the home page's experience.
  await page.goto('/about')
  const exp = page
    .getByRole('navigation', { name: 'Where to next' })
    .getByRole('link', { name: 'See my experience' })
  await exp.scrollIntoViewIfNeeded()
  await exp.click()
  await expect(page).toHaveURL(/\/$/, BETWEEN_PAGES)
  await expect(page.locator('#experience')).toBeInViewport()
})
