import { readFileSync } from 'node:fs'
import { test, expect, type Page } from './fixtures/test'
import ts from 'typescript'

// The tech stack card (and its dino) is on /stack here (owner, 2026-11-08); n8builds.dev's copy runs on its home page.
const STACK_PAGE = '/stack'

/**
 * On /stack the play area sits near the top, inside the game's load margin, so
 * a test that needs the panel far off screen first pushes it down the page
 * (a style for the test only; n8builds.dev's kit is far down its home page).
 */
const pushPanelDown = (page: import('@playwright/test').Page) =>
  page.addInitScript(() => {
    document.addEventListener('DOMContentLoaded', () => {
      const style = document.createElement('style')
      style.textContent = '[data-dino-panel] { margin-top: 0 } section:has(> [data-dino-panel]) { margin-top: 3000px !important }'
      document.head.append(style)
    })
  })


/**
 * The dino game's optional music (components/features/dino/DinoMusic.tsx and
 * music.ts): a toggle in the top right corner of the game panel. Headless
 * browsers make no sound, so an init script spies on Web Audio instead: it
 * counts the AudioContexts made and the oscillators started (one per note).
 * It also mutes them (and playwright.config.ts gives the browsers no sound
 * device), so no test run is ever heard.
 * The sound itself is checked by the numbers: the synth renders offline (an
 * OfflineAudioContext in a blank page) and nothing is ever played out loud.
 *
 * The music files are byte-identical with n8builds.dev's (`npm run
 * check:sync`), so this is n8builds-web's tests/e2e/dino-music.spec.ts, run
 * against this site's tech stack card. Keep them in step.
 */

const PANEL = '[data-dino-panel]'
const dino = (page: Page) => page.locator('[data-dino]')
const music = (page: Page) => page.getByRole('button', { name: 'Game music' })
// The toggle is disabled until hydrated, so a press is never lost.
const hydratedMusic = async (page: Page) => {
  await expect(music(page)).toBeEnabled({ timeout: 15_000 })
  return music(page)
}

interface AudioSpy {
  contexts: number
  starts: number
  ctx: AudioContext | null
}
const spyOnAudio = (page: Page) =>
  page.addInitScript(() => {
    const spy: AudioSpy = { contexts: 0, starts: 0, ctx: null }
    const w = window as unknown as { __audio: AudioSpy; AudioContext: typeof AudioContext }
    w.__audio = spy
    const Real = w.AudioContext
    if (!Real) return
    // Silent: everything the page connects to the speakers goes through a
    // gain of 0 first, so a test run can never be heard (under WSLg even a
    // headless browser plays through the Windows speakers). And on its own
    // clock: a test machine may have no sound device (CI, or PULSE_SERVER
    // pointing nowhere), where a real context never starts running. Its state
    // and time follow the page's own resume() and suspend() calls, as a real
    // context's do on a machine that can play, so the tests check what the
    // page asks for and the notes it schedules.
    const realClose = Real.prototype.close
    w.AudioContext = class extends Real {
      constructor(options?: AudioContextOptions) {
        super(options)
        spy.contexts++
        spy.ctx = this
        const silent = super.createGain()
        silent.gain.value = 0
        silent.connect(super.destination)
        // Made in a click, so running, as browsers start it then.
        let state: AudioContextState = 'running'
        let clock = 0
        let since = performance.now()
        const now = () => (state === 'running' ? clock + (performance.now() - since) / 1000 : clock)
        Object.defineProperties(this, {
          destination: { value: silent },
          state: { get: () => state },
          currentTime: { get: now },
          resume: {
            value: async () => {
              if (state === 'suspended') {
                since = performance.now()
                state = 'running'
              }
            },
          },
          suspend: {
            value: async () => {
              if (state === 'running') {
                clock = now()
                state = 'suspended'
              }
            },
          },
          close: {
            value: () => {
              clock = now()
              state = 'closed'
              return realClose.call(this)
            },
          },
        })
      }
    }
    const start = OscillatorNode.prototype.start
    OscillatorNode.prototype.start = function (this: OscillatorNode, when?: number) {
      spy.starts++
      return start.call(this, when)
    }
  })
