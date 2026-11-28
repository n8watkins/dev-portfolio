import { test, expect, type Page } from './fixtures/test'

/**
 * The project rows: Portfolio Rank, NetTrailers, then Wren (owner, 2026-11-24);
 * Wren is a full project card like the others (round 5 of 2026-11-09). Echo, Scout and
 * GeminiGPT were retired on 2026-11-08; nothing links to them or their demos,
 * and their old pages redirect to Wren's.
 */

async function projectsInView(page: Page) {
  await page.goto('/')
  await page.getByText('AI-Powered Netflix Clone').first().scrollIntoViewIfNeeded()
}

const card = (page: Page, title: string) => page.getByRole('article', { name: title, exact: true })

test('the projects open with Portfolio Rank, then NetTrailers and Wren', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  const titles = page.locator('#projects article h3')
  await expect(titles).toHaveText(['Portfolio Rank', 'NetTrailers', 'Wren'])
  const wren = card(page, 'Wren')
  // The same card as the others: its clip, a summary, what's interesting, Live demo and Full story.
  await expect(wren.locator('video, img[alt*="Wren as a guest"]').first()).toBeAttached()
  await expect(wren).toContainText("What's interesting:")
  await expect(wren.getByRole('link', { name: 'Try the Wren live demo (new tab)' })).toHaveAttribute(
    'href',
    'https://wren.n8builds.dev'
  )
  await expect(wren.getByRole('link', { name: 'Read the full story of Wren' })).toHaveAttribute(
    'href',
    '/projects/wren'
  )
  // Its icon is the animated bird, not a picture.
  await expect(wren.locator('svg.wren')).toHaveCount(1)
})

test("Wren's page has its screenshots, features, stack and source", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/projects/wren')
  await expect(page.getByRole('heading', { level: 1, name: 'Wren' })).toBeVisible()
  await expect(page.getByRole('list', { name: 'What Wren does' }).getByRole('listitem')).toHaveCount(4)
  await expect(page.getByRole('link', { name: /source/i }).first()).toHaveAttribute(
    'href',
    'https://github.com/n8watkins/wren'
  )
  await expect(page.locator('img[src*="projects%2Fwren"], img[src*="/projects/wren/"]').first()).toBeAttached()
})

test('nothing links to the retired apps or their demos', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y)
      await new Promise((r) => setTimeout(r, 60))
    }
  })
  const hrefs = await page.locator('a[href]').evaluateAll((links) =>
    links.map((a) => (a as HTMLAnchorElement).href)
  )
  for (const href of hrefs) {
    expect(href).not.toMatch(/onrender\.com|echo-genai|scout-agentic|GeminiGPT|\/projects\/(echo|scout|geminigpt)\b/i)
  }
  // No monitored demo is on the page now, so no status pill and no weekday note.
  await expect(page.getByRole('link', { name: /^Live demo:/ })).toHaveCount(0)
  await expect(page.getByText(/Live demos run/)).toHaveCount(0)
})

test("old links to the retired project pages land on Wren's, which replaced them", async ({ request }) => {
  for (const slug of ['echo', 'scout', 'geminigpt']) {
    const res = await request.get(`/projects/${slug}`, { maxRedirects: 0 })
    expect(res.status(), slug).toBe(308)
    expect(res.headers().location, slug).toMatch(/\/projects\/wren$/)
  }
  // And the retired pages are nowhere in the sitemap.
  const sitemap = await (await request.get('/sitemap.xml')).text()
  expect(sitemap).not.toMatch(/projects\/(echo|scout|geminigpt)\b/)
  expect(sitemap).toContain('/projects/wren<')
})

