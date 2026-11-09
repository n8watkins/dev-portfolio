import { test, expect, type Page } from '@playwright/test'

// The tech stack card (and its dino) is on the About page in this layout (variant B).
const STACK_PAGE = '/about'

/**
 * The dino easter egg on the "My tech stack" card: the same dino as
 * n8builds.dev's AI kit (components/features/dino/ is byte-identical, see
 * `npm run check:sync`), so these are n8builds-web's tests/e2e/ai-kit.spec.ts
 * dino tests, run against this site's card. Keep them in step with those.
 */

const dino = (page: Page) => page.locator('[data-dino]')

// Bring the panel on screen without a smooth scroll still on its way.
// Jump there, and again if the page moves it away (a reload restores the old
// scroll position after load, and late content can shift the page).
const showKit = (page: Page, selector: string) =>
  expect
    .poll(() =>
      page.locator(selector).evaluate((el) => {
        const box = el.getBoundingClientRect()
        // Near the middle with its top below the sticky header, or, if it is
        // taller than the window, its top just in view: a reload's restored
        // scroll can leave its top row under the header, where the dino counts
        // as out of sight. (The page's scroll padding keeps "centre" a little
        // off true centre, hence the slack.)
        const centred = Math.abs((box.top + box.bottom) / 2 - innerHeight / 2) <= 100 && box.top >= 72
        const tall = box.height > innerHeight - 80
        if (tall ? box.top >= 72 && box.top <= innerHeight / 3 : centred) return true
        el.scrollIntoView({ block: box.height > innerHeight - 80 ? 'start' : 'center', behavior: 'instant' })
        if (box.height > innerHeight - 80) scrollBy(0, -88)
        return false
      })
    )
    .toBe(true)

// Click (or tap) the dino where it is right now. It never holds still, so a
// pointer aimed at where it was a moment ago can miss: hit-test its centre
// and click in the same tick. (That its box takes the pointer at all is
// checked above.)
const pokeDino = (page: Page) =>
  expect
    .poll(() =>
      dino(page).evaluate((el) => {
        const box = el.getBoundingClientRect()
        const hit = document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2)
        if (!hit || !el.contains(hit)) return false
        ;(el as HTMLElement).click()
        return true
      })
    )
    .toBe(true)

// The roar bubble showing (one per word; only the current one is visible).
const roarBubble = (page: Page) =>
  page.locator('[data-dino-bubble^="roar-"]').filter({ visible: true })

// Click it while it walks (a click in the air only roars, without a reaction).
// After a fall off the bottom row it drops back in from the top first, which
// on a busy machine (or where frames come slowly) can take a while.
const pokeWalking = (page: Page) =>
  expect
    .poll(() =>
      dino(page).evaluate((el) => {
        if (el.dataset.mode !== 'walk') return false
        const box = el.getBoundingClientRect()
        const hit = document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2)
        if (!hit || !el.contains(hit)) return false
        ;(el as HTMLElement).click()
        return true
      }),
      { timeout: 30_000 }
    )
    .toBe(true)

// The tests shorten the dino's waits and can turn its roaming off (see
// DinoTiming in DinoGame.tsx). Later calls add to earlier ones.
interface DinoTiming {
  firstLineAfter?: number
  lineGap?: [number, number]
  stay?: [number, number]
  roam?: boolean
  reactions?: ('flip' | 'fall' | 'leap' | 'dash')[]
  round?: number
  choices?: ('change' | 'turn' | 'exit')[]
  entries?: ('drop' | 'left' | 'right')[]
}
const dinoTiming = (page: Page, timing: DinoTiming) =>
  page.addInitScript((t) => {
    const w = window as unknown as { __n8DinoTiming?: DinoTiming }
    w.__n8DinoTiming = { ...w.__n8DinoTiming, ...t }
  }, timing)

// A device that can't keep up: every frame spends `ms` of main-thread work.
const slowFrames = (page: Page, ms: number) =>
  page.addInitScript((ms) => {
    const hog = () => {
      const end = performance.now() + ms
      while (performance.now() < end) {
        // Busy: a slow frame.
      }
      requestAnimationFrame(hog)
    }
    requestAnimationFrame(hog)
  }, ms)