const audio = (page: Page) =>
  page.evaluate(() => {
    const spy = (window as unknown as { __audio: AudioSpy }).__audio
    return { contexts: spy.contexts, starts: spy.starts, state: spy.ctx?.state ?? null }
  })
const remember = (page: Page, value: '1' | '0') =>
  page.addInitScript((v) => localStorage.setItem('n8-dino-music', v), value)
const stored = (page: Page) => page.evaluate(() => localStorage.getItem('n8-dino-music'))

// Bring the panel on screen without a smooth scroll still on its way (the
// same helper as dino.spec.ts).
const showKit = (page: Page) =>
  expect
    .poll(() =>
      page.locator(PANEL).evaluate((el) => {
        const box = el.getBoundingClientRect()
        const centred = Math.abs((box.top + box.bottom) / 2 - innerHeight / 2) <= 100 && box.top >= 72
        const tall = box.height > innerHeight - 80
        if (tall ? box.top >= 72 && box.top <= innerHeight / 3 : centred) return true
        el.scrollIntoView({ block: tall ? 'start' : 'center', behavior: 'instant' })
        if (tall) scrollBy(0, -88)
        return false
      })
    )
    .toBe(true)

// Click the dino where it is right now (it never holds still): hit-test its
// centre and click in the same tick.
const pokeDino = (page: Page) =>
  expect
    .poll(() =>
      dino(page).evaluate((el) => {
        const box = el.getBoundingClientRect()
        const hit = document.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2)
        if (!hit || !el.contains(hit)) return false
        ;(el as HTMLElement).click()
        return true
      }),
      { timeout: 15_000 }
    )
    .toBe(true)

// The loop is playing: the context runs and new notes keep being scheduled.
const expectPlaying = async (page: Page) => {
  await expect.poll(async () => (await audio(page)).state, { timeout: 10_000 }).toBe('running')
  const before = (await audio(page)).starts
  await expect.poll(async () => (await audio(page)).starts, { timeout: 10_000 }).toBeGreaterThan(before + 4)
}
// Stopped or paused: the context is suspended (after the fade) and no new notes come.
const expectSilent = async (page: Page) => {
  await expect.poll(async () => (await audio(page)).state, { timeout: 10_000 }).toBe('suspended')
  const before = (await audio(page)).starts
  await page.waitForTimeout(600)
  expect((await audio(page)).starts).toBe(before)
}