test('the status API answers with names, states and uptime only', async ({ request }) => {
  const body = await (await request.get('/api/status')).json()
  expect(body.services['Demo Up']).toEqual({ state: 'operational', uptime90d: 92.914 })
  expect(JSON.stringify(body)).not.toMatch(/https?:\/\//)
})

test('a project page shows its screenshot whole, not cropped to a strip', async ({ page }) => {
  for (const width of [375, 1280]) {
    await page.setViewportSize({ width, height: 900 })
    for (const slug of ['net-trailers', 'portfolio-rank']) {
      await page.goto(`/projects/${slug}`)
      const image = page.locator('main [data-gallery] img').first()
      await expect(image).toBeVisible()
      await expect
        .poll(() => image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0))
        .toBe(true)
      const { box, natural } = await image.evaluate((img: HTMLImageElement) => {
        const frame = img.parentElement!.getBoundingClientRect()
        return { box: frame.width / frame.height, natural: img.naturalWidth / img.naturalHeight }
      })
      // object-cover crops whatever the frame's shape doesn't share with the image.
      expect(Math.abs(box - natural) / natural, `${slug} at ${width}px`).toBeLessThan(0.25)
    }
  }
})

test('a project card opens its page and its live demo', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await projectsInView(page)
  const net = card(page, 'NetTrailers')
  await expect(
    net.getByRole('link', { name: 'Try the NetTrailers live demo (new tab)' })
  ).toHaveAttribute('href', 'https://net-trailers.n8builds.dev')
  // The card stays big and simple: the source, tech and features are on /projects and its page.
  await expect(net.getByRole('list', { name: 'What NetTrailers does' })).toHaveCount(0)
  await net.getByRole('link', { name: 'Read the full story of NetTrailers' }).click()
  await expect(page).toHaveURL(/\/projects\/net-trailers$/, { timeout: 30000 })
  await expect(
    page.getByRole('list', { name: 'What NetTrailers does' }).getByRole('listitem')
  ).not.toHaveCount(0)
})

type FadeSample = { opacity: number; transforms: string[]; inRow: number }
type FadeLog = { samples: FadeSample[]; done: boolean }

/**
 * The control beside a heading must hold still while it fades in: a pointer that
 * goes down on a link that then moves comes up on something else, and the click
 * is lost (Firefox on CI, 3 of 40 runs under load, 2026-11-25).
 *
 * What is measured is the control against its own row, and its transform, every
 * frame from before the reveal starts until it is fully shown. Its place in the
 * viewport is not: a scroll still settling or a card above it loading moves that
 * by a pixel or three (WebKit on CI) with the control itself standing still.
 */
for (const [section, name, role] of [
  ['#projects', 'Detailed view', 'link'],
  ['#experience', 'Expand all', 'button'],
] as const) {
  test(`"${name}" fades in without moving`, async ({ page }) => {
    test.setTimeout(90000)
    await page.goto('/')
    await page.evaluate(() => document.fonts.ready)
    const control = page.locator(section).getByRole(role, { name })
    await control.waitFor({ state: 'attached' })
    // Sample every frame from here, while the control is still hidden below the fold.
    await control.evaluate((el) => {
      const reveal = el.closest('[data-reveal]') as HTMLElement
      const row = reveal.parentElement as HTMLElement
      const log: FadeLog = { samples: [], done: false }
      ;(window as unknown as { __fade: FadeLog }).__fade = log
      const frame = () => {
        const opacity = Number(getComputedStyle(reveal).opacity)
        log.samples.push({
          opacity,
          transforms: [getComputedStyle(reveal).transform, getComputedStyle(el).transform],
          inRow: el.getBoundingClientRect().top - row.getBoundingClientRect().top,
        })
        if (opacity === 1 && log.samples.some((s) => s.opacity < 1)) log.done = true
        else requestAnimationFrame(frame)
      }
      requestAnimationFrame(frame)
    })
    await control.scrollIntoViewIfNeeded()
    await expect
      .poll(() => page.evaluate(() => (window as unknown as { __fade: FadeLog }).__fade.done), {
        timeout: 30000,
      })
      .toBe(true)
    const { samples } = await page.evaluate(() => (window as unknown as { __fade: FadeLog }).__fade)
    // The fade was seen from its start: hidden first, then fully shown.
    expect(samples[0].opacity, 'hidden before the reveal').toBeLessThan(1)
    // Never lifted, scaled or shifted by a transform.
    expect(samples.flatMap((s) => s.transforms).filter((t) => t !== 'none')).toEqual([])
    // And it stays where it is in its own row.
    const offsets = samples.map((s) => s.inRow)
    expect(
      Math.max(...offsets) - Math.min(...offsets),
      `offsets in its row: ${offsets.join(', ')}`
    ).toBeLessThan(0.5)
  })
}

