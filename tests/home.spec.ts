import { test, expect } from './fixtures/test'

/**
 * Every page's footer carries the hero's two cards, n8builds.dev (where I
 * build in public) and Tech for Pros (where I work), above the site map
 * (owner, 2026-11-08; the big workshop pitches are gone).
 */
test("every page's footer has my two sites' cards and the site map", async ({ page }) => {
  for (const path of ['/', '/projects', '/stack', '/about', '/projects/net-trailers']) {
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
    await teaser.getByRole('button', { name: 'Show Pivot' }).click()
    await expect(teaser.getByText(/^Pivot, \d+ of \d+$/)).toBeVisible({ timeout: 1000 })
  }).toPass()
  await expect(teaser.getByRole('link', { name: /^Join the waitlist for Pivot/ })).toHaveAttribute(
    'href',
    'https://n8builds.dev/upcoming?interest=pivot#waitlist'
  )
  await expect(teaser.getByRole('link', { name: /^Its landing page/ })).toHaveAttribute(
    'href',
    'https://pivot.n8builds.dev/welcome'
  )
  await expect(teaser.getByRole('link', { name: /See the build: Pivot/ })).toHaveCount(0)
  // Seven in all, a dot each, as the hero's n8builds.dev card says ("7 builds"): KeysReady left the
  // teaser on 2026-11-11 (owner: it is not teased for now).
  await expect(teaser.getByRole('button', { name: /^Show / })).toHaveCount(7)
  await expect(teaser.getByText(/^Pivot, 7 of 7$/)).toBeVisible()
  await expect(teaser.getByRole('button', { name: 'Show KeysReady' })).toHaveCount(0)
  await expect(teaser).not.toContainText('KeysReady')
  await expect(page.locator('a[href*="keysready"], img[src*="keysready"]')).toHaveCount(0)
  await expect(page.getByRole('link', { name: /7 builds · all open source/ }).first()).toBeVisible()
})

/**
 * The bento's build log card (rounds 4 and 5 of 2026-11-09, reworked
 * 2026-11-25): a month of n8builds.dev's build log, from its JSON (here the
 * fixture: November 2026 has 6, 3, 0, 13, 18, 0, 0, 9, 0 changes on its first
 * nine days and the rest still to come). Month arrows top left, a readout, a
 * chart of block stacks whose days light up, and two plain text links along
 * the bottom: n8builds.dev and the build log.
 */
/**
 * How long the card may take to load its months. Under load WebKit can take
 * 8 to 12 s from navigation to a loaded card (2026-11-25, twelve test workers
 * on a busy machine: the page drew 4 to 6 frames in its first 8 s), well past
 * the 5 s an expect waits by default.
 */
const LOADED = { timeout: 20_000 }

test('the build log card shows a month, cycles the months, and links the site and the log', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  const card = page.locator('[data-build-log]')
  await card.scrollIntoViewIfNeeded()
  await expect(card).toHaveAttribute('data-build-log', 'ready', LOADED)
  await expect(card.locator('[data-month]')).toHaveText('November 2026')
  await expect(card.locator('[data-changes]')).toHaveText('49')
  // A slot per day; the nine days so far are buttons named with their date and count.
  await expect(card.locator('[data-chart] > *')).toHaveCount(30)
  await expect(card.locator('[data-chart] button')).toHaveCount(9)
  await expect(card.getByRole('button', { name: 'Thursday, November 5: 18 changes, the busiest day' })).toBeVisible()
  await expect(card.locator('[data-readout]')).toContainText('Peak Nov 5 · 18')
  await expect(card.locator('[data-readout]')).toContainText('5 days active')
  await card.getByRole('button', { name: 'Older month' }).click()
  await expect(card.locator('[data-month]')).toHaveText('October 2026')
  await expect(card.locator('[data-changes]')).toHaveText('275')
  // Round and round: newer from the newest is the oldest.
  await card.getByRole('button', { name: 'Newer month' }).click()
  await card.getByRole('button', { name: 'Newer month' }).click()
  await expect(card.locator('[data-month]')).toHaveText('September 2026')
  // Two plain text links, and the card itself is not one.
  const links = card.getByRole('link')
  await expect(links).toHaveCount(2)
  const site = card.getByRole('link', { name: /^n8builds\.dev/ })
  const log = card.getByRole('link', { name: /^Build log/ })
  await expect(site).toHaveAttribute('href', 'https://n8builds.dev')
  await expect(log).toHaveAttribute('href', 'https://n8builds.dev/builds')
  for (const link of [site, log]) await expect(link).toHaveAttribute('target', '_blank')
  // n8builds.dev's square monogram beside its name, inside the link and decorative (owner,
  // 2026-11-25): its name says it already. The build log link has none.
  const icon = site.locator('img')
  await expect(icon).toHaveCount(1)
  await expect(icon).toHaveAttribute('alt', '')
  await expect(icon).toHaveAttribute('src', /\/brand\/n8-monogram\.webp/)
  await expect(icon).toBeVisible()
  await expect(site).toHaveAccessibleName(/^n8builds\.dev/)
  await expect(log.locator('img')).toHaveCount(0)
  // About the text's height, on its line.
  const [iconBox, label] = [await icon.boundingBox(), await site.getByText('n8builds.dev').boundingBox()]
  expect(iconBox!.height).toBeGreaterThan(12)
  expect(iconBox!.height).toBeLessThan(18)
  expect(Math.abs(iconBox!.y + iconBox!.height / 2 - (label!.y + label!.height / 2))).toBeLessThan(3)
  await expect(card.getByText('I post everything here')).toBeVisible()
  // Side by side on one line, along the bottom of the card.
  const [a, b, box] = [await site.boundingBox(), await log.boundingBox(), await card.boundingBox()]
  expect(Math.abs(a!.y + a!.height - (b!.y + b!.height))).toBeLessThan(2)
  expect(a!.x).toBeLessThan(b!.x)
  expect(box!.y + box!.height - (b!.y + b!.height)).toBeLessThan(40)
})