test.describe('dino game music (motion allowed)', () => {
  test.use({ contextOptions: { reducedMotion: 'no-preference' } })
  test.beforeEach(async ({ page }) => {
    await spyOnAudio(page)
    // Keep the dino on its rows (dino.spec.ts covers its roaming).
    await page.addInitScript(() => {
      const w = window as unknown as { __n8DinoTiming?: object }
      w.__n8DinoTiming = { ...w.__n8DinoTiming, roam: false }
    })
  })

  test('sits in the top right corner, off by default, clear of the scoreboards, and makes no audio', async ({
    page,
  }) => {
    await page.goto(STACK_PAGE)
    await showKit(page)
    const button = await hydratedMusic(page)
    await expect(button).toBeVisible()
    await expect(button).toHaveAttribute('aria-pressed', 'false')
    const corner = await button.evaluate((el) => {
      const b = el.getBoundingClientRect()
      const p = el.closest('[data-dino-panel]')!.getBoundingClientRect()
      return { right: p.right - b.right, top: b.top - p.top }
    })
    expect(corner.right).toBeGreaterThan(0)
    expect(corner.right).toBeLessThan(20)
    expect(corner.top).toBeGreaterThan(0)
    expect(corner.top).toBeLessThan(20)

    // A catch with the music off starts a round, not the music.
    await expect(dino(page)).toHaveCount(1, { timeout: 15_000 })
    await pokeDino(page)
    await expect(page.locator('[data-dino-score]')).toHaveAttribute('data-shown', 'true')
    await expect(page.locator('[data-dino-best]')).toHaveAttribute('data-shown', 'true')
    // The scoreboards stay inside the panel and clear of the toggle.
    const overlaps = await page.evaluate(() => {
      const panel = document.querySelector('[data-dino-panel]')!.getBoundingClientRect()
      const button = document.querySelector('[data-dino-music]')!.getBoundingClientRect()
      return [...document.querySelectorAll('[data-dino-score], [data-dino-timer], [data-dino-best]')].flatMap((el) => {
        const r = el.getBoundingClientRect()
        if (!r.width) return []
        const out = r.left < panel.left || r.right > panel.right
        const hit = r.right > button.left && r.left < button.right && r.bottom > button.top && r.top < button.bottom
        return out || hit ? [`${el.textContent} ${r.left.toFixed(0)}-${r.right.toFixed(0)}`] : []
      })
    })
    expect(overlaps).toEqual([])
    await page.waitForTimeout(500)
    expect(await audio(page)).toEqual({ contexts: 0, starts: 0, state: null })
    await expect(button).toHaveAttribute('aria-pressed', 'false')
  })

  test('pressing it plays the loop, pressing again stops it, and the choice is remembered', async ({ page }) => {
    await page.goto(STACK_PAGE)
    await showKit(page)
    const button = await hydratedMusic(page)
    await button.click()
    await expect(button).toHaveAttribute('aria-pressed', 'true')
    await expectPlaying(page)
    expect((await audio(page)).contexts).toBe(1)
    expect(await stored(page)).toBe('1')

    await button.click()
    await expect(button).toHaveAttribute('aria-pressed', 'false')
    await expectSilent(page)
    expect(await stored(page)).toBe('0')

    // On again: the same context, woken up.
    await button.click()
    await expect(button).toHaveAttribute('aria-pressed', 'true')
    await expectPlaying(page)
    expect((await audio(page)).contexts).toBe(1)
  })

  test('works from the keyboard with a visible focus ring, without scrolling the page', async ({ page }) => {
    await page.goto(STACK_PAGE)
    await showKit(page)
    const button = await hydratedMusic(page)
    await button.focus()
    await page.keyboard.press('Shift')
    await expect(button).toBeFocused()
    await expect(button).toHaveCSS('outline-style', 'solid')
    const y = await page.evaluate(() => scrollY)
    await page.keyboard.press('Enter')
    await expect(button).toHaveAttribute('aria-pressed', 'true')
    await expectPlaying(page)
    await page.keyboard.press('Space')
    await expect(button).toHaveAttribute('aria-pressed', 'false')
    await expectSilent(page)
    expect(await page.evaluate(() => scrollY)).toBe(y)
  })

  test('remembered as on, it never starts by itself: the next catch of the dino starts it', async ({ page }) => {
    await remember(page, '1')
    await page.goto(STACK_PAGE)
    await showKit(page)
    const button = await hydratedMusic(page)
    await expect(button).toHaveAttribute('data-dino-music', 'ready')
    await expect(button).toHaveAttribute('aria-pressed', 'false')
    await expect(dino(page)).toHaveCount(1, { timeout: 15_000 })
    // Hovering and scrolling around aren't a start.
    await page.mouse.move(10, 10)
    await page.waitForTimeout(1500)
    expect(await audio(page)).toEqual({ contexts: 0, starts: 0, state: null })

    await pokeDino(page)
    await expect(button).toHaveAttribute('aria-pressed', 'true')
    // The click still counts in the game: it started a round.
    await expect(page.locator('[data-dino-score]')).toHaveText('Catches 1')
    await expect.poll(async () => (await audio(page)).starts, { timeout: 10_000 }).toBeGreaterThan(0)
    expect((await audio(page)).contexts).toBe(1)
  })

  test('remembered as on, pressing the button starts it too', async ({ page }) => {
    await remember(page, '1')
    await page.goto(STACK_PAGE)
    await showKit(page)
    const button = await hydratedMusic(page)
    await expect(button).toHaveAttribute('data-dino-music', 'ready')
    await button.click()
    await expect(button).toHaveAttribute('aria-pressed', 'true')
    await expectPlaying(page)
  })

  test('remembered as off, it stays off', async ({ page }) => {
    await remember(page, '0')
    await page.goto(STACK_PAGE)
    await showKit(page)
    await expect(music(page)).toHaveAttribute('data-dino-music', 'off')
  })

  test('pauses while the panel is off screen or the tab is hidden, and comes back', async ({ page }) => {
    await pushPanelDown(page)
    await page.goto(STACK_PAGE)
    await showKit(page)
    const button = await hydratedMusic(page)
    await button.click()
    await expectPlaying(page)

    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }))
    await expectSilent(page)
    await showKit(page)
    await expectPlaying(page)

    // A hidden tab (simulated: headless pages are never hidden).
    const setHidden = (hidden: boolean) =>
      page.evaluate((h) => {
        Object.defineProperty(document, 'hidden', { configurable: true, get: () => h })
        document.dispatchEvent(new Event('visibilitychange'))
      }, hidden)
    await setHidden(true)
    await expectSilent(page)
    await setHidden(false)
    await expectPlaying(page)
    await expect(button).toHaveAttribute('aria-pressed', 'true')
  })
})

