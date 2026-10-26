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

test('each monitored project card shows its live-demo status, and the unmonitored one shows none', async ({
  page,
}) => {
  await projectsInView(page)
  const pill = (title: string) => card(page, title).getByRole('link', { name: /^Live demo:/ })

  // The state only: the demos are monitored on weekdays, so no uptime number.
  await expect(pill('Echo')).toHaveText(/Live demo\s*Online/)
  await expect(pill('Echo')).toHaveAttribute('data-status', 'up')
  await expect(pill('Scout')).toHaveText(/Live demo\s*Asleep/)
  await expect(pill('Scout')).toHaveAttribute('title', /first visit wakes the demo/)
  await expect(pill('GeminiGPT')).toHaveText(/Live demo\s*Down/)
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
      return {
        top: Math.round(box.top - card.top),
        left: Math.round(box.left - card.left),
        height: Math.round(box.height),
      }
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

test('a project page shows its screenshot whole, not cropped to a strip', async ({ page }) => {
  for (const width of [375, 1280]) {
    await page.setViewportSize({ width, height: 900 })
    for (const slug of ['echo', 'scout', 'geminigpt', 'net-trailer']) {
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

test('a project row opens its page, its live demo and its source', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await projectsInView(page)
  const echo = card(page, 'Echo')
  await expect(
    echo.getByRole('link', { name: 'Try the Echo live demo (new tab)' })
  ).toHaveAttribute('href', 'https://echo-kzw1.onrender.com')
  await expect(
    echo.getByRole('link', { name: 'View Echo source on GitHub (new tab)' })
  ).toHaveAttribute('href', /github\.com\/n8watkins\//)
  await expect(
    echo.getByRole('list', { name: 'What Echo does' }).getByRole('listitem')
  ).not.toHaveCount(0)
  await echo.getByRole('link', { name: 'View Echo details' }).click()
  await expect(page).toHaveURL(/\/projects\/echo$/, { timeout: 30000 })
})