/**
 * Brings the build log card on screen and waits until its months are loaded
 * and its bento cell has finished arriving (it rises 25px and scales up from
 * 95%). A pointer aimed at a day before then lands beside it: on CI a tap at
 * the fifth day's centre, measured mid-entrance, picked the sixth (2026-11-25).
 * And until the card itself is settled: its bars risen, no month on its way in.
 *
 * Then, unless `hold` is false, it holds the card on `hold`'s month: the
 * pointer rests on the month's name (a hovered card never moves on), and the
 * arrows bring the month back if the card had already moved on by itself. The
 * hover test failed on CI (2026-11-25, #107) with the day it had just hovered
 * "not found": the only thing that takes a day's button away is a new month,
 * and on a slow page the 5 s before the card moves on can pass before a test
 * aims, or a tick can land between the hover and React drawing it (the card
 * now checks the pointer itself before moving on).
 */
async function showBuildLog(
  page: import('@playwright/test').Page,
  { hold = 'November 2026' as string | false } = {}
) {
  const card = page.locator('[data-build-log]')
  await card.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }))
  await expect(card).toHaveAttribute('data-build-log', 'ready', LOADED)
  await expect(card).toHaveAttribute('data-settled', '', LOADED)
  if (hold) {
    // From off the card: on a reloaded page a pointer already resting where the name now is
    // gets no mouseenter in Firefox, and the card would not know it is hovered. Moved there
    // by its place on screen, not `hover()`, whose own scrolling into view can move the page.
    await page.mouse.move(0, 0)
    const name = (await card.locator('[data-month]').boundingBox())!
    await page.mouse.move(name.x + name.width / 2, name.y + name.height / 2)
    await expect(card).not.toHaveAttribute('data-cycling', '')
    for (let i = 0; i < 12 && (await card.locator('[data-month]').textContent()) !== hold; i++) {
      await expect(card).toHaveAttribute('data-settled', '', LOADED)
      await card.getByRole('button', { name: 'Newer month' }).click()
    }
    await expect(card.locator('[data-month]')).toHaveText(hold)
    await expect(card).toHaveAttribute('data-settled', '', LOADED)
  }
  await expect
    .poll(() =>
      // Every box around the card (the bento cell...) at rest.
      card.evaluate((el) => {
        const moving: string[] = []
        for (let at = el.parentElement; at && at !== document.body; at = at.parentElement) {
          const s = getComputedStyle(at)
          const still = s.transform === 'none' || s.transform === 'matrix(1, 0, 0, 1, 0, 0)'
          if (!still || s.opacity !== '1') moving.push(at.className)
        }
        return moving
      })
    )
    .toEqual([])
  return card
}

test('hovering a build log day lights it up, and the readout shows its date and numbers', async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, 'Hover is a desktop pointer; phones tap (see below).')
  await page.goto('/')
  const card = await showBuildLog(page)
  const readout = card.locator('[data-readout]')
  const day = (name: string) => card.getByRole('button', { name: new RegExp(`^${name}:`) })
  await day('Thursday, November 5').hover()
  await expect(day('Thursday, November 5')).toHaveAttribute('aria-pressed', 'true')
  await expect(day('Thursday, November 5')).toHaveAttribute('data-d', '0')
  // Its neighbours lean in.
  await expect(day('Wednesday, November 4')).toHaveAttribute('data-d', '1')
  await expect(day('Tuesday, November 3')).toHaveAttribute('data-d', '2')
  await expect(card.locator('[data-chart]')).toHaveAttribute('data-exploring', '')
  await expect(readout.locator('[data-number]')).toHaveText('18')
  await expect(readout).toContainText(/changes on\s*Thu, Nov 5/)
  await expect(readout).toContainText('Busiest day')
  await expect(readout).toContainText('37% of month')
  await expect(readout).toContainText('2-day streak')
  // Sweep on to another day.
  await day('Sunday, November 8').hover()
  await expect(readout.locator('[data-number]')).toHaveText('9')
  await expect(readout).toContainText(/changes on\s*Sun, Nov 8/)
  await expect(readout).toContainText('#3 of 5 days')
  await expect(day('Thursday, November 5')).toHaveAttribute('aria-pressed', 'false')
  // Off the chart, the month again.
  await page.mouse.move(2, 2)
  await expect(card.locator('[data-chart]')).not.toHaveAttribute('data-exploring', '')
  await expect(card.locator('[data-changes]')).toHaveText('49')
  await expect(readout).toContainText('changes shipped')
})

