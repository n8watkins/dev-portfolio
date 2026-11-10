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
  const teaser = page.getByRole('region', { name: /n8builds\.dev/ })
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
  // An upcoming build offers its waitlist on n8builds.dev, with it ticked, and its landing page.
  await expect(async () => {
    await teaser.getByRole('button', { name: 'Show KeysReady' }).click()
    await expect(teaser.getByText(/^KeysReady, \d+ of \d+$/)).toBeVisible({ timeout: 1000 })
  }).toPass()
  await expect(teaser.getByRole('link', { name: /^Join the waitlist for KeysReady/ })).toHaveAttribute(
    'href',
    'https://n8builds.dev/upcoming?interest=keysready#waitlist'
  )
  await expect(teaser.getByRole('link', { name: /^Its landing page/ })).toHaveAttribute(
    'href',
    'https://keysready.n8builds.dev'
  )
  await expect(teaser.getByRole('link', { name: /See the build: KeysReady/ })).toHaveCount(0)
})

/**
 * The bento's build log card (rounds 4 and 5 of 2026-11-09): a month of
 * n8builds.dev's build log, from its JSON (here the fixture), with arrows that
 * go round the months, and two links on top: n8builds.dev and the build log.
 */
test('the build log card shows a month, cycles the months, and links the site and the log', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  const card = page.locator('[data-build-log]')
  await card.scrollIntoViewIfNeeded()
  await expect(card).toHaveAttribute('data-build-log', 'ready')
  await expect(card.locator('[data-month]')).toHaveText('November 2026')
  await expect(card.locator('[data-changes]')).toHaveText('49')
  await expect(card.locator('[data-bars] > span')).toHaveCount(30)
  await card.getByRole('button', { name: 'Older month' }).click()
  await expect(card.locator('[data-month]')).toHaveText('October 2026')
  await expect(card.locator('[data-changes]')).toHaveText('275')
  // Round and round: newer from the newest is the oldest.
  await card.getByRole('button', { name: 'Newer month' }).click()
  await card.getByRole('button', { name: 'Newer month' }).click()
  await expect(card.locator('[data-month]')).toHaveText('September 2026')
  // Two links, and the card itself is not one.
  const links = card.getByRole('link')
  await expect(links).toHaveCount(2)
  await expect(card.getByRole('link', { name: /^n8builds\.dev/ })).toHaveAttribute('href', 'https://n8builds.dev')
  await expect(card.getByRole('link', { name: /^Build log/ })).toHaveAttribute('href', 'https://n8builds.dev/builds')
})

test('the build log card falls back to a plain card when the log cannot be read', async ({ page }) => {
  await page.route('**/api/build-log', (route) => route.fulfill({ json: { months: [] } }))
  await page.goto('/')
  const card = page.locator('[data-build-log]')
  await card.scrollIntoViewIfNeeded()
  await expect(card).toHaveAttribute('data-build-log', 'fallback')
  await expect(card).toContainText("What I'm shipping")
  await expect(card.getByRole('link', { name: /^Build log/ })).toHaveAttribute('href', 'https://n8builds.dev/builds')
})

test('from 1280px, the resume, contact and build log cards are one row of three equal columns', async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, 'A desktop layout.')
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')
  await page.locator('[data-build-log]').scrollIntoViewIfNeeded()
  const box = async (text: string | RegExp) =>
    (await page.locator('#about .grid > div', { hasText: text }).last().boundingBox())!
  // The cards slide in one after another, so measure again until they have landed.
  await expect(async () => {
    const [resume, contact, log] = [
      await box('Check out my resume!'),
      await box("Have a project? Let's connect!"),
      await box('changes shipped'),
    ]
    for (const b of [contact, log]) {
      expect(Math.abs(b.y - resume.y)).toBeLessThan(2)
      expect(Math.abs(b.width - resume.width)).toBeLessThan(2)
      expect(Math.abs(b.height - resume.height)).toBeLessThan(2)
    }
    expect(resume.x).toBeLessThan(contact.x)
    expect(contact.x).toBeLessThan(log.x)
  }).toPass({ timeout: 10_000 })
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
test('Experience links Tech for Pros and the live client sites only, and Appturnity is a past role', async ({
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

  // Exactly these: the company's site, and the client sites still live (round 5 of
  // 2026-11-09: clients whose sites are gone are described, never linked).
  const hrefs = await experience.locator('a[href]').evaluateAll((links) =>
    links.map((a) => (a as HTMLAnchorElement).href).sort()
  )
  expect(hrefs).toEqual([
    'https://comfort1hvac.com/',
    'https://riverwoodranch.web.app/',
    'https://techforpros.com/',
    'https://www.arroyosecogc.com/',
  ])
  await expect(experience).toContainText('a clinical lab, a streaming service')

  const about = page.locator('#about')
  await expect(about).toContainText('three years building client apps at a consulting firm')
  await expect(about.getByRole('link', { name: 'Tech for Pros' })).toHaveAttribute(
    'href',
    'https://techforpros.com'
  )
})

test('every role shows its basics; only the roles with more to say expand', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  const experience = page.locator('#experience')
  await experience.getByRole('button', { name: 'Expand all' }).scrollIntoViewIfNeeded()
  const role = (name: string) => experience.locator('div.group\\/exp', { hasText: name })
  // The basics show with no click, for every role.
  await expect(role('Tech for Pros').getByText(/Building Tech for Pros, a SaaS/)).toBeVisible()
  await expect(role('Realtek Solutions').getByText(/Launched 5\+ small-business websites/)).toBeVisible()
  await expect(role('The Coder School').getByText(/Teach JavaScript, Python/)).toBeVisible()
  // Three roles expand; Realtek and The Coder School don't, and the school's site isn't linked.
  for (const name of ['Tech for Pros', 'Appturnity', 'Donovan Golf']) {
    await expect(role(name).locator('[data-role-toggle]'), name).toHaveCount(1)
  }
  for (const name of ['Realtek Solutions', 'The Coder School']) {
    await expect(role(name).locator('[data-role-toggle]'), name).toHaveCount(0)
    await expect(role(name).getByText('More', { exact: true }), name).toHaveCount(0)
  }
  await expect(page.locator('a[href*="thecoderschool"]')).toHaveCount(0)
})