test.describe('dino game music (reduced motion)', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } })
  test.beforeEach(({ page }) => spyOnAudio(page))

  test('the toggle is there without the dino, plays, and does not animate', async ({ page }) => {
    await page.goto(STACK_PAGE)
    await showKit(page)
    await expect(dino(page)).toHaveCount(0)
    const button = await hydratedMusic(page)
    // No transitions (the site's reduced-motion rule leaves a token 0.00001s).
    expect(parseFloat(await button.evaluate((el) => getComputedStyle(el).transitionDuration))).toBeLessThan(0.01)
    // It sits above the tiles, not over them.
    const clear = await button.evaluate((el) => {
      const b = el.getBoundingClientRect()
      return [...el.closest('[data-dino-panel]')!.querySelectorAll('figure')].every((f) => {
        const r = f.getBoundingClientRect()
        return !(r.right > b.left && r.left < b.right && r.bottom > b.top && r.top < b.bottom)
      })
    })
    expect(clear).toBe(true)
    await button.click()
    await expect(button).toHaveAttribute('aria-pressed', 'true')
    await expectPlaying(page)
  })
})

// The synth, rendered offline in a blank page: music.ts as plain JavaScript.
test.describe('dino game music, rendered offline', () => {
  test('a steady 4-bar loop at 148 bpm, about 35% volume, never clipping, fading in and out without clicks', async ({
    page,
    browserName,
  }) => {
    // The render pauses the loop part way through with OfflineAudioContext's
    // suspend(time), which Firefox lacks. The synth is the same in every
    // browser, so Chromium and WebKit cover it.
    test.skip(browserName === 'firefox', 'no OfflineAudioContext.suspend()')
    const source = readFileSync('components/features/dino/music.ts', 'utf8')
    const js = ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
    }).outputText
    await page.setContent('<!doctype html><title>music</title>')
    await page.addScriptTag({ type: 'module', content: `${js}\nwindow.__music = { createMusic, LOOP, VOLUME }` })
    await page.waitForFunction(() => 'createMusic' in ((window as unknown as { __music?: object }).__music ?? {}))

    const m = await page.evaluate(async () => {
      type Music = { play(fromTop?: boolean): void; pause(): void; dispose(): void; queue(until: number): void }
      const { createMusic, LOOP, VOLUME } = (
        window as unknown as {
          __music: { createMusic: (ctx: BaseAudioContext, volume?: number) => Music; LOOP: number; VOLUME: number }
        }
      ).__music
      const rate = 44100
      // Two times round, then paused; rendered on past the fade-out.
      const stopAt = 0.06 + 2 * LOOP + 0.5
      const render = async (volume: number, pause: boolean) => {
        const ctx = new OfflineAudioContext(1, Math.ceil((stopAt + 1) * rate), rate)
        const music = createMusic(ctx, volume)
        music.play(true)
        music.queue(stopAt + 1)
        if (pause)
          void ctx.suspend(stopAt).then(() => {
            music.pause()
            void ctx.resume()
          })
        const out = (await ctx.startRendering()).getChannelData(0)
        music.dispose()
        return out
      }
      const x = await render(VOLUME, true)
      const full = await render(1, false)
      const at = (s: number) => Math.round(s * rate)
      const rms = (a: Float32Array, from: number, to: number) => {
        let sum = 0
        for (let i = at(from); i < at(to); i++) sum += a[i] * a[i]
        return Math.sqrt(sum / (at(to) - at(from)))
      }
      const peak = (a: Float32Array, from: number, to: number) => {
        let p = 0
        for (let i = at(from); i < at(to); i++) p = Math.max(p, Math.abs(a[i]))
        return p
      }
      // The biggest step from one sample to the next: a click is a sudden one.
      const jump = (a: Float32Array, from: number, to: number) => {
        let j = 0
        for (let i = Math.max(1, at(from)); i < at(to); i++) j = Math.max(j, Math.abs(a[i] - a[i - 1]))
        return j
      }
      // The loop's length: the lag (1 to 7.5 s) at which the loudness envelope
      // (5 ms frames) best matches itself.
      const frame = 0.005
      const env: number[] = []
      for (let t = 0.5; t + frame < stopAt - 0.1; t += frame) env.push(rms(x, t, t + frame))
      let bestLag = 0
      let bestScore = -Infinity
      for (let lag = Math.round(1 / frame); lag <= Math.round(7.5 / frame); lag++) {
        let dot = 0
        let a2 = 0
        let b2 = 0
        for (let i = 0; i + lag < env.length; i++) {
          dot += env[i] * env[i + lag]
          a2 += env[i] ** 2
          b2 += env[i + lag] ** 2
        }
        const score = dot / Math.sqrt(a2 * b2)
        if (score > bestScore) {
          bestScore = score
          bestLag = lag
        }
      }
      return {
        loop: LOOP,
        measuredLoop: bestLag * frame,
        rms: rms(x, 1, stopAt - 0.1),
        peak: peak(x, 0, x.length / rate),
        fullPeak: peak(full, 0, full.length / rate),
        level: rms(x, 1, stopAt - 0.1) / rms(full, 1, stopAt - 0.1),
        startAbs: peak(x, 0, 0.005),
        startJump: jump(x, 0, 0.1),
        stopJump: jump(x, stopAt, stopAt + 0.35),
        steadyJump: jump(x, 1, stopAt - 0.1),
        tail: peak(x, stopAt + 0.35, stopAt + 1),
      }
    })
    test.info().annotations.push({ type: 'offline render', description: JSON.stringify(m) })
    // 4 bars of 16th notes at 148 bpm: 64 x 60 / 148 / 4 = 6.486 s.
    expect(m.loop).toBeCloseTo(6.486, 3)
    expect(Math.abs(m.measuredLoop - m.loop)).toBeLessThan(0.02)
    // Clearly audible, and never clipping (even at full volume).
    expect(m.rms).toBeGreaterThan(0.02)
    expect(m.peak).toBeLessThan(1)
    expect(m.fullPeak).toBeLessThan(1)
    // About 35% of the full level (the compressor bends it a little).
    expect(m.level).toBeGreaterThan(0.25)
    expect(m.level).toBeLessThan(0.45)
    // Starts from silence and fades in and out with no step bigger than the
    // music itself makes; silent once faded out.
    expect(m.startAbs).toBeLessThan(0.001)
    expect(m.startJump).toBeLessThanOrEqual(m.steadyJump)
    expect(m.stopJump).toBeLessThanOrEqual(m.steadyJump)
    expect(m.tail).toBeLessThan(0.001)
  })
})