test('the build log days can be walked with the arrow keys, Home and End, and let go with Escape', async ({
  page,
}) => {
  await page.goto('/')
  const card = await showBuildLog(page)
  const readout = card.locator('[data-readout]')
  // One stop in the tab order: the last day so far.
  const stop = card.locator('[data-chart] button[tabindex="0"]')
  await expect(stop).toHaveCount(1)
  await expect(stop).toHaveAccessibleName('Monday, November 9: 0 changes')
  await stop.focus()
  const focused = page.locator(':focus')
  await expect(focused).toHaveAttribute('aria-pressed', 'true')
  await expect(readout).toContainText(/changes on\s*Mon, Nov 9/)
  await page.keyboard.press('Home')
  await expect(focused).toHaveAccessibleName('Sunday, November 1: 6 changes')
  await expect(readout.locator('[data-number]')).toHaveText('6')
  await page.keyboard.press('ArrowRight')
  await expect(focused).toHaveAccessibleName('Monday, November 2: 3 changes')
  await expect(readout).toContainText(/changes on\s*Mon, Nov 2/)
  await page.keyboard.press('ArrowLeft')
  await page.keyboard.press('ArrowLeft')
  await expect(focused).toHaveAccessibleName('Sunday, November 1: 6 changes')
  // End is the last day so far, not a day still to come, and the walk stops there.
  await page.keyboard.press('End')
  await page.keyboard.press('ArrowRight')
  await expect(focused).toHaveAccessibleName('Monday, November 9: 0 changes')
  await expect(readout).toContainText('Nothing shipped')
  await page.keyboard.press('ArrowLeft')
  await expect(focused).toHaveAccessibleName('Sunday, November 8: 9 changes')
  await page.keyboard.press('Escape')
  await expect(card.locator('[data-chart] [aria-pressed="true"]')).toHaveCount(0)
  await expect(card.locator('[data-changes]')).toHaveText('49')
})

/**
 * WebKit on CI once drew no frame for seconds (2026-11-25), and the readout's
 * number, which rolls on animation frames, stayed mid-roll ("5" for 49, "20"
 * for 6). Here the page gets a frame only every 6 s, each stamped a little
 * before it runs, as WebKit stamps them: the number must still settle.
 */
test('the build log readout settles on the right number even when the page draws no frames', async ({ page }) => {
  await page.addInitScript(() => {
    window.requestAnimationFrame = (cb) =>
      window.setTimeout(() => cb(performance.now() - 40), 6000) as unknown as number
    window.cancelAnimationFrame = (id) => window.clearTimeout(id)
  })
  await page.goto('/')
  const card = await showBuildLog(page)
  const number = card.locator('[data-readout] [data-number]')
  await expect(number).toHaveText('49')
  await card.locator('[data-chart] button[tabindex="0"]').focus()
  await page.keyboard.press('Home')
  await expect(number).toHaveText('6')
  await page.keyboard.press('End')
  await page.keyboard.press('ArrowLeft')
  await expect(number).toHaveText('9')
  await page.keyboard.press('Escape')
  await expect(number).toHaveText('49')
})

test.describe('on a touch screen', () => {
  test.use({ hasTouch: true })

  // Real time, not the fake clock: under the fake clock WebKit with touch sometimes never got as far
  // as loading the months (2026-11-25), and holding is best shown by simply waiting past the 5 s.
  test('a tap picks a build log day and holds the month; a tap elsewhere lets go', async ({ page }) => {
    await page.goto('/')
    const card = await showBuildLog(page, { hold: false })
    await expect(card).toHaveAttribute('data-cycling', '')
    // The month may already have moved on by itself, so pick the fifth day of whichever is showing.
    const day = card.locator('[data-chart] button').nth(4)
    await day.tap()
    await expect(day).toHaveAttribute('aria-pressed', 'true')
    const month = await card.locator('[data-month]').textContent()
    const [, weekday, monthName] = (await day.getAttribute('aria-label'))!.match(/^(\w{3})\w*, (\w{3})\w* 5:/)!
    await expect(card.locator('[data-readout]')).toContainText(
      new RegExp(`changes? on\\s*${weekday}, ${monthName} 5`)
    )
    // Picked, the month holds well past its 5 s.
    await expect(card).not.toHaveAttribute('data-cycling', '')
    await page.waitForTimeout(6_500)
    await expect(card.locator('[data-month]')).toHaveText(month!)
    await expect(day).toHaveAttribute('aria-pressed', 'true')
    // A tap elsewhere (the page's side margin, level with the card) lets go, and the months move on again.
    const box = (await card.boundingBox())!
    await page.touchscreen.tap(2, box.y + box.height / 2)
    await expect(day).toHaveAttribute('aria-pressed', 'false')
    await expect(card).toHaveAttribute('data-cycling', '')
  })
})

