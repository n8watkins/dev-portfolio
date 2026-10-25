import { test, expect, type Page } from '@playwright/test'

/**
 * Live-demo status from OpenPing, against the fixed statuses the test server
 * serves (STATUS_FIXTURE=1 in playwright.config.ts): Echo online, Scout asleep
 * (off-hours), GeminiGPT down. Net-Trailer isn't monitored.
 */

async function projectsInView(page: Page) {
  await page.goto('/')
  await page.getByText('Realtime Voice Agent').first().scrollIntoViewIfNeeded()
}

const card = (page: Page, title: string) => page.getByRole('article', { name: title, exact: true })

test('each monitored project card shows its live-demo status, and the unmonitored one shows none', async ({ page }) => {
  await projectsInView(page)
  const pill = (title: string) => card(page, title).getByRole('link', { name: /^Live demo:/ })

  await expect(pill('Echo')).toHaveText(/Online\s*· 93% uptime/)
  await expect(pill('Echo')).toHaveAttribute('data-status', 'up')
  await expect(pill('Scout')).toHaveText(/Asleep\s*· 99\.5% uptime/)
  await expect(pill('Scout')).toHaveAttribute('title', /first visit wakes the demo/)
  await expect(pill('GeminiGPT')).toHaveText(/Down\s*· 81% uptime/)
  await expect(pill('Net-Trailer')).toHaveCount(0)

  // It links to the public status page.
  await expect(pill('Echo')).toHaveAttribute('href', 'https://openping.n8builds.dev/status')
})

test('the status arriving moves nothing on the card', async ({ page }) => {
  // Hold the status back so the card renders without it first.
  let release!: () => void
  const held = new Promise<void>((resolve) => (release = resolve))
  await page.route('**/api/status', async (route) => {
    await held
    await route.continue()
  })
  await projectsInView(page)
  const echo = card(page, 'Echo')
  const description = echo.getByText(/browser-based realtime voice AI/)
  await expect(description).toBeVisible()
  // Measured against the card, so its fade-in and the page's smooth scroll don't count.
  const offset = () =>
    description.evaluate((el) => {
      const card = el.closest('article')!.getBoundingClientRect()
      const box = el.getBoundingClientRect()
      return { top: Math.round(box.top - card.top), left: Math.round(box.left - card.left), height: Math.round(box.height) }
    })
  // Wait out the card's entrance (it fades and scales in) before measuring.
  let before = await offset()
  await expect
    .poll(async () => {
      await page.waitForTimeout(300)
      const now = await offset()
      const settled = JSON.stringify(now) === JSON.stringify(before)
      before = now
      return settled
    })
    .toBe(true)
  release()
  await expect(echo.getByRole('link', { name: /^Live demo:/ })).toBeVisible()
  expect(await offset()).toEqual(before)
})

test('a project page shows the status next to its links', async ({ page }) => {
  await page.goto('/projects/scout')
  await expect(page.getByRole('link', { name: /^Live demo: Asleep/ }).first()).toBeVisible()
})

test('no status is shown when it cannot be read', async ({ page }) => {
  await page.route('**/api/status', (route) => route.fulfill({ status: 502, body: 'bad gateway' }))
  await projectsInView(page)
  await expect(card(page, 'Echo').getByText('Realtime Voice Agent')).toBeVisible()
  await page.waitForTimeout(500)
  await expect(page.getByRole('link', { name: /^Live demo:/ })).toHaveCount(0)
})

test('the status API answers with names, states and uptime only', async ({ request }) => {
  const body = await (await request.get('/api/status')).json()
  expect(body.services.Echo).toEqual({ state: 'operational', uptime90d: 92.914 })
  expect(JSON.stringify(body)).not.toMatch(/https?:\/\//)
})

test('"More builds" links each build to its n8builds.dev page', async ({ page }) => {
  await projectsInView(page)
  const strip = page.getByRole('list', { name: 'More builds on n8builds.dev' })
  await strip.scrollIntoViewIfNeeded()
  for (const [name, slug] of [['TubeVault', 'tubevault'], ['Piper TTS', 'piper-tts'], ['OpenPing', 'openping']]) {
    const link = strip.getByRole('link', { name: new RegExp(`^${name} on n8builds.dev`) })
    await expect(link).toHaveAttribute('href', `https://n8builds.dev/builds/${slug}`)
    await expect(link).toHaveAttribute('target', '_blank')
  }
  // Scribe and Solara aren't featured on the portfolio.
  await expect(strip.getByText(/Scribe|Solara/)).toHaveCount(0)
})

test('a project page shows its screenshot whole, not cropped to a strip', async ({ page }) => {
  for (const width of [375, 1280]) {
    await page.setViewportSize({ width, height: 900 })
    for (const slug of ['echo', 'scout', 'geminigpt', 'net-trailer']) {
      await page.goto(`/projects/${slug}`)
      const image = page.locator('main img').first()
      await expect(image).toBeVisible()
      await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true)
      const { box, natural } = await image.evaluate((img: HTMLImageElement) => {
        const frame = img.parentElement!.getBoundingClientRect()
        return { box: frame.width / frame.height, natural: img.naturalWidth / img.naturalHeight }
      })
      // object-cover crops whatever the frame's shape doesn't share with the image.
      expect(Math.abs(box - natural) / natural, `${slug} at ${width}px`).toBeLessThan(0.25)
    }
  }
})