test('"Expand all" opens the roles with more in place, and closes them again', async ({ page }) => {
  await page.goto('/')
  const experience = page.locator('#experience')
  const toggles = experience.locator('[data-role-toggle]')
  await experience.getByRole('button', { name: 'Expand all' }).scrollIntoViewIfNeeded()
  await expect(toggles).toHaveCount(3)
  const more = experience.getByText(/Architecting a shared delivery layer/)
  await expect(more).toBeHidden()
  await experience.getByRole('button', { name: 'Expand all' }).click()
  for (let i = 0; i < 3; i++) await expect(toggles.nth(i)).toHaveAttribute('aria-expanded', 'true')
  await expect(more).toBeVisible()
  // The sites built there come with it, as preview cards that link to them.
  const site = experience.getByRole('link', { name: /riverwoodranch\.web\.app/ })
  await expect(site).toBeVisible()
  await expect(site).toHaveAttribute('href', 'https://riverwoodranch.web.app/')
  await experience.getByRole('button', { name: 'Collapse all' }).click()
  for (let i = 0; i < 3; i++) await expect(toggles.nth(i)).toHaveAttribute('aria-expanded', 'false')
})

test('a whole role row opens on a click or from the keyboard, and its link still works', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  const experience = page.locator('#experience')
  const role = experience.locator('div.group\\/exp', { hasText: 'Web Developer' })
  await role.scrollIntoViewIfNeeded()
  // Its basics show; the rest opens with the row.
  await expect(role.getByText(/Built course and event sites/)).toBeVisible()
  const bullet = role.getByText(/Integrated Cloudinary media/)
  await expect(bullet).toBeHidden()
  // Anywhere on the row: here, where the role's title is (the row's button lies over it).
  const title = (await role.getByRole('heading', { name: 'Web Developer' }).boundingBox())!
  await page.mouse.click(title.x + title.width / 2, title.y + title.height / 2)
  await expect(bullet).toBeVisible()
  // The keyboard: the row's button takes focus and Enter closes it again.
  const toggle = role.locator('[data-role-toggle]')
  await toggle.focus()
  await page.keyboard.press('Enter')
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  await expect(bullet).toBeHidden()
  // Tech for Pros' link sits above the row's button, so it opens the site.
  const tfp = experience.getByRole('link', { name: /^Tech for Pros/ })
  await tfp.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }))
  await expect(tfp).toBeInViewport()
  const hit = await tfp.evaluate((a) => {
    const r = a.getBoundingClientRect()
    return document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)?.closest('a') === a
  })
  expect(hit).toBe(true)
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

/** The top right corner has the resume only (owner, 2026-11-08: "Message me" removed). */
test('the top corner offers the resume and no Message me', async ({ page, isMobile }) => {
  test.skip(isMobile, 'The corner buttons show from 640px up; on a phone the hero carries the resume.')
  await page.goto('/')
  await expect(page.getByRole('link', { name: /^Message me/ })).toHaveCount(0)
  await expect(page.getByRole('link', { name: /^Resume/ }).first()).toBeVisible()
})

test("hovering a role shows its own picture, which stays, quieter, while it's open", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, 'The picture is a desktop hover; phones show the basics and the site cards.')
  await page.goto('/')
  const role = page.locator('#experience div.group\\/exp', { hasText: 'Web Developer' })
  await role.scrollIntoViewIfNeeded()
  const picture = role.locator('[data-role-image]')
  const opacity = () => picture.evaluate((el) => Number(getComputedStyle(el).opacity))
  expect(await opacity()).toBe(0)
  const title = (await role.getByRole('heading', { name: 'Web Developer' }).boundingBox())!
  await page.mouse.move(title.x + 20, title.y + 10)
  await expect.poll(opacity).toBeGreaterThan(0.5)
  await page.mouse.click(title.x + 20, title.y + 10)
  // Open, it stays (round 4 of 2026-11-09), even once the pointer leaves.
  await page.mouse.move(5, 5)
  await expect.poll(opacity).toBeCloseTo(0.5, 1)
  // Each role keeps its own: Appturnity's is Appturnity's home page.
  await expect(
    page.locator('#experience div.group\\/exp', { hasText: 'Appturnity' }).locator('[data-role-image] img')
  ).toHaveAttribute('src', /appturnity/)
})

test('/projects and the project pages lead back to the home page', async ({ page }) => {
  for (const path of ['/projects', '/projects/net-trailer']) {
    await page.goto(path)
    const back = page.getByRole('link', { name: 'Back to home' })
    await expect(back, path).toHaveAttribute('href', '/')
    await expect(page.getByRole('link', { name: 'Back to projects' }), path).toHaveCount(0)
  }
})

/**
 * The top bar's fade lets clicks through: a link scrolled under it (the top
 * ~112px of the screen) still works (before 2026-11-08 the fade swallowed them).
 */
test("a link under the top bar's fade still takes the click", async ({ page }) => {
  await page.goto('/')
  const fade = page.locator('div.fixed.top-0.w-full').first()
  expect(await fade.evaluate((el) => getComputedStyle(el).pointerEvents)).toBe('none')
})