test('the build log card moves on through the months by itself, and holds when asked', async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, 'Hover is a desktop pointer; the timing is the same on phones.')
  // Moving the page's clock on runs every timer on it (the dino, the marquees), slowly in WebKit.
  test.setTimeout(150_000)
  await page.clock.install()
  // Sentry loads itself when the page is idle (instrumentation-client.ts), in the middle of this
  // test, and must not here. Its Session Replay debounces with a setTimeout taken from a sandbox
  // iframe whenever the page's own setTimeout is not native (as on this fake clock), but clears
  // those timers with the page's clearTimeout. The iframe's fake clock numbers its timers like the
  // page's, so that clear can hit this card's interval, which then never fires again (about one run
  // in ten, 2026-11-24). Real visitors have a native setTimeout and are not affected. This stub has
  // to come after clock.install(), which installs its own requestIdleCallback over anything before.
  await page.addInitScript(() => {
    window.requestIdleCallback = () => 0
    // The bold map above this card draws a WebGL frame on every animation
    // frame, and each second of fake time runs sixty of them, in software in
    // CI: seconds per step. Its still 2D picture (no WebGL2) has no loop.
    const getContext = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type: string,
      ...rest: unknown[]
    ) {
      if (type === 'webgl2') return null
      return (getContext as (...a: unknown[]) => RenderingContext | null).call(this, type, ...rest)
    } as typeof getContext
  })
  await page.goto('/')
  const card = page.locator('[data-build-log]')
  const month = card.locator('[data-month]')
  // Well inside the screen: at its edge, the card's own entrance can carry it in and out of view.
  await card.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }))
  await expect(card).toHaveAttribute('data-build-log', 'ready', LOADED)
  await page.mouse.move(2, 2)
  await expect(card).toHaveAttribute('data-cycling', '')
  // Moves the clock on in small steps until the card shows `text`.
  const movesOnTo = (text: string) =>
    expect(async () => {
      await page.clock.runFor(1000)
      await expect(month).toHaveText(text, { timeout: 500 })
    }).toPass({ timeout: 40_000 })
  // Back through the months and round again, every 5 s. (The clock runs on its own until moved, so a
  // slow machine may already have moved past November here; that the card starts on this month is
  // checked by the first build log test.)
  await movesOnTo('November 2026')
  await movesOnTo('October 2026')
  await movesOnTo('September 2026')
  await movesOnTo('November 2026')
  // Hovered, it holds.
  await card.hover()
  await expect(card).not.toHaveAttribute('data-cycling', '')
  await page.clock.runFor(6_000)
  await expect(month).toHaveText('November 2026')
  // After an arrow, it holds about 15 s, then moves on again.
  await card.getByRole('button', { name: 'Older month' }).click()
  await page.mouse.move(2, 2)
  await expect(month).toHaveText('October 2026')
  await expect(card).toHaveAttribute('data-cycling', '')
  await page.clock.runFor(10_000)
  await expect(month).toHaveText('October 2026')
  await movesOnTo('September 2026')
})

test('the build log card never moves on by itself under reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.clock.install()
  await page.goto('/')
  const card = page.locator('[data-build-log]')
  await card.scrollIntoViewIfNeeded()
  await expect(card).toHaveAttribute('data-build-log', 'ready', LOADED)
  await expect(card).not.toHaveAttribute('data-cycling', '')
  await page.clock.runFor(6_000)
  await expect(card.locator('[data-month]')).toHaveText('November 2026')
})

test('under reduced motion a build log day still lights up and shows its numbers, in place', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  const card = page.locator('[data-build-log]')
  await card.evaluate((el) => el.scrollIntoView({ block: 'center', behavior: 'instant' }))
  await expect(card).toHaveAttribute('data-build-log', 'ready', LOADED)
  const day = card.getByRole('button', { name: /^Thursday, November 5:/ })
  await day.focus()
  await expect(day).toHaveAttribute('aria-pressed', 'true')
  // The number is there at once, with no count up.
  await expect(card.locator('[data-readout] [data-number]')).toHaveText('18', { timeout: 100 })
  await expect(card.locator('[data-readout]')).toContainText('Busiest day')
  // Lit, but nothing lifts or slides: no transforms, and the blocks light all at once.
  const styles = await card.evaluate((el) => {
    const pick = (s: string) => getComputedStyle(el.querySelector(s)!)
    return {
      lift: pick('.logcard-day:has([aria-pressed="true"]) .logcard-stack').transform,
      neighbour: pick('.logcard-day[data-d="1"] .logcard-stack').transform,
      fill: pick('.logcard-day:has([aria-pressed="true"]) .logcard-lit').transitionDuration,
      lit: pick('.logcard-day:has([aria-pressed="true"]) .logcard-lit').transform,
    }
  })
  expect(styles.lift).toBe('none')
  expect(styles.neighbour).toBe('none')
  // (The site's global reduced-motion rule leaves a token 0.01 ms.)
  expect(parseFloat(styles.fill)).toBeLessThan(0.001)
  expect(styles.lit).toBe('matrix(1, 0, 0, 1, 0, 0)')
})

/**
 * Each day's bar against the month it shows: its blocks (`--logcard-n`, the
 * day's share of the busiest day's, one dark block on a quiet day, none on a
 * day to come) and the height its colour has come to rest at. Returns what
 * does not match, so a failure says which day.
 */
function barMismatches(card: import('@playwright/test').Locator) {
  return card.evaluate((el) => {
    const css = getComputedStyle(el)
    const levels = Number(css.getPropertyValue('--logcard-levels'))
    const pitch = parseFloat(css.getPropertyValue('--logcard-pitch'))
    const block = parseFloat(css.getPropertyValue('--logcard-block'))
    const days = [...el.querySelectorAll<HTMLElement>('[data-chart] .logcard-day')]
    const counts = days.map((d) => {
      const label = d.querySelector('button')?.getAttribute('aria-label')
      return label ? Number(label.match(/: (\d+) change/)![1]) : null
    })
    const peak = Math.max(1, ...counts.map((c) => c ?? 0))
    const out: string[] = []
    days.forEach((d, i) => {
      const c = counts[i]
      const want = c === null ? 0 : c > 0 ? Math.max(1, Math.round((c / peak) * levels)) : 1
      const n = Number(d.style.getPropertyValue('--logcard-n'))
      if (n !== want) out.push(`day ${i + 1}: ${n} blocks, want ${want}`)
      const fill = d.querySelector<HTMLElement>('.logcard-fill')!
      const height = parseFloat(getComputedStyle(fill).backgroundSize.split(' ')[1] ?? '0')
      const wantHeight = Math.max(0, want * pitch - (pitch - block))
      if (Math.abs(height - wantHeight) > 0.5)
        out.push(`day ${i + 1}: ${height}px high, want ${wantHeight}`)
    })
    return out
  })
}

