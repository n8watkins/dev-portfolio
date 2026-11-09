import { test, expect } from '@playwright/test'

/**
 * Every page's footer carries the hero's two cards, n8builds.dev (where I
 * build in public) and Tech for Pros (where I work), above the site map
 * (owner, 2026-11-08; the big workshop pitches are gone).
 */
test("every page's footer has my two sites' cards and the site map", async ({ page }) => {
  for (const path of ['/', '/projects', '/stack', '/about', '/projects/net-trailer']) {
    await page.goto(path)
    const footer = page.locator('footer')
    await expect(footer.getByRole('link', { name: /I build in public\s*n8builds\.dev/ }), path).toHaveAttribute(
      'href',
      /n8builds\.dev/
    )
    await expect(footer.getByRole('link', { name: /Where I work\s*techforpros\.com/ }), path).toHaveAttribute(
      'href',
      'https://techforpros.com'
    )
    const map = footer.getByRole('navigation', { name: 'Site map' })
    for (const name of ['Projects', 'Stack', 'About me', 'Resume', 'Contact', 'Build log']) {
      await expect(map.getByRole('link', { name: new RegExp(`^${name}`) }).first(), `${path} ${name}`).toBeAttached()
    }
  }
  // No workshop pitches left anywhere.
  await page.goto('/')
  await expect(page.getByRole('article', { name: /Run a service business/ })).toHaveCount(0)
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
 * Tech for Pros (techforpros.com) is where I work now (owner, 2026-11-01): the
 * hero's card names the site, shows its mark and links to it, and its tag fits
 * on one line.
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
})

/**
 * Appturnity appears only as a past role in Experience, never anywhere else and
 * never linked (owner, 2026-11-01). Since 2026-11-08 only Tech for Pros links
 * out from Experience (with a link icon); every other company is plain text,
 * and no client site is linked anywhere.
 */
test('Experience links only Tech for Pros, and Appturnity shows only as a past role', async ({
  page,
}) => {
  await page.goto('/')
  await expect(page.locator('a[href*="appturnity"]')).toHaveCount(0)
  const experience = page.locator('#experience')
  const card = experience.locator('div.group\\/exp', { hasText: 'Appturnity' })
  await expect(card).toHaveCount(1)
  await expect(card.getByRole('heading', { name: 'Full Stack Developer', exact: true })).toBeAttached()
  await expect(card.getByText('Appturnity', { exact: true })).toBeAttached()
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

  const links = experience.locator('a[href]')
  await expect(links).toHaveCount(1)
  await expect(links.first()).toHaveAttribute('href', 'https://techforpros.com')
  await expect(links.first().locator('svg')).toHaveCount(1)
  for (const site of ['riverwoodranch', 'lifelineclinicallab', 'comfort1hvac', 'primeshows', 'arroyosecogc', 'thecoderschool']) {
    await expect(page.locator(`a[href*="${site}"]`), site).toHaveCount(0)
  }

  const about = page.locator('#about')
  await expect(about).toContainText('three years building client apps at a consulting firm')
  await expect(about.getByRole('link', { name: 'Tech for Pros' })).toHaveAttribute(
    'href',
    'https://techforpros.com'
  )
})

test('"Expand all" opens every role\'s "What I did" in place, and closes them again', async ({ page }) => {
  await page.goto('/')
  const experience = page.locator('#experience')
  const details = experience.locator('details')
  await experience.getByRole('button', { name: 'Expand all' }).scrollIntoViewIfNeeded()
  await expect(details.first()).toBeAttached()
  const count = await details.count()
  expect(count).toBeGreaterThan(3)
  await expect(experience.getByText(/Building Tech for Pros, a SaaS/)).toBeHidden()
  await experience.getByRole('button', { name: 'Expand all' }).click()
  for (let i = 0; i < count; i++) await expect(details.nth(i)).toHaveAttribute('open', '')
  await expect(experience.getByText(/Building Tech for Pros, a SaaS/)).toBeVisible()
  // The work's screenshots come with it, as pictures only.
  await expect(experience.getByRole('img', { name: /Riverwood Ranch/ })).toBeVisible()
  await experience.getByRole('button', { name: 'Collapse all' }).click()
  for (let i = 0; i < count; i++) await expect(details.nth(i)).not.toHaveAttribute('open', '')
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