test.describe('dino easter egg (motion allowed)', () => {
  test.use({ contextOptions: { reducedMotion: 'no-preference' } })
  // Most tests follow it along its rows, so they keep it from roaming off on
  // its own (the roaming has its own test below).
  test.beforeEach(({ page }) => dinoTiming(page, { roam: false }))

  test('loads only once the AI kit nears the viewport, and never blocks the tiles', async ({
    page,
  }) => {
    await page.goto(STACK_PAGE)
    await expect(page.locator('h1')).toBeVisible()
    // Far above the kit, the game hasn't loaded.
    await page.waitForTimeout(1000)
    await expect(dino(page)).toHaveCount(0)

    await showKit(page, '[data-dino-panel]')
    // The game's code loads only now; a loaded CI machine can take several seconds.
    await expect(dino(page)).toHaveCount(1, { timeout: 15_000 })
    // Decorative: hidden from assistive tech. Clicks pass through its layer;
    // only the dino's own small box takes them (the click easter egg).
    await expect(
      page.locator('[data-dino-panel] [aria-hidden="true"]:has([data-dino])')
    ).toHaveCount(1)
    expect(
      await dino(page).evaluate((el) => getComputedStyle(el.parentElement!).pointerEvents)
    ).toBe('none')
    expect(await dino(page).evaluate((el) => getComputedStyle(el).pointerEvents)).toBe('auto')
    // It walks: its position changes from frame to frame.
    const at = () => dino(page).evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m41)
    const first = await at()
    await expect.poll(at).not.toBe(first)
  })

  // Every mode/level the dino passes through, recorded in the page so a brief
  // miss between two polls can't slip by.
  const recordDino = (page: Page) =>
    dino(page).evaluate((el) => {
      const log: string[] = []
      ;(window as unknown as { dinoLog: string[] }).dinoLog = log
      const note = () => log.push(`${el.dataset.mode}@${el.dataset.level}`)
      note()
      new MutationObserver(note).observe(el, { attributes: true })
    })
  const dinoLog = (page: Page) =>
    page.evaluate(() => (window as unknown as { dinoLog: string[] }).dinoLog)

  const rowBox = async (page: Page, index: number) =>
    (await page.locator('[data-dino-panel] [data-marquee-row]').nth(index).boundingBox())!
  const hoverRow = async (page: Page, index: number) => {
    const row = await rowBox(page, index)
    await page.mouse.move(row.x + row.width / 2, row.y + row.height / 2)
  }

  const onTopRow = async (page: Page) => {
    await page.goto(STACK_PAGE)
    await showKit(page, '[data-dino-panel]')
    await expect(dino(page)).toHaveAttribute('data-level', '0', { timeout: 10_000 })
    await expect(dino(page)).toHaveAttribute('data-mode', 'walk')
    await expect(dino(page)).toHaveAttribute('data-dir', 'right')
  }

  test('pausing the row it walks on makes it miss a jump and fall to the next row, walking the other way', async ({
    page,
  }) => {
    // Each fall may take up to 20s where frames come slowly (a loaded WebKit
    // took 9.5s for one), so together they can outlast the 30s default.
    test.setTimeout(90_000)
    await onTopRow(page)

    // Hovering the top row pauses it: the dino misses, lands on the bottom
    // row and turns around.
    await hoverRow(page, 0)
    // It misses at the next gap it reaches, walking on its capped clock: a
    // few seconds, or more where frames come slowly (WebKit without a GPU).
    await expect(dino(page)).toHaveAttribute('data-level', '1', { timeout: 20_000 })
    await expect(dino(page)).toHaveAttribute('data-dir', 'left')
    await expect(dino(page)).toHaveAttribute('data-mode', 'walk')

    // Pausing the bottom row (leave, then hover it) makes it miss again: off
    // the last row, it drops back in at the top left, walking right.
    await page.mouse.move(5, 5)
    await page.waitForTimeout(300)
    await hoverRow(page, 1)
    await expect(dino(page)).toHaveAttribute('data-level', '0', { timeout: 20_000 })
    await expect(dino(page)).toHaveAttribute('data-dir', 'right')
  })

  test('pausing a row it is not on leaves its jumps alone', async ({ page }) => {
    // No lines: it stands still while it talks, and this watches it hop.
    await dinoTiming(page, { firstLineAfter: 999 })
    await onTopRow(page)
    await hoverRow(page, 0)
    // It misses at the next gap it reaches, walking on its capped clock: a
    // few seconds, or more where frames come slowly (WebKit without a GPU).
    await expect(dino(page)).toHaveAttribute('data-level', '1', { timeout: 20_000 })
    await expect(dino(page)).toHaveAttribute('data-mode', 'walk')

    // Leave, then hover the top row again: it pauses, but the dino is on the
    // bottom row, still moving at full speed, so it keeps clearing the gaps.
    await page.mouse.move(5, 5)
    await page.waitForTimeout(300)
    await recordDino(page)
    await hoverRow(page, 0)
    await page.waitForTimeout(5000)
    await expect(dino(page)).toHaveAttribute('data-level', '1')
    const log = await dinoLog(page)
    expect(
      log.filter((entry) => !entry.endsWith('@1')),
      'stayed on the bottom row'
    ).toEqual([])
    expect(
      log.filter((entry) => entry.startsWith('miss')),
      'never missed a jump'
    ).toEqual([])
    expect(log.filter((entry) => entry.startsWith('hop')).length, 'kept hopping').toBeGreaterThan(0)
  })

  test('a row paused the moment it appears still makes it miss', async ({ page }) => {
    await page.goto(STACK_PAGE)
    await showKit(page, '[data-dino-panel]')
    // Hold the top row before the game has measured the rows: the pause counts
    // once it has, rather than being taken for how the row always was.
    await hoverRow(page, 0)
    await expect(dino(page)).toHaveCount(1, { timeout: 15_000 })
    await expect(dino(page)).toHaveAttribute('data-level', '1', { timeout: 20_000 })
  })

  test('dropping back onto a row that is already paused, it misses there too', async ({ page }) => {
    await onTopRow(page)
    // Down to the bottom row (pausing the top one), then hold the top row
    // still by focusing one of its tiles, as a keyboard user would.
    await hoverRow(page, 0)
    await expect(dino(page)).toHaveAttribute('data-level', '1', { timeout: 20_000 })
    await page.mouse.move(5, 5)
    await page
      .locator('[data-dino-panel] [data-marquee-row]')
      .first()
      .locator('figure')
      .first()
      .evaluate((tile) => tile.focus({ preventScroll: true }))
    // Pausing the bottom row drops it off the panel and back in on the top
    // row, which never paused while it was there: it misses all the same.
    await hoverRow(page, 1)
    await expect(dino(page)).toHaveAttribute('data-level', '0', { timeout: 20_000 })
    await page.mouse.move(5, 5)
    await expect(dino(page)).toHaveAttribute('data-level', '1', { timeout: 20_000 })
  })

  test('a tapped or focused tile pauses only its own row for the dino', async ({
    page,
    hasTouch,
  }) => {
    await onTopRow(page)
    // Focus (a keyboard user) or a tap (a touch screen) on a tile of the
    // bottom row pauses that row, not the one the dino is on. Wait for a tile
    // fully on screen (on a phone one is often cut by an edge).
    const rowsEl = page.locator('[data-dino-panel] [data-marquee-row]')
    const findTile = (index: number) =>
      rowsEl.nth(index).evaluate((row) => {
        const panel = row.closest('[data-dino-panel]')!.getBoundingClientRect()
        const figures = [...row.querySelectorAll<HTMLElement>('figure')]
        const at = figures.findIndex((figure) => {
          const box = figure.getBoundingClientRect()
          return box.left >= panel.left + 8 && box.right <= panel.right - 8
        })
        if (at < 0) return null
        const box = figures[at].getBoundingClientRect()
        return { at, x: box.x + box.width / 2, y: box.y + box.height / 2 }
      })
    const pick = async (index: number) => {
      // On a phone a tile is fully in view only part of the time as the row drifts: allow it a while.
      // Use the tile the poll found: asked again a moment later, it may have drifted off the edge.
      const found: { current: Awaited<ReturnType<typeof findTile>> } = { current: null }
      await expect
        .poll(async () => (found.current = await findTile(index)), { message: 'a tile fully on screen', timeout: 20_000 })
        .not.toBeNull()
      const target = found.current
      if (!target) throw new Error('no tile fully on screen')
      if (hasTouch) await page.touchscreen.tap(target.x, target.y)
      else
        await rowsEl
          .nth(index)
          .locator('figure')
          .nth(target.at)
          .evaluate((tile) => tile.focus({ preventScroll: true }))
    }
    await recordDino(page)
    await pick(1)
    await page.waitForTimeout(5000)
    const log = await dinoLog(page)
    expect(
      log.filter((entry) => !entry.endsWith('@0')),
      'stayed on the top row'
    ).toEqual([])
    expect(
      log.filter((entry) => entry.startsWith('miss')),
      'never missed a jump'
    ).toEqual([])

    // Moving to the top row pauses the dino's own row: it misses.
    await pick(0)
    await expect(dino(page)).toHaveAttribute('data-level', '1', { timeout: 10_000 })
    await expect(dino(page)).toHaveAttribute('data-dir', 'left')
  })

  test('clicking it makes it roar: a RAWR bubble, a backflip and a new colour', async ({
    page,
  }) => {
    await dinoTiming(page, { reactions: ['flip'] })
    await onTopRow(page)
    const colour = () =>
      dino(page).evaluate((el) => getComputedStyle(el).getPropertyValue('--dino-body').trim())
    const before = await colour()
    // A backflip needs it walking (mid-hop a click only roars), so click it
    // where it is, while it walks.
    await pokeWalking(page)
    await expect(dino(page)).toHaveAttribute('data-roars', '1')
    await expect(dino(page)).toHaveAttribute('data-mode', 'flip')
    await expect(roarBubble(page)).toBeVisible()
    expect(await colour()).not.toBe(before)
    // It lands and walks on, the bubble gone.
    await expect(dino(page)).toHaveAttribute('data-mode', 'walk')
    await expect(roarBubble(page)).toHaveCount(0)
    await pokeDino(page)
    await expect(dino(page)).toHaveAttribute('data-roars', '2')
  })

  test('each click does something different: falls, then dashes the other way', async ({ page }) => {
    await dinoTiming(page, { reactions: ['fall', 'dash'] })
    await onTopRow(page)
    // Falls straight through its row.
    await pokeWalking(page)
    await expect(dino(page)).toHaveAttribute('data-reaction', 'fall')
    await expect(dino(page)).toHaveAttribute('data-mode', 'fall')
    await expect(dino(page)).toHaveAttribute('data-level', '1', { timeout: 5_000 })
    await expect(dino(page)).toHaveAttribute('data-mode', 'walk')
    // Dashes the other way, fast.
    const dir = await dino(page).getAttribute('data-dir')
    await pokeWalking(page)
    await expect(dino(page)).toHaveAttribute('data-reaction', 'dash')
    await expect(dino(page)).not.toHaveAttribute('data-dir', dir!)
  })

  // Every frame's position in the panel, recorded in the page, and the frames
  // where it moved further than it ever can in one frame: a teleport. Only
  // moves seen inside the panel count (its comings and goings off the sides,
  // the drop-in from above and its time away are out of sight). Up and down
  // it is measured from the top of the row it is on, or lands on, so a row
  // that moves (a card resized around rows anchored to its bottom, or a
  // window resize that lays the rows out again just as it lands) carries it
  // fairly.
  // Across, on its row, it is measured from the row's tiles too: it rides
  // them, and on a slow frame (WebKit on a busy CI runner can stall for
  // seconds while the window resizes) they carry it 50px and more in one
  // frame without it ever leaving its tile.
  type Move = {
    x: number
    y: number
    w: number
    h: number
    mode: string
    level: string
    /** Every row's top in the panel (its first tile's). */
    tops: number[]
    /** The row's first track's left edge in the panel, and one loop copy's width. */
    track: number | null
    period: number | null
  }
  const recordMoves = (page: Page) =>
    dino(page).evaluate((el) => {
      const panel = el.closest('[data-dino-panel]')!
      const moves: Move[] = []
      ;(window as unknown as { dinoMoves: typeof moves }).dinoMoves = moves
      const step = () => {
        const m = new DOMMatrix(getComputedStyle(el).transform)
        const box = panel.getBoundingClientRect()
        const rows = [...panel.querySelectorAll('[data-marquee-row]')]
        const tops = rows.map((r) => (r.querySelector('figure')?.getBoundingClientRect().top ?? NaN) - box.top)
        const rowEl = rows[Number(el.dataset.level)]
        const [first, second] = rowEl ? [...rowEl.children] : []
        const track = first ? first.getBoundingClientRect().left - box.left : null
        const period = first && second ? second.getBoundingClientRect().left - first.getBoundingClientRect().left : null
        moves.push({ x: m.m41, y: m.m42, w: box.width, h: box.height, mode: el.dataset.mode!, level: el.dataset.level!, tops, track, period })
        requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    })
  const teleports = async (page: Page) => {
    const moves = await page.evaluate(() => (window as unknown as { dinoMoves: Move[] }).dinoMoves)
    const seen = (m: Move) => m.mode !== 'away' && m.level !== '-1' && m.x >= 0 && m.x <= m.w - 48 && m.y >= 0 && m.y <= m.h
    const jumps: string[] = []
    for (let i = 1; i < moves.length; i++) {
      const [a, b] = [moves[i - 1], moves[i]]
      if (!seen(a) || !seen(b)) continue
      // Its fastest move (a dash on a slow frame) is under 50px a frame.
      // On its row (not falling or leaping between rows), it moves with the row.
      const onRow = (m: Move) => ['walk', 'flip', 'hop', 'drop', 'miss'].includes(m.mode)
      // Measured from the row it ends the frame on (it can land on a row
      // that moved this very frame), else the one it starts on (it can move
      // with its row and step off a tile into a fall in the same frame). In
      // the air it is measured in the panel.
      const ref = onRow(b) ? Number(b.level) : onRow(a) ? Number(a.level) : -1
      const [topA, topB] = [a.tops[ref], b.tops[ref]]
      const dy = Number.isFinite(topA) && Number.isFinite(topB) ? b.y - topB - (a.y - topA) : b.y - a.y
      // The row's own travel this frame, which it rides walking, hopping off,
      // flipping or missing. Only while the panel and its tiles keep their
      // size: a resize lays the tracks out again somewhere else in the panel,
      // and it rightly stays put then. The loop jumps a track back by one
      // copy each time round: the travel is the step under half a copy.
      let travel = 0
      if (
        a.level === b.level &&
        ['walk', 'flip', 'hop', 'miss'].includes(a.mode) &&
        a.w === b.w &&
        a.h === b.h &&
        a.track !== null &&
        b.track !== null &&
        a.period !== null &&
        b.period !== null &&
        Math.abs(a.period - b.period) <= 1
      ) {
        travel = b.track - a.track
        if (travel > a.period / 2) travel -= a.period
        else if (travel < -a.period / 2) travel += a.period
      }
      if (Math.abs(b.x - a.x - travel) > 60 || Math.abs(dy) > 60)
        jumps.push(`${a.mode}@${a.level} (${a.x.toFixed(0)}, ${a.y.toFixed(0)}) -> ${b.mode}@${b.level} (${b.x.toFixed(0)}, ${b.y.toFixed(0)})`)
    }
    return jumps
  }

  test('never teleports when clicked: every reaction moves it in plain sight', async ({ page }) => {
    // Ten reactions, each waited out in pokeWalking (up to 30s apiece: a fall
    // off the bottom row drops it back in from the top). Where frames come
    // slowly (WebKit under load) its capped clock runs far behind the test's,
    // and ten of them don't fit the 30s default test timeout.
    test.setTimeout(120_000)
    await onTopRow(page)
    await recordMoves(page)
    const reactions = new Set<string>()
    for (let i = 0; i < 10; i++) {
      await pokeWalking(page)
      reactions.add((await dino(page).getAttribute('data-reaction'))!)
      await page.waitForTimeout(700)
    }
    expect([...reactions].filter((r) => !['flip', 'fall', 'leap', 'dash'].includes(r))).toEqual([])
    expect(await teleports(page)).toEqual([])
  })

  test('never teleports or gets flung when the window is resized', async ({ page, isMobile }) => {
    // A desktop window being resized: a phone's window doesn't resize like this.
    test.skip(isMobile, 'desktop windows only')
    await onTopRow(page)
    await recordMoves(page)
    for (const width of [1100, 1440, 1000, 1440, 1200, 1440]) {
      await page.setViewportSize({ width, height: 900 })
      await page.waitForTimeout(700)
    }
    expect(await teleports(page)).toEqual([])
  })

  test('keeps landing on the rows when they are swapped for new ones after it measured them', async ({ page }) => {
    await dinoTiming(page, { reactions: ['fall'] })
    await onTopRow(page)
    // As when React replaces the rows (hydrating, or re-rendering the marquee):
    // the elements it measured leave the page and new ones take their place.
    await page.locator('[data-dino-panel] [data-marquee-row]').evaluateAll((rows) =>
      rows.forEach((row) => row.replaceWith(row.cloneNode(true)))
    )
    await pokeWalking(page)
    await expect(dino(page)).toHaveAttribute('data-reaction', 'fall')
    await expect(dino(page)).toHaveAttribute('data-level', '1', { timeout: 5_000 })
    await expect(dino(page)).toHaveAttribute('data-mode', 'walk')
  })

  test('leaps up to the row above when clicked on the lower row', async ({ page }) => {
    await dinoTiming(page, { reactions: ['fall', 'leap'] })
    await onTopRow(page)
    await pokeWalking(page)
    await expect(dino(page)).toHaveAttribute('data-level', '1', { timeout: 5_000 })
    await expect(dino(page)).toHaveAttribute('data-mode', 'walk')
    await pokeWalking(page)
    await expect(dino(page)).toHaveAttribute('data-reaction', 'leap')
    await expect(dino(page)).toHaveAttribute('data-mode', 'climb')
  })

  test('shouts a different word each click, and turns rainbow on the 5th', async ({ page }) => {
    await dinoTiming(page, { reactions: ['dash'] })
    await onTopRow(page)
    const words: string[] = []
    for (let i = 0; i < 5; i++) {
      await pokeWalking(page)
      await expect(dino(page)).toHaveAttribute('data-roars', String(i + 1))
      words.push((await dino(page).getAttribute('data-roar'))!)
      await expect(roarBubble(page)).toHaveCount(1)
    }
    // Never the same word twice in a row, and more than one word in all.
    for (let i = 1; i < words.length; i++) expect(words[i], words.join(', ')).not.toBe(words[i - 1])
    expect(new Set(words).size).toBeGreaterThan(1)
    await expect(dino(page)).toHaveAttribute('data-rainbow', 'true')
  })

  test('once back in from a side, it walks well into the panel before turning or leaving', async ({
    page,
    browserName,
  }) => {
    // A long game-logic check, the same in every engine: Chromium only. In CI,
    // Firefox and WebKit can deliver animation frames a second or more apart,
    // and the dino's per-frame step cap (so a stall can't fling it) then slows
    // its clock far below the test's, so a 45s wait can pass with few moves.
    test.skip(browserName !== 'chromium', 'game logic, checked in Chromium (slow CI frames elsewhere)')
    // Its polls allow up to a minute; the 30s default test timeout would cut them short.
    test.setTimeout(90_000)
    // Short stays, so it would turn or leave at once if it could: it leaves,
    // comes back in from a side, and wants to turn straight away.
    await dinoTiming(page, {
      roam: true,
      stay: [0.05, 0.1],
      firstLineAfter: 600,
      choices: ['exit', 'turn'],
      entries: ['left', 'right'],
    })
    await page.goto(STACK_PAGE)
    await showKit(page, '[data-dino-panel]')
    await expect(dino(page)).toHaveAttribute('data-mode', 'walk', { timeout: 10_000 })
    // Each side entry: where it came in, and where it made its first choice.
    await dino(page).evaluate((el) => {
      const panel = el.closest('[data-dino-panel]')!.getBoundingClientRect()
      const out: { from: number; turnedAt: number }[] = []
      ;(window as unknown as { dinoEntries: typeof out }).dinoEntries = out
      let last = { mode: el.dataset.mode, dir: el.dataset.dir }
      let entry: { from: number; dir: string } | null = null
      const xNow = () => new DOMMatrix(getComputedStyle(el).transform).m41
      new MutationObserver(() => {
        const mode = el.dataset.mode
        const dir = el.dataset.dir!
        const x = xNow()
        if (last.mode === 'away' && mode === 'walk' && (x < 0 || x > panel.width - 10))
          entry = { from: x, dir }
        else if (entry && mode === 'fall')
          entry = null // missed a jump: not a choice
        else if (entry && (dir !== entry.dir || ['climb', 'drop', 'away'].includes(mode!))) {
          // Its first choice since coming in: turning round, changing rows or leaving.
          out.push({ from: entry.from, turnedAt: x })
          entry = null
        }
        last = { mode, dir }
      }).observe(el, { attributes: true })
    })
    const entries = () =>
      page.evaluate(
        () =>
          (window as unknown as { dinoEntries: { from: number; turnedAt: number }[] }).dinoEntries
      )
    await expect
      .poll(async () => (await entries()).length, { timeout: 60_000 })
      .toBeGreaterThanOrEqual(2)
    const width = await page
      .locator('[data-dino-panel]')
      .evaluate((el) => el.getBoundingClientRect().width)
    for (const e of await entries()) {
      expect(
        Math.abs(e.turnedAt - e.from),
        `came in at ${e.from.toFixed(0)}, chose at ${e.turnedAt.toFixed(0)}`
      ).toBeGreaterThanOrEqual(width * 0.3)
    }
  })

  test('the scoreboards sit in a band the dino never enters, even mid-flip during a round', async ({ page }) => {
    await dinoTiming(page, { reactions: ['flip', 'dash', 'flip', 'fall'] })
    await onTopRow(page)
    await recordMoves(page)
    for (let i = 0; i < 8; i++) {
      await pokeWalking(page)
      await page.waitForTimeout(800)
    }
    await expect(page.locator('[data-dino-score]')).toHaveAttribute('data-shown', 'true')
    await expect(page.locator('[data-dino-best]')).toHaveAttribute('data-shown', 'true')
    const band = await page.evaluate(() => {
      const panel = document.querySelector('[data-dino-panel]')!.getBoundingClientRect()
      const box = document.querySelector('[data-dino-score]')!.parentElement!.getBoundingClientRect()
      return box.bottom - panel.top
    })
    const moves = await page.evaluate(
      () => (window as unknown as { dinoMoves: { y: number; mode: string; level: string }[] }).dinoMoves
    )
    // Its top edge (the transform's y) while it is on, or leaping between, the rows.
    const inBand = moves.filter((m) => m.level !== '-1' && m.mode !== 'away' && m.y < band)
    expect(inBand.map((m) => `${m.mode}@${m.level} top ${m.y.toFixed(0)} above ${band.toFixed(0)}`)).toEqual([])
    // And nothing of it can show up there anyway: the stage is clipped below the band.
    const clip = await dino(page).evaluate((el) => getComputedStyle(el.parentElement!).clipPath)
    expect(Number(clip.match(/inset\((\d+)/)?.[1])).toBeGreaterThanOrEqual(band)
  })

  test('a click is a catch: it never shouts that it was missed', async ({ page }) => {
    await dinoTiming(page, { reactions: ['dash'] })
    await onTopRow(page)
    const words = new Set<string>()
    for (let i = 0; i < 12; i++) {
      await pokeDino(page)
      await expect(dino(page)).toHaveAttribute('data-roars', String(i + 1))
      words.add((await dino(page).getAttribute('data-roar'))!)
    }
    expect([...words].filter((w) => /MISS|SLOW|NOPE|CATCH ME/.test(w))).toEqual([])
    // Nearly all of them came round (a shuffled bag of six over twelve clicks;
    // one can be skipped to avoid saying the same word twice in a row).
    expect(words.size).toBeGreaterThanOrEqual(5)
  })

  test('the countdown drains, turns red for the last seconds, and gives way to the result', async ({ page }) => {
    await dinoTiming(page, { reactions: ['dash'], round: 7 })
    await onTopRow(page)
    const timer = page.locator('[data-dino-timer]')
    const scale = () =>
      page.locator('[data-dino-timer] span[aria-hidden]').evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).a)
    await expect(timer).toHaveAttribute('data-shown', 'false')
    await pokeDino(page)
    await expect(timer).toHaveAttribute('data-shown', 'true')
    await expect(page.locator('[data-dino-timer-text]')).toHaveText(/^0:0[67]$/)
    await expect(timer).toHaveAttribute('data-urgent', 'false')
    const full = await scale()
    // The last five seconds: red, and the bar keeps draining.
    await expect(timer).toHaveAttribute('data-urgent', 'true', { timeout: 6_000 })
    expect(await scale()).toBeLessThan(full)
    // Time: the countdown goes, the result shows.
    await expect(timer).toHaveAttribute('data-shown', 'false', { timeout: 10_000 })
    await expect(page.locator('[data-dino-score]')).toHaveText(/^Time! 1 catch/)
  })

  test('a round lasts its full time and no longer, even when frames come slowly', async ({ page }) => {
    // A device that can't keep up: every frame spends 150 ms of main-thread
    // work, so frames come about three times slower than the dino's capped
    // step. The round runs on real time, so 7 s is still 7 s.
    await slowFrames(page, 150)
    await dinoTiming(page, { reactions: ['dash'], round: 7 })
    await onTopRow(page)
    const timer = page.locator('[data-dino-timer]')
    await pokeDino(page)
    await expect(timer).toHaveAttribute('data-shown', 'true')
    const started = Date.now()
    await expect(timer).toHaveAttribute('data-shown', 'false', { timeout: 20_000 })
    const took = (Date.now() - started) / 1000
    expect(took, 'seconds the 7 s round took').toBeGreaterThan(6)
    expect(took, 'seconds the 7 s round took').toBeLessThan(9)
  })

  test("a round sends its start and score to the game stats, without cookies, and shows the record", async ({ page }) => {
    await dinoTiming(page, { reactions: ['dash'], round: 7 })
    const sent: { body: unknown; cookie: string | null }[] = []
    await page.route('**/api/game', async (route) => {
      const request = route.request()
      const body = JSON.parse(request.postData() ?? 'null')
      sent.push({ body, cookie: await request.headerValue('cookie') })
      await route.fulfill({
        json: body?.type === 'start' ? { round: 'b'.repeat(24), record: 42 } : { result: 'counted' },
      })
    })
    await onTopRow(page)
    await pokeDino(page)
    await expect.poll(() => sent.length).toBe(1)
    expect(sent[0].body).toEqual({ type: 'start' })
    // The all-time record shows beside the player's own best.
    await expect(page.locator('[data-dino-best]')).toHaveText('Best 1 · Record 42')
    // The round ends: its score goes with the round's id.
    await expect.poll(() => sent.length, { timeout: 15_000 }).toBe(2)
    expect(sent[1].body).toEqual({ type: 'end', round: 'b'.repeat(24), score: 1 })
    expect(sent.every((s) => s.cookie === null)).toBe(true)
  })

  test('the first click starts a catch round with a scoreboard', async ({ page }) => {
    await dinoTiming(page, { reactions: ['flip'] })
    await onTopRow(page)
    const score = page.locator('[data-dino-score]')
    await expect(score).toHaveAttribute('data-shown', 'false')
    await pokeDino(page)
    await expect(dino(page)).toHaveAttribute('data-game', 'on')
    await expect(dino(page)).toHaveAttribute('data-catches', '1')
    await expect(score).toHaveAttribute('data-shown', 'true')
    await expect(score).toHaveText('Catches 1')
    await expect(page.locator('[data-dino-timer]')).toHaveAttribute('data-shown', 'true')
    await expect(page.locator('[data-dino-timer-text]')).toHaveText(/^0:(30|29)$/)
    // The best score shows beside it while a round is on, lit as this round passes it.
    const best = page.locator('[data-dino-best]')
    await expect(best).toHaveAttribute('data-shown', 'true')
    await expect(best).toHaveText(/^Best \d+$/)
    await expect(dino(page)).toHaveAttribute('data-mode', 'walk')
    await pokeDino(page)
    await expect(dino(page)).toHaveAttribute('data-catches', '2')
    await expect(score).toHaveText('Catches 2')
  })

  test('says its lines now and then, each once per visit', async ({ page }) => {
    // Shortened waits; one line per page view, so each view shows the next.
    // A line needs a moment of its walking in plain view, and its clock is
    // capped per frame: a busy machine starving it of frames slows it down,
    // so the waits are generous.
    test.setTimeout(90_000)
    await dinoTiming(page, { firstLineAfter: 0.3, lineGap: [600, 600] })
    await page.goto(STACK_PAGE)
    await showKit(page, '[data-dino-panel]')
    // The first hints at the click; it stops to say it.
    await expect(dino(page)).toHaveAttribute('data-line', '0', { timeout: 30_000 })
    await expect(page.locator('[data-dino-bubble="line-0"]')).toBeVisible()
    await expect(dino(page)).toHaveAttribute('data-mode', 'walk')
    // Back again in the same visit (same tab): it picks up with the next line.
    // A reload, not a goto to the same URL (Firefox can leave that one still
    // navigating); showKit undoes the scroll position the reload restores.
    await page.reload()
    await showKit(page, '[data-dino-panel]')
    await expect(dino(page)).toHaveAttribute('data-line', '1', { timeout: 30_000 })
    await expect(page.locator('[data-dino-bubble="line-1"]')).toBeVisible()
  })

  test('says its first line soon after it comes into view', async ({ page }) => {
    // The real wait, not a shortened one: a visitor scrolling to it sees it.
    // It talks after a second of walking in clear view, counted on its own
    // capped clock, so where frames come slowly (WebKit without a GPU, about
    // 10 fps) the walk in and that second take twice as long: allow 12 s.
    await page.goto(STACK_PAGE)
    await showKit(page, '[data-dino-panel]')
    await expect(dino(page)).toHaveAttribute('data-line', '0', { timeout: 12_000 })
    await expect(page.locator('[data-dino-bubble="line-0"]')).toBeVisible()
  })

  test('roams: leaps up, drops down, turns round, and comes back in from elsewhere', async ({
    page,
    browserName,
  }) => {
    // A long game-logic check, the same in every engine: Chromium only. In CI,
    // Firefox and WebKit can deliver animation frames a second or more apart,
    // and the dino's per-frame step cap (so a stall can't fling it) then slows
    // its clock far below the test's, so a 45s wait can pass with few moves.
    test.skip(browserName !== 'chromium', 'game logic, checked in Chromium (slow CI frames elsewhere)')
    // Its polls allow up to a minute; the 30s default test timeout would cut them short.
    test.setTimeout(90_000)
    // Short stays so it chooses often; no lines to stop it. Its choices and
    // ways back in go round in a fixed order (change rows, turn, change, turn,
    // leave; in from the left, the right, then above), so every move comes up
    // within a few cycles instead of whenever the shuffle allows.
    await dinoTiming(page, {
      roam: true,
      stay: [0.2, 0.4],
      firstLineAfter: 600,
      choices: ['change', 'turn', 'change', 'turn', 'exit'],
      entries: ['left', 'right', 'drop'],
    })
    await page.goto(STACK_PAGE)
    await showKit(page, '[data-dino-panel]')
    await expect(dino(page)).toHaveAttribute('data-mode', 'walk', { timeout: 10_000 })
    await dino(page).evaluate((el) => {
      const seen = new Set<string>()
      ;(window as unknown as { dinoSeen: Set<string> }).dinoSeen = seen
      const note = () => {
        seen.add(el.dataset.mode!)
        if (el.dataset.mode === 'walk') seen.add(`walk@${el.dataset.level}:${el.dataset.dir}`)
      }
      note()
      new MutationObserver(note).observe(el, { attributes: true })
    })
    const seen = () =>
      page.evaluate(() => [...(window as unknown as { dinoSeen: Set<string> }).dinoSeen])
    for (const want of [
      'climb',
      'drop',
      'away',
      'walk@0:right',
      'walk@0:left',
      'walk@1:right',
      'walk@1:left',
    ])
      await expect.poll(seen, { message: `it gets to ${want}`, timeout: 45_000 }).toContain(want)
  })

  // Every mode, level and way it faces, in order (a repeat only once).
  const recordRoaming = (page: Page) =>
    dino(page).evaluate((el) => {
      const log: string[] = []
      ;(window as unknown as { roamLog: string[] }).roamLog = log
      const note = () => {
        const now = `${el.dataset.mode}@${el.dataset.level}:${el.dataset.dir}`
        if (log.at(-1) !== now) log.push(now)
      }
      note()
      new MutationObserver(note).observe(el, { attributes: true })
    })
  const roamLog = (page: Page) =>
    page.evaluate(() => (window as unknown as { roamLog: string[] }).roamLog)

  // About 20 frames a second, where each of its capped steps is most of the
  // way it looks ahead for a tile's edge: a step often takes its feet just
  // past the edge it then turns round or chooses at.
  test('turning round at the end of a tile, it stays on it, even when frames come slowly', async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== 'chromium', 'game logic, checked in Chromium (slow CI frames elsewhere)')
    test.setTimeout(60_000)
    await slowFrames(page, 40)
    // It only ever chooses to turn round (and turns back from the side fades).
    await dinoTiming(page, { roam: true, stay: [0.1, 0.2], firstLineAfter: 60_000, choices: ['turn'] })
    await onTopRow(page)
    await recordRoaming(page)
    const turns = async () => {
      const log = await roamLog(page)
      return log.filter((now, i) => i > 0 && now.startsWith('walk@') && log[i - 1].startsWith('walk@')).length
    }
    await expect.poll(turns, { message: 'it turns round', timeout: 45_000 }).toBeGreaterThanOrEqual(8)
    // Never into a gap: only walking and hopping, all along the top row.
    const log = await roamLog(page)
    expect(log.filter((now) => !/^(walk|hop)@0:/.test(now))).toEqual([])
  })

  test('choosing to leave, it hops on along its row and off the side, even when frames come slowly', async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== 'chromium', 'game logic, checked in Chromium (slow CI frames elsewhere)')
    test.setTimeout(60_000)
    await slowFrames(page, 40)
    // It only ever chooses to leave, and comes back in on the top row.
    await dinoTiming(page, {
      roam: true,
      stay: [0.1, 0.2],
      firstLineAfter: 60_000,
      choices: ['exit'],
      entries: ['drop'],
    })
    await onTopRow(page)
    await recordRoaming(page)
    const leaves = async () => (await roamLog(page)).filter((now) => now.startsWith('away@')).length
    await expect.poll(leaves, { message: 'it leaves', timeout: 45_000 }).toBeGreaterThanOrEqual(3)
    // Off the side of the top row each time, never down through a gap in it
    // (it only falls dropping back in from above).
    const log = await roamLog(page)
    expect(log.filter((now) => !/^((walk|hop|away)@0|fall@-1):/.test(now))).toEqual([])
  })

  test('skips the click hint once it has been clicked', async ({ page }) => {
    // Long enough a first wait to click before it. The click flips it, so it
    // stays on the top row: a fall or a dash can leave it walking against the
    // bottom row near an edge, where it doesn't talk, and where frames come
    // slowly (its walk is capped, the row's carry isn't) it can stay there.
    await dinoTiming(page, { firstLineAfter: 1.5, lineGap: [600, 600], reactions: ['flip'] })
    await onTopRow(page)
    await pokeDino(page)
    await expect(dino(page)).toHaveAttribute('data-roars', '1')
    // A second and a half of walking in clear view, on its capped clock.
    await expect(dino(page)).toHaveAttribute('data-line', '1', { timeout: 30_000 })
  })

  test('the tiles cannot be selected by a double or triple click, and still take keyboard focus', async ({ page }) => {
    await page.goto(STACK_PAGE)
    await showKit(page, '[data-dino-panel]')
    // Hovering the middle of a row pauses it (it never holds still otherwise),
    // then a double click there, which would select a word anywhere else.
    const row = (await page.locator('[data-dino-panel] [data-marquee-row]').first().boundingBox())!
    await page.mouse.move(row.x + row.width / 2, row.y + row.height / 2)
    await page.waitForTimeout(300)
    // The tile nearest the middle of the paused row, and the middle of its name.
    const [cx, cy] = await page.evaluate(() => {
      const names = [...document.querySelectorAll<HTMLElement>('[data-dino-panel] [data-marquee-row] [data-tile-name]')]
      const mid = innerWidth / 2
      const box = names
        .map((el) => el.getBoundingClientRect())
        .sort((a, b) => Math.abs(a.x + a.width / 2 - mid) - Math.abs(b.x + b.width / 2 - mid))[0]
      return [box.x + box.width / 2, box.y + box.height / 2]
    })
    // Set on the whole panel (Firefox and WebKit report a child's own value as
    // "auto" even though the panel's applies to it, so what counts is below:
    // nothing gets selected).
    expect(await page.locator('[data-dino-panel]').evaluate((el) => getComputedStyle(el).userSelect)).toBe('none')
    // A double and a triple click would select a word, then the whole line, anywhere else.
    // (A triple click can leave an empty line break selected in the card around
    // the panel: no text, nothing highlighted.)
    await page.mouse.dblclick(cx, cy)
    expect(await page.evaluate(() => String(getSelection()).trim())).toBe('')
    await page.mouse.click(cx, cy, { clickCount: 3 })
    expect(await page.evaluate(() => String(getSelection()).trim())).toBe('')
    const tile = page.locator('[data-dino-panel] figure[tabindex="0"]').first()
    await tile.focus()
    await expect(tile).toBeFocused()
  })

  // The middle of the tile nearest the middle of a row (paused by hovering it
  // first), measured in the panel: the row runs far past its edges, clipped.
  const middleTile = async (page: Page, index: number) => {
    await hoverRow(page, index)
    await page.waitForTimeout(300)
    return page.evaluate((index) => {
      const panel = document.querySelector('[data-dino-panel]')!.getBoundingClientRect()
      const row = document.querySelectorAll('[data-dino-panel] [data-marquee-row]')[index]
      const mid = panel.left + panel.width / 2
      const box = [...row.querySelectorAll('figure')]
        .map((el) => el.getBoundingClientRect())
        .sort((a, b) => Math.abs(a.x + a.width / 2 - mid) - Math.abs(b.x + b.width / 2 - mid))[0]
      return { x: box.x + box.width / 2, y: box.y + box.height / 2 }
    }, index)
  }
  const rowPlayStates = (page: Page, index: number) =>
    page.evaluate(
      (index) =>
        [...document.querySelectorAll('[data-dino-panel] [data-marquee-row]')[index].children].map(
          (track) => getComputedStyle(track).animationPlayState
        ),
      index
    )

  test('hovering a tile shows what it is for', async ({ page, hasTouch }) => {
    test.skip(hasTouch, 'no hover on a touch screen (a tap shows it, below)')
    await page.goto(STACK_PAGE)
    await showKit(page, '[data-dino-panel]')
    const at = await middleTile(page, 1)
    await page.mouse.move(at.x, at.y)
    const description = page.locator('[data-dino-panel] figure:hover .description')
    await expect(description).toHaveCSS('opacity', '1')
    await expect(description).not.toBeEmpty()
  })

  test('clicking a tile does nothing: its row runs again once the pointer leaves', async ({ page, hasTouch }) => {
    test.skip(hasTouch, 'a tap pauses the row on purpose (see above)')
    await page.goto(STACK_PAGE)
    await showKit(page, '[data-dino-panel]')
    const at = await middleTile(page, 0)
    await page.mouse.click(at.x, at.y)
    // Held by the hover (WebKit can take a frame or two to apply it).
    await expect.poll(() => rowPlayStates(page, 0)).toContain('paused')
    // The click left no focus behind to hold the row (or its description) open.
    await page.mouse.move(5, 5)
    await expect.poll(() => rowPlayStates(page, 0)).not.toContain('paused')
    expect(await page.evaluate(() => document.activeElement?.tagName)).not.toBe('FIGURE')
  })

  test('a tapped tile shows what it is for and holds its row', async ({ page, hasTouch }) => {
    test.skip(!hasTouch, 'touch screens only')
    await page.goto(STACK_PAGE)
    await showKit(page, '[data-dino-panel]')
    // The tile nearest the middle of the bottom row (copies included: any tile takes a tap).
    const at = await page.evaluate(() => {
      const panel = document.querySelector('[data-dino-panel]')!.getBoundingClientRect()
      const row = document.querySelectorAll('[data-dino-panel] [data-marquee-row]')[1]
      const mid = panel.left + panel.width / 2
      const box = [...row.querySelectorAll('figure')]
        .map((el) => el.getBoundingClientRect())
        .sort((a, b) => Math.abs(a.x + a.width / 2 - mid) - Math.abs(b.x + b.width / 2 - mid))[0]
      return { x: box.x + box.width / 2, y: box.y + box.height / 2 }
    })
    await page.touchscreen.tap(at.x, at.y)
    await expect(page.locator('[data-dino-panel] figure:focus .description')).toHaveCSS('opacity', '1')
    await expect.poll(() => rowPlayStates(page, 1)).not.toContain('running')
  })

  test('both rows move at the same pace, however many tiles each has', async ({ page }) => {
    await page.goto(STACK_PAGE)
    const speeds = () =>
      page.locator('[data-dino-panel] [data-marquee-row]').evaluateAll((rows) =>
        rows.map((row) => {
          const track = row.children[0] as HTMLElement
          const gap = parseFloat(getComputedStyle(row).columnGap)
          return (track.offsetWidth + gap) / parseFloat(getComputedStyle(track).animationDuration)
        })
      )
    await expect.poll(async () => (await speeds()).length).toBe(2)
    const pace = await speeds()
    for (const speed of pace) expect(speed, `row speeds ${pace.map(Math.round).join(', ')} px/s`).toBeGreaterThan(18)
    for (const speed of pace) expect(speed, `row speeds ${pace.map(Math.round).join(', ')} px/s`).toBeLessThan(26)
  })

  test('the gaps it hops and falls through are clearly wider than it is', async ({ page }) => {
    await page.goto(STACK_PAGE)
    await showKit(page, '[data-dino-panel]')
    await expect(dino(page)).toHaveCount(1)
    const m = await page.locator('[data-dino-panel]').evaluate((panel) => {
      const rows = [...panel.querySelectorAll('[data-marquee-row]')]
      const tiles = rows.map((row) =>
        [...row.querySelectorAll('figure')].map((f) => f.getBoundingClientRect())
      )
      const dino = panel.querySelector('[data-dino]')!.getBoundingClientRect()
      return {
        across: tiles[0][1].left - tiles[0][0].right,
        between: tiles[1][0].top - tiles[0][0].bottom,
        width: dino.width,
        height: dino.height,
      }
    })
    expect(m.across, 'gap between tiles vs the dino').toBeGreaterThanOrEqual(m.width + 6)
    expect(m.between, 'gap between the rows vs the dino').toBeGreaterThanOrEqual(m.height + 6)
  })
})