/**
 * A new month flows in (owner, 2026-11-25: "a little more flowy"): every bar
 * eases to its new height in a wave while the name and readout cross over, on
 * one timeline, and the card itself never moves or resizes.
 */
test('a build log month change flows in, holds the card still, and lands on the right month, bars and number', async ({
  page,
}) => {
  await page.goto('/')
  const card = await showBuildLog(page)
  // The card's box on the page (not the window, which a click may scroll).
  const box = () =>
    card.evaluate((el) => {
      const r = el.getBoundingClientRect()
      return `${r.x},${r.y + window.scrollY},${r.width},${r.height}`
    })
  const before = await box()
  await card.getByRole('button', { name: 'Older month' }).click()
  const boxes = new Set<string>()
  for (let i = 0; i < 16; i++) {
    boxes.add(await box())
    await page.waitForTimeout(40)
  }
  expect([...boxes]).toEqual([before])
  await expect(card).toHaveAttribute('data-settled', '', LOADED)
  await expect(card.locator('[data-month]')).toHaveText('October 2026')
  await expect(card.locator('[data-changes]')).toHaveText('275')
  expect(await barMismatches(card)).toEqual([])
})

test('a build log month change interrupted by another, and by a day, lands where it was sent', async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, 'Hover is a desktop pointer.')
  await page.goto('/')
  const card = await showBuildLog(page)
  const older = card.getByRole('button', { name: 'Older month' })
  await older.click()
  await older.click()
  // A day of September, picked while its bars are still on their way.
  const day = card.locator('[data-chart] button').nth(4)
  await day.hover()
  await expect(card.locator('[data-month]')).toHaveText('September 2026')
  await expect(day).toHaveAttribute('aria-pressed', 'true')
  const count = (await day.getAttribute('aria-label'))!.match(/: (\d+) change/)![1]
  await expect(card.locator('[data-readout] [data-number]')).toHaveText(count)
  await page.mouse.move(2, 2)
  await expect(card).toHaveAttribute('data-settled', '', LOADED)
  await expect(card.locator('[data-month]')).toHaveText('September 2026')
  expect(await barMismatches(card)).toEqual([])
})

test('under reduced motion a new build log month is simply there', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  const card = await showBuildLog(page)
  await card.getByRole('button', { name: 'Older month' }).click()
  await expect(card.locator('[data-changes]')).toHaveText('275', { timeout: 200 })
  await expect(card).toHaveAttribute('data-settled', '', { timeout: 200 })
  const moving = await card.evaluate(
    // Any that takes time: the site's reduced-motion rule leaves near-zero transitions,
    // which WebKit still lists.
    (el) =>
      [...el.querySelectorAll('.logcard-fill')]
        .flatMap((f) => f.getAnimations())
        .filter((a) => Number(a.effect?.getTiming().duration) > 1).length
  )
  expect(moving).toBe(0)
  expect(await barMismatches(card)).toEqual([])
})

/** The bars rise the first time the card is seen, and a month change lands, with no frames at all. */
test('the build log card rises in and changes month in the right state even when the page draws no frames', async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.requestAnimationFrame = (cb) =>
      window.setTimeout(() => cb(performance.now() - 40), 6000) as unknown as number
    window.cancelAnimationFrame = (id) => window.clearTimeout(id)
  })
  await page.goto('/')
  const card = await showBuildLog(page)
  await expect(card).toHaveAttribute('data-entrance', 'idle')
  await expect(card.locator('[data-changes]')).toHaveText('49')
  await expect.poll(() => barMismatches(card)).toEqual([])
  await card.getByRole('button', { name: 'Older month' }).click()
  await expect(card).toHaveAttribute('data-settled', '', LOADED)
  await expect(card.locator('[data-changes]')).toHaveText('275')
  await expect.poll(() => barMismatches(card)).toEqual([])
})