test('"Detailed view" opens /projects, with every project at full size', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await page.locator('#projects').getByRole('link', { name: 'Detailed view' }).click()
  await expect(page).toHaveURL(/\/projects$/)
  await expect(page.getByRole('heading', { level: 1, name: 'Projects, in detail' })).toBeVisible()
  for (const title of ['Portfolio Rank', 'NetTrailers', 'Wren']) {
    const full = card(page, title)
    await expect(full.getByRole('link', { name: `View ${title} source on GitHub (new tab)` })).toHaveAttribute(
      'href',
      /github\.com\/n8watkins\//
    )
    await expect(full.getByRole('list', { name: `What ${title} does` }).getByRole('listitem')).not.toHaveCount(0)
    await expect(full.getByRole('link', { name: `Read the full story of ${title}` })).toHaveAttribute(
      'href',
      new RegExp(`/projects/`)
    )
  }
})

/**
 * Portfolio Rank moved here from n8builds.dev's featured rows (owner,
 * 2026-11-08): last of the projects, crediting Emma Bostian's list and
 * inviting visitors to vote and add their own portfolio.
 */
test('Portfolio Rank credits its list and invites you to add your portfolio', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  const rank = card(page, 'Portfolio Rank')
  await expect(
    rank.getByRole('link', { name: /Emma Bostian's developer-portfolios/ })
  ).toHaveAttribute('href', 'https://github.com/emmabostian/developer-portfolios')
  await expect(
    rank.getByRole('link', { name: 'Try the Portfolio Rank live demo (new tab)' })
  ).toHaveAttribute('href', 'https://portfoliorank.dev')

  await page.goto('/projects/portfolio-rank')
  await expect(page.getByRole('heading', { name: 'Credits' })).toBeVisible()
  await expect(page.getByRole('link', { name: /Add yours on Portfolio Rank/ })).toHaveAttribute(
    'href',
    'https://portfoliorank.dev/'
  )
})

/**
 * A project page's footer: my two sites with their marks under "My sites",
 * then "Built in public at n8builds.dev" (owner, 2026-11-01).
 */
test("a project page's footer links my sites with their marks", async ({ page }) => {
  await page.goto('/projects/net-trailers')
  const sites = page.getByRole('navigation', { name: 'Site map' })
  await sites.scrollIntoViewIfNeeded()
  await expect(sites.getByRole('link', { name: 'n8builds.dev' })).toHaveAttribute(
    'href',
    'https://n8builds.dev'
  )
  await expect(sites.getByRole('link', { name: 'techforpros.com' })).toHaveAttribute(
    'href',
    'https://techforpros.com'
  )
  await expect(sites.locator('img[src*="n8-icon"]')).toHaveCount(1)
  await expect(sites.locator('img[src*="techforpros-icon"]')).toHaveCount(1)
  await expect(
    page.locator('footer').getByRole('link', { name: /Built in public at n8builds\.dev/ })
  ).toBeVisible()
})

/**
 * The pixel marks (owner, 2026-11-24 and 25): on wide screens (Tailwind's xl,
 * 80rem) each card takes 60% of the row, on alternating sides, and its
 * project's mark (Portfolio Rank's podium, NetTrailers' play button, Wren's
 * bird) is drawn from the section's grid squares beside it. Hovering a mark
 * plays its easter egg; clicking the open grid around the bird drops a seed it
 * eats. The marks are decorative, never cover a card, keep still under
 * reduced motion and do nothing while off screen.
 *
 * Every check waits for a settled state (a mark's `data-in`, a card that has
 * stopped moving) before it measures or clicks: the reveal animations move
 * their targets, and clicking a moving target is what made two tests flaky.
 */
const WIDE = { width: 1440, height: 900 }
const KINDS = ['rank', 'play', 'wren'] as const
type Kind = (typeof KINDS)[number]
const markOf = (page: Page, kind: Kind) => page.locator(`[data-mark="${kind}"]`)
/** Lit squares in a mark, its seeds, notes and crown included. */
const litIn = (page: Page, kind: Kind) => markOf(page, kind).locator('i[data-lit]').count()
const seedsIn = (page: Page) => markOf(page, 'wren').locator('[data-k="S"]').count()

/** Opens the home page wide, centres a mark on screen and waits until it has flipped in. */
async function showMark(page: Page, kind: Kind) {
  await page.setViewportSize(WIDE)
  await page.goto('/')
  const mark = markOf(page, kind)
  await mark.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }))
  await expect(mark).toHaveAttribute('data-in', '', { timeout: 15000 })
  return mark
}