test.describe('dino easter egg (reduced motion)', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } })

  test("shows n8builds.dev's tiles: the AI kit, then the dev stack", async ({ page }) => {
    await page.goto(STACK_PAGE)
    const ai = page.getByRole('region', { name: 'AI kit' })
    for (const tool of ['Claude Code', 'Claude Opus 5.5', 'ChatGPT', 'whisper.cpp', 'Hugging Face']) {
      await expect(ai.getByText(tool, { exact: true })).toHaveCount(1)
    }
    const dev = page.getByRole('region', { name: 'Dev stack' })
    for (const tool of ['Next.js', 'React', 'Firebase', 'AWS', 'Playwright', 'GitHub Actions', 'Figma']) {
      await expect(dev.getByText(tool, { exact: true })).toHaveCount(1)
    }
    // Dropped as filler or dated (the owner's call, 2026-10-29).
    for (const dropped of ['HTML5', 'CSS3', 'ES6+', 'Recoil', 'Material-UI', 'Paypal API', 'Postman', 'Jest', 'MySQL', 'Stripe API', 'GraphQL', 'AWS Amplify', 'Prisma', 'REST APIs']) {
      await expect(page.locator('[data-dino-panel]').getByText(dropped, { exact: true })).toHaveCount(0)
    }
  })

  test('the wrapped tiles keep the default spacing', async ({ page }) => {
    await page.goto(STACK_PAGE)
    const gap = await page
      .getByRole('region', { name: 'AI kit' })
      .evaluate((row) => getComputedStyle(row).columnGap)
    expect(gap).toBe('16px')
  })

  test('is not shown or loaded', async ({ page }) => {
    await page.goto(STACK_PAGE)
    await showKit(page, '[data-dino-panel]')
    await page.waitForTimeout(1500)
    await expect(dino(page)).toHaveCount(0)
  })
})