test('the build log card falls back to a plain card when the log cannot be read', async ({ page }) => {
  await page.route('**/api/build-log', (route) => route.fulfill({ json: { months: [] } }))
  await page.goto('/')
  const card = page.locator('[data-build-log]')
  await card.scrollIntoViewIfNeeded()
  await expect(card).toHaveAttribute('data-build-log', 'fallback', LOADED)
  await expect(card).toContainText("What I'm shipping")
  await expect(card.locator('[data-chart]')).toHaveCount(0)
  await expect(card.getByRole('link')).toHaveCount(2)
  await expect(card.getByRole('link', { name: /^n8builds\.dev/ })).toHaveAttribute('href', 'https://n8builds.dev')
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
 * "Ready to relocate" is the bold 3D map (components/ui/BoldMap; owner,
 * 2026-11-25). Its code loads only as the card nears the screen; it counts
 * the frames it draws (`data-frames`), says whether it moves (`data-mode`),
 * whether its loop runs (`data-running`) and what it knows of the visitor
 * (`data-visitor`). The visitor's rough location comes from /api/where after
 * the map is up, so the page itself stays static and cached.
 */
test.describe('the bold map', () => {
  const AUSTIN = { kind: 'us', at: [-97.5, 30.5], near: 'Austin, TX', mi: 1230 }
  const frames = (map: import('@playwright/test').Locator) =>
    map.evaluate((el) => Number((el as HTMLElement).dataset.frames))
  const openMap = async (page: import('@playwright/test').Page) => {
    await page.goto('/')
    const slot = page.locator('[data-bold-map-slot]')
    await slot.scrollIntoViewIfNeeded()
    const map = slot.locator('[data-bold-map]')
    await expect(map).toHaveAttribute('data-ready', 'true', { timeout: 20_000 })
    return map
  }

  test('loads only as the card nears the screen', async ({ page }) => {
    const chunks: string[] = []
    page.on('response', (r) => {
      if (r.url().includes('/_next/static/') && r.url().endsWith('.js')) chunks.push(r.url())
    })
    let asked = 0
    await page.route('**/api/where', (route) => {
      asked++
      return route.fulfill({ json: { visitor: null } })
    })
    // A short window, so the card starts well out of reach on every device.
    const size = page.viewportSize()!
    await page.setViewportSize({ width: size.width, height: 360 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const gap = await page
      .locator('[data-bold-map-slot]')
      .evaluate((el) => el.getBoundingClientRect().top - innerHeight)
    expect(gap, 'the card starts more than 300px below the window').toBeGreaterThan(300)
    // Out of reach: the map's code has not loaded and nothing asked where you are.
    await expect(page.locator('[data-bold-map]')).toHaveCount(0)
    expect(asked).toBe(0)
    const before = chunks.length
    await page.setViewportSize(size)
    await page.locator('[data-bold-map-slot]').scrollIntoViewIfNeeded()
    await expect(page.locator('[data-bold-map]')).toHaveAttribute('data-ready', 'true', {
      timeout: 20_000,
    })
    expect(chunks.length).toBeGreaterThan(before)
    await expect.poll(() => asked).toBe(1)
  })

  test('holds still, fully drawn, under reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.route('**/api/where', (route) => route.fulfill({ json: { visitor: AUSTIN } }))
    const map = await openMap(page)
    await expect(map).toHaveAttribute('data-mode', 'still')
    // The line to the visitor is drawn at once and labelled.
    await expect(map.locator('[data-on]', { hasText: 'near Austin, TX' })).toBeVisible()
    // It draws once per change (the start, the visitor's answer, a late resize
    // as the page settles), never in a loop.
    await expect(map).toHaveAttribute('data-running', 'false')
    await page.waitForTimeout(800)
    const before = await frames(map)
    await page.waitForTimeout(1500)
    expect(await frames(map)).toBe(before)
    expect(before).toBeLessThan(6)
  })

  test('moves on screen and pauses off screen', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    const map = await openMap(page)
    test.skip(
      (await map.getAttribute('data-renderer')) === '2d',
      'no WebGL2 in this browser: the map is the still 2D picture (tests/lab.spec.ts)'
    )
    await expect(map).toHaveAttribute('data-mode', 'moving')
    await expect(map).toHaveAttribute('data-running', 'true')
    const before = await frames(map)
    await expect.poll(() => frames(map)).toBeGreaterThan(before + 2)
    await page.locator('footer').scrollIntoViewIfNeeded()
    await expect(map).toHaveAttribute('data-running', 'false')
    const paused = await frames(map)
    await page.waitForTimeout(800)
    expect(await frames(map)).toBe(paused)
  })

  test('says what it shows to screen readers, and hides the drawing', async ({ page }) => {
    await page.route('**/api/where', (route) => route.fulfill({ json: { visitor: AUSTIN } }))
    // Before the map loads, the card already says it.
    await page.goto('/')
    const slot = page.locator('[data-bold-map-slot]')
    await expect(slot.locator('.sr-only')).toHaveText(
      'A map of the United States: Nathan is in Los Angeles, California, and open to relocating anywhere.'
    )
    const map = await openMap(page)
    await expect(map.locator('.sr-only')).toHaveText(
      /open to relocating anywhere\. You seem to be near Austin, TX, about 1,230 miles away\./
    )
    await expect(map.locator('canvas')).toHaveAttribute('aria-hidden', 'true')
  })

  test('his avatar grows on hover and on a tap, and eases back', async ({ page, isMobile }) => {
    // The sizes are checked on the still map: a moving map in a browser that
    // draws WebGL in software (CI, a busy machine) makes every layout read
    // slow. The ease itself is checked at the end, with motion allowed.
    await page.emulateMedia({ reducedMotion: 'reduce' })
    const map = await openMap(page)
    const avatar = map.getByRole('button', { name: 'Nathan Watkins, in Los Angeles' })
    const picture = avatar.locator('span').first()
    const size = async () => (await picture.boundingBox())!.width
    await page.mouse.move(0, 0)
    await expect.poll(size).toBeLessThan(40)
    if (!isMobile) {
      const box = (await map.boundingBox())!
      await page.mouse.move(box.x + box.width * 0.6, box.y + box.height * 0.45)
      await expect.poll(size).toBeGreaterThan(60)
      await page.mouse.move(0, 0)
      await expect.poll(size).toBeLessThan(40)
    }
    await (isMobile ? avatar.tap() : avatar.click())
    await expect(avatar).toHaveAttribute('aria-pressed', 'true')
    await expect.poll(size).toBeGreaterThan(60)
    await (isMobile ? avatar.tap() : avatar.click())
    await expect(avatar).toHaveAttribute('aria-pressed', 'false')
    if (!isMobile) await page.mouse.move(0, 0)
    await expect.poll(size).toBeLessThan(40)
    // With motion allowed, the size and the glow ease over half a second.
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await expect
      .poll(() => picture.evaluate((el) => getComputedStyle(el).transitionDuration))
      .toMatch(/^0\.5s/)
  })

  test('under reduced motion the avatar changes size at once, from the keyboard too', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    const map = await openMap(page)
    const avatar = map.getByRole('button', { name: 'Nathan Watkins, in Los Angeles' })
    await avatar.focus()
    await avatar.press('Enter')
    await expect(avatar).toHaveAttribute('aria-pressed', 'true')
    // No transition: the next frame already has the full size.
    const width = await avatar
      .locator('span')
      .first()
      .evaluate(
        (el) =>
          new Promise<number>((done) =>
            requestAnimationFrame(() => done(el.getBoundingClientRect().width))
          )
      )
    expect(width).toBeGreaterThan(60)
  })

  test('draws a line to the visitor when /api/where answers with a point', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.route('**/api/where', (route) => route.fulfill({ json: { visitor: AUSTIN } }))
    const map = await openMap(page)
    await expect(map).toHaveAttribute('data-visitor', 'us')
    await expect(
      map.locator('[data-on]', { hasText: /You · near Austin, TX · 1,230 mi/ })
    ).toBeVisible()
  })

  for (const [name, answer] of [
    ['answers empty', { json: { visitor: null } }],
    ['fails', { status: 500, body: 'no' }],
    ['answers with something else', { json: { visitor: { kind: 'us', at: 'Austin', mi: 5 } } }],
    ['is rate limited', { status: 429, json: { visitor: null } }],
  ] as const) {
    test(`draws no line when /api/where ${name}`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' })
      let asked = false
      await page.route('**/api/where', (route) => {
        asked = true
        return route.fulfill(answer)
      })
      const map = await openMap(page)
      await expect.poll(() => asked).toBe(true)
      await page.waitForTimeout(500)
      await expect(map).toHaveAttribute('data-visitor', 'none')
      await expect(map.locator('[data-on]')).toHaveCount(0)
      await expect(map.locator('canvas')).toBeAttached()
    })
  }

  test('/api/where answers only a coarse visitor, never cached, with no cookie', async ({
    request,
  }) => {
    const res = await request.get('/api/where')
    expect(res.status()).toBe(200)
    const headers = res.headers()
    expect(headers['cache-control']).toContain('no-store')
    expect(headers['cache-control']).toContain('private')
    expect(headers['set-cookie']).toBeUndefined()
    // Off Workers there is no rate limit binding, and the route says so
    // (lib/whereLimit.ts; on Workers it says ok, limited or error).
    expect(headers['x-ratelimit-state']).toBe('absent')
    const body = await res.json()
    // Off Cloudflare there is no location: no visitor, and nothing else at all.
    expect(body).toEqual({ visitor: null })
  })

  test('the home page itself carries no location and asks for none on the server', async ({
    request,
  }) => {
    const res = await request.get('/')
    const html = await res.text()
    expect(html).toContain('data-bold-map-slot')
    expect(html).not.toMatch(/You seem to be|near [A-Z][a-z]+, [A-Z]{2}/)
    expect(res.headers()['set-cookie']).toBeUndefined()
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
  await expect(card.getByRole('heading', { name: 'Full-Stack Developer', exact: true })).toBeAttached()
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
    'https://debellgolf.com/',
    'https://donovangolf.com/',
    'https://lcfcountryclub.com/',
    'https://riverwoodranch.web.app/',
    'https://techforpros.com/',
    'https://www.alhambragolf.com/',
    'https://www.angelesnational.com/',
    'https://www.arroyosecogc.com/',
    'https://www.mpgolfclub.com/',
  ])
  // The six golf course sites, each with its own screenshot (the resume of November 2026).
  const golf = experience.locator('div.group\\/exp', { hasText: 'Donovan Golf' })
  await expect(golf).toContainText('Rebuilt six golf course websites')
  // The role is closed here, so its cards are inert: count them in the DOM, not by role.
  const cards = golf.locator('ul[aria-label="Sites I built there"]')
  await expect(cards.locator('a')).toHaveCount(6)
  const shots = await cards
    .locator('img')
    .evaluateAll((imgs) => imgs.map((img) => decodeURIComponent((img as HTMLImageElement).src)))
  expect(new Set(shots.map((src) => src.match(/experience\/(\w+)\.webp/)?.[1])).size).toBe(6)
  // The clinical lab is its own role, named and never linked.
  const lab = experience.locator('div.group\\/exp', { hasText: 'Lifeline Clinical Labs' })
  await expect(lab).toHaveCount(1)
  await expect(lab.getByRole('link')).toHaveCount(0)

  const about = page.locator('#about')
  await expect(about).toContainText('three years building client apps at a consulting firm')
  await expect(about.getByRole('link', { name: 'Tech for Pros' })).toHaveAttribute(
    'href',
    'https://techforpros.com'
  )
})