/**
 * Waits until every mark has been snapped onto the grid beside its card
 * (`data-ready`; until then it is hidden at the row's corner), when the
 * window is wide enough for marks at all.
 */
async function placed(page: Page) {
  if (await page.evaluate(() => matchMedia('(min-width: 80rem)').matches))
    await expect(page.locator('[data-mark][data-ready]')).toHaveCount(KINDS.length)
}

/** Waits until an element's box has stopped moving (its reveal is over). */
async function settled(page: Page, selector: string) {
  let last = ''
  await expect
    .poll(async () => {
      const box = JSON.stringify(await page.locator(selector).first().boundingBox())
      const same = box === last
      last = box
      return same
    }, { intervals: [250], timeout: 15000 })
    .toBe(true)
}

/**
 * How many changes the marks and the grid's lit cells make over `ms` (the rest
 * of the section, the build teaser's carousel and the clips, has its own life).
 */
function changesIn(page: Page, ms: number) {
  return page.evaluate(
    (ms) =>
      new Promise<number>((done) => {
        let n = 0
        const watch = new MutationObserver((records) => (n += records.length))
        for (const el of document.querySelectorAll('[data-mark], [data-marks-grid]'))
          watch.observe(el, { subtree: true, childList: true, attributes: true })
        setTimeout(() => (watch.disconnect(), done(n)), ms)
      }),
    ms
  )
}

/** A point in the bird's yard, outside the bird's own box, `row` cells below the yard's top. */
async function yardPoint(page: Page, row = 0) {
  return markOf(page, 'wren').evaluate((el, row) => {
    const yard = el.querySelector('[data-yard]')!.getBoundingClientRect()
    const bird = el.getBoundingClientRect()
    const x = yard.right - 26 > bird.right ? yard.right - 26 : yard.left + 26
    return { x, y: yard.top + 26 + row * 52, step: x > bird.right ? -52 : 52 }
  }, row)
}

test('below the wide layout the cards are full width and no mark is drawn', async ({ page, isMobile }) => {
  if (!isMobile) await page.setViewportSize({ width: 1279, height: 900 })
  await page.goto('/')
  for (const kind of KINDS) {
    await expect(markOf(page, kind)).toBeAttached()
    expect(await markOf(page, kind).evaluate((el) => getComputedStyle(el).display), kind).toBe('none')
  }
  const shares = await page.locator('[data-mark]').evaluateAll((marks) =>
    marks.map((m) => {
      const row = m.parentElement!.getBoundingClientRect()
      return m.parentElement!.firstElementChild!.getBoundingClientRect().width / row.width
    })
  )
  for (const share of shares) expect(share).toBeCloseTo(1, 2)
})