test("a role's site cards are one scrolling row, paged by Previous and Next when they do not all fit", async ({
  page,
  isMobile,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  const experience = page.locator('#experience')
  const role = (name: string) => experience.locator('div.group\\/exp', { hasText: name })
  const golf = role('Donovan Golf')
  await golf.locator('[data-role-toggle]').scrollIntoViewIfNeeded()
  await golf.locator('[data-role-toggle]').click()
  const row = golf.getByRole('list', { name: 'Sites I built there' })
  await row.scrollIntoViewIfNeeded()
  const first = row.locator('a[href="https://www.arroyosecogc.com/"]')
  const last = row.locator('a[href="https://lcfcountryclub.com/"]')
  await expect(row.getByRole('link')).toHaveCount(6)
  await expect(first).toBeInViewport({ ratio: 0.9 })
  await expect(last).not.toBeInViewport()
  const previous = golf.getByRole('button', { name: 'Previous sites' })
  const next = golf.getByRole('button', { name: 'Next sites' })
  await expect(previous).toBeDisabled()
  // The total sits by the list, and the position beside the arrows ("1 to 3 of 6" on a desktop,
  // "1 of 6" on a phone), announced politely.
  await expect(golf.locator('[data-site-count]')).toHaveText('6 sites')
  const position = golf.locator('[data-site-position]')
  // Two spans, one for each size; only the one in use is visible.
  const shown = position.locator('span:visible')
  await expect(position).toHaveAttribute('aria-live', 'polite')
  await expect(shown).toHaveText(isMobile ? '1 of 6' : '1 to 3 of 6')
  // Next until the end (a phone shows one card a page: more clicks than cards is plenty). The first click is a real one. The row then snaps on after it, and the
  // buttons follow the position it settles at, so the rest wait for the row to be still and
  // click through the DOM: a button that has just become disabled ignores it, where a pointer
  // click would wait on it.
  const scrolled = () => row.evaluate((el) => el.scrollLeft)
  const still = () =>
    expect
      .poll(async () => {
        const at = await scrolled()
        await page.waitForTimeout(150)
        return (await scrolled()) === at
      })
      .toBe(true)
  await next.click()
  for (let clicks = 1; clicks < 10; clicks++) {
    await still()
    await next.dispatchEvent('click')
  }
  await still()
  await expect(next).toBeDisabled()
  await expect(previous).toBeEnabled()
  await expect(last).toBeInViewport({ ratio: 0.9 })
  await expect(first).not.toBeInViewport()
  await expect(shown).toHaveText(isMobile ? '6 of 6' : '4 to 6 of 6')
  // The page itself never scrolls sideways.
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  // Appturnity's two cards fit on a desktop, so it has no buttons there (a phone shows one at a time).
  const appturnity = role('Appturnity')
  await appturnity.locator('[data-role-toggle]').click()
  await expect(appturnity.getByRole('list', { name: 'Sites I built there' })).toBeVisible()
  const wide = await appturnity.evaluate((el) => {
    const ul = el.querySelector('ul[aria-label="Sites I built there"]') as HTMLElement
    return ul.scrollWidth <= ul.clientWidth + 1
  })
  if (!isMobile) expect(wide).toBe(true)
  await expect(appturnity.getByRole('button', { name: 'Next sites' })).toHaveCount(wide ? 0 : 1)
  // Every role with sites says how many, with or without the arrows.
  await expect(appturnity.locator('[data-site-count]')).toHaveText('2 sites')
  await expect(appturnity.locator('[data-site-position]')).toHaveCount(wide ? 0 : 1)
})

test('every role shows its basics; only the roles with more to say expand', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  const experience = page.locator('#experience')
  await experience.getByRole('button', { name: 'Expand all' }).scrollIntoViewIfNeeded()
  const role = (name: string) => experience.locator('div.group\\/exp', { hasText: name })
  // The basics show with no click, for every role.
  await expect(role('Tech for Pros').getByText(/Deployed AI receptionists in a 12-client pilot/)).toBeVisible()
  await expect(role('Lifeline Clinical Labs').getByText(/Python order-entry pipeline/)).toBeVisible()
  await expect(role('Realtek Solutions').getByText(/Launched 5\+ small-business websites/)).toBeVisible()
  await expect(role('The Coder School').getByText(/Taught JavaScript, Python/)).toBeVisible()
  // Three roles expand; Realtek and The Coder School don't, and the school's site isn't linked.
  for (const name of ['Tech for Pros', 'Appturnity', 'Donovan Golf']) {
    await expect(role(name).locator('[data-role-toggle]'), name).toHaveCount(1)
  }
  for (const name of ['Lifeline Clinical Labs', 'Realtek Solutions', 'The Coder School']) {
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
  const more = experience.getByText(/single configuration-driven Cloudflare Worker/)
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
  await expect(role.getByText(/Rebuilt six golf course websites/)).toBeVisible()
  const bullet = role.getByText(/Coordinated pre-launch booking integration testing/)
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
  // The row reveals itself as it scrolls in (it fades up from 25px lower, at 95%
  // size, for about half a second). Measured mid-reveal, its box is ~30px off by
  // the time the click lands (WebKit on CI, 17 of 30 runs under load): wait until
  // the row has settled, which is what a visitor sees before they reach for it.
  await expect
    .poll(() =>
      role.evaluate((e) => {
        let o = 1
        let moved = false
        for (let n: Element | null = e; n; n = n.parentElement) {
          o *= Number(getComputedStyle(n).opacity)
          if (getComputedStyle(n).transform !== 'none') moved = true
        }
        return o === 1 && !moved
      })
    )
    .toBe(true)
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
  for (const path of ['/projects', '/projects/net-trailers']) {
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

test('the buttons beside a section heading arrive with it, in a reveal of their own', async ({ page }) => {
  await page.goto('/')
  for (const [heading, button] of [
    ['Building for the', 'Detailed view'],
    ["Where I've built", 'Expand all'],
  ]) {
    const row = page
      .locator('div:has(> [data-reveal] h2)')
      .filter({ has: page.getByRole('heading', { name: new RegExp(heading) }) })
      .first()
    await expect(row.locator('[data-reveal]'), heading).toHaveCount(2)
    await expect(row.locator('[data-reveal]').filter({ hasText: button }), button).toHaveCount(1)
  }
})