test.describe('pixel marks', () => {
  test.skip(({ isMobile }) => isMobile, 'The marks are drawn on wide screens only.')
  test.describe.configure({ timeout: 60000 })

  test('the cards alternate sides beside their marks, Portfolio Rank, NetTrailers, Wren', async ({
    page,
  }) => {
    await page.setViewportSize(WIDE)
    await page.goto('/')
    await placed(page)
    await expect(page.locator('#projects article h3')).toHaveText(['Portfolio Rank', 'NetTrailers', 'Wren'])
    const rows = await page.locator('[data-mark]').evaluateAll((marks) =>
      marks.map((m) => {
        const row = m.parentElement!.getBoundingClientRect()
        const card = m.parentElement!.firstElementChild!.getBoundingClientRect()
        return {
          kind: (m as HTMLElement).dataset.mark,
          share: card.width / row.width,
          cardLeft: Math.round(card.left - row.left),
          cardRight: Math.round(row.right - card.right),
          markRightOfCard: m.getBoundingClientRect().left >= card.right,
        }
      })
    )
    expect(rows.map((r) => r.kind)).toEqual(['rank', 'play', 'wren'])
    rows.forEach((row, i) => {
      expect(row.share, row.kind).toBeCloseTo(0.6, 2)
      // Left, right, left; the mark always on the open side.
      expect(i % 2 === 0 ? row.cardLeft : row.cardRight, row.kind).toBe(0)
      expect(row.markRightOfCard, row.kind).toBe(i % 2 === 0)
    })
  })

  test('each mark is drawn at the wide layout, hidden from screen readers, with nothing focusable', async ({
    page,
  }) => {
    for (const width of [1280, 1920]) {
      await page.setViewportSize({ width, height: 900 })
      await page.goto('/')
      // At 1280 exactly a browser with a classic scrollbar (WebKit on Linux)
      // is just under 80rem: there, like the cards, the marks follow the
      // breakpoint, not the window.
      const wide = await page.evaluate(() => matchMedia('(min-width: 80rem)').matches)
      if (width === 1920) expect(wide).toBe(true)
      for (const kind of KINDS) {
        const mark = markOf(page, kind)
        expect(await mark.evaluate((el) => getComputedStyle(el).display), `${kind} at ${width}`).toBe(
          wide ? 'block' : 'none'
        )
        await expect(mark).toHaveAttribute('aria-hidden', 'true')
        await expect(mark.locator('a, button, input, select, textarea, [tabindex]')).toHaveCount(0)
      }
    }
  })

  test('a mark flips in when its card comes into view and out when it leaves', async ({ page }) => {
    const mark = await showMark(page, 'play')
    expect(await litIn(page, 'play')).toBeGreaterThan(0)
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }))
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
    // The flip out waits for the browser's intersection callback, which a
    // busy machine can hold back for a few seconds.
    await expect.poll(() => litIn(page, 'play'), { timeout: 15000 }).toBe(0)
    await expect(mark).not.toHaveAttribute('data-in')
    await mark.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }))
    await expect(mark).toHaveAttribute('data-in', '', { timeout: 15000 })
    expect(await litIn(page, 'play')).toBeGreaterThan(0)
  })

  const EGGS: [Kind, string, string][] = [
    ['rank', 'the podium races and the winner is crowned', '[data-k="K"]'],
    ['play', 'the play button plays an equaliser', '[data-k="P"][data-lit]'],
    ['wren', 'the bird sings', '[data-k="N"]'],
  ]
  for (const [kind, what, sign] of EGGS) {
    test(`hovering the ${kind} mark plays its easter egg: ${what}`, async ({ page }) => {
      const mark = await showMark(page, kind)
      await expect(mark.locator(sign)).toHaveCount(0)
      await mark.locator('[data-core]').hover()
      // An idle action may be playing; the egg follows it.
      await expect(mark.locator(sign).first()).toBeAttached({ timeout: 15000 })
    })
  }

  test('clicking beside the bird drops a seed, and the bird eats it', async ({ page }) => {
    await showMark(page, 'wren')
    // Start from an empty yard (the bird finds a seed by itself now and then).
    await expect.poll(() => seedsIn(page), { timeout: 20000 }).toBe(0)
    const { x, y } = await yardPoint(page)
    await page.mouse.click(x, y)
    expect(await seedsIn(page)).toBeGreaterThanOrEqual(1)
    await expect.poll(() => seedsIn(page), { timeout: 20000 }).toBe(0)
  })

  test('at most four seeds wait for the bird at once', async ({ page }) => {
    await showMark(page, 'wren')
    await expect.poll(() => seedsIn(page), { timeout: 20000 }).toBe(0)
    const { x, y, step } = await yardPoint(page)
    // The bird eats a landed seed on its own clock (a busy machine stretches
    // that clock, and the bird also finds seeds by itself), so clicking one
    // seed at a time can see fewer than four wait. All six clicks therefore
    // go in one task, before any seed has landed, and only when the yard is
    // empty at that moment.
    let after: number[] | null = null
    await expect
      .poll(
        async () => {
          after = await markOf(page, 'wren').evaluate(
            (el, { x, y, step }) => {
              const seeds = () => el.querySelectorAll('[data-k="S"]').length
              if (seeds() !== 0) return null
              const yard = el.querySelector('[data-yard]')!
              return Array.from({ length: 6 }, (_, n) => {
                yard.dispatchEvent(
                  new MouseEvent('click', { bubbles: true, clientX: x + n * step, clientY: y })
                )
                return seeds()
              })
            },
            { x, y, step }
          )
          return after !== null
        },
        { timeout: 20000 }
      )
      .toBe(true)
    // Each of the first four clicks adds a seed; the fifth and sixth are refused.
    expect(after).toEqual([1, 2, 3, 4, 4, 4])
    await expect.poll(() => seedsIn(page), { timeout: 30000 }).toBe(0)
  })

  test('the marks never cover a card, and the cards still open', async ({ page }) => {
    for (const width of [1280, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 })
      await page.goto('/')
      await placed(page)
      const overlaps = await page.locator('[data-mark]').evaluateAll((marks) =>
        marks.flatMap((m) => {
          const card = m.parentElement!.firstElementChild!.getBoundingClientRect()
          return [...m.querySelectorAll('[data-core], [data-yard]')]
            .map((z) => z.getBoundingClientRect())
            .filter((z) => z.width > 0)
            .filter((z) => z.left < card.right && z.right > card.left && z.top < card.bottom && z.bottom > card.top)
            .map(() => (m as HTMLElement).dataset.mark)
        })
      )
      expect(overlaps, `at ${width}`).toEqual([])
    }
    await showMark(page, 'wren')
    const story = card(page, 'Wren').getByRole('link', { name: 'Read the full story of Wren' })
    await settled(page, 'article[aria-label="Wren"]')
    await story.click()
    await expect(page).toHaveURL(/\/projects\/wren$/, { timeout: 30000 })
  })

  test('under reduced motion the marks keep still and drop no seeds', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.setViewportSize(WIDE)
    await page.goto('/')
    const bird = markOf(page, 'wren')
    await bird.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }))
    await expect(bird).toHaveAttribute('data-still', '')
    await expect(bird.locator('[data-core]')).toBeHidden()
    await expect(bird.locator('[data-yard]')).toBeHidden()
    const before = await litIn(page, 'wren')
    expect(before).toBeGreaterThan(0)
    // Click where the yard would be, beside the bird.
    const box = (await bird.boundingBox())!
    await page.mouse.click(box.x + box.width + 26, box.y - 26)
    // Once the grid has placed its still set, nothing changes for a few seconds.
    await page.waitForTimeout(1000)
    expect(await changesIn(page, 3000)).toBe(0)
    expect(await seedsIn(page)).toBe(0)
    expect(await litIn(page, 'wren')).toBe(before)
  })

  test('nothing in the section runs while it is off screen', async ({ page }) => {
    await showMark(page, 'wren')
    await page.evaluate(() =>
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' })
    )
    for (const kind of KINDS) await expect.poll(() => litIn(page, kind), { timeout: 15000 }).toBe(0)
    // Let the last flips and the grid's fades finish, then watch.
    await page.waitForTimeout(2500)
    expect(await changesIn(page, 4000)).toBe(0)
  })

  test.describe('on a touch screen', () => {
    test.use({ hasTouch: true })

    test('a tap on a mark plays it once, and a tap beside the bird drops a seed', async ({ page }) => {
      const podium = await showMark(page, 'rank')
      const box = (await podium.boundingBox())!
      await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2)
      const crown = podium.locator('[data-k="K"]')
      await expect(crown).toBeAttached({ timeout: 15000 })
      await expect(crown).toHaveCount(0, { timeout: 15000 })
      // Nothing is left hovered: no second race starts by itself.
      await page.waitForTimeout(4500)
      await expect(crown).toHaveCount(0)

      await markOf(page, 'wren').evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }))
      await expect(markOf(page, 'wren')).toHaveAttribute('data-in', '', { timeout: 15000 })
      await expect.poll(() => seedsIn(page), { timeout: 20000 }).toBe(0)
      const { x, y } = await yardPoint(page)
      await page.touchscreen.tap(x, y)
      expect(await seedsIn(page)).toBeGreaterThanOrEqual(1)
      await expect.poll(() => seedsIn(page), { timeout: 20000 }).toBe(0)
    })
  })
})
