import { test, expect, type Page } from '@playwright/test'

/**
 * The project rows (owner, 2026-11-08): the new AI app's "In progress" card
 * first, then Net-Trailer and Portfolio Rank. Echo, Scout and GeminiGPT were
 * retired that day; nothing links to them or their demos any more.
 */

async function projectsInView(page: Page) {
  await page.goto('/')
  await page.getByText('AI-Powered Netflix Clone').first().scrollIntoViewIfNeeded()
}

const card = (page: Page, title: string) => page.getByRole('article', { name: title, exact: true })

test('the projects open with the in-progress AI app, then Net-Trailer and Portfolio Rank', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  const titles = page.locator('#projects article h3')
  await expect(titles).toHaveText(['New AI app - in progress', 'Net-Trailer', 'Portfolio Rank'])
  const upcoming = card(page, 'New AI app - in progress')
  await expect(upcoming.getByText('In progress', { exact: true })).toBeVisible()
  await expect(upcoming).toContainText('talks with you, researches for you, and remembers')
  // No name, links or screenshots until it ships.
  await expect(upcoming.getByRole('link')).toHaveCount(0)
  await expect(upcoming.locator('img')).toHaveCount(0)
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

test('old links to the retired project pages land on the projects', async ({ request }) => {
  for (const slug of ['echo', 'scout', 'geminigpt']) {
    const res = await request.get(`/projects/${slug}`, { maxRedirects: 0 })
    expect(res.status(), slug).toBe(308)
    expect(res.headers().location, slug).toMatch(/\/#projects$/)
  }
})

test('the status API answers with names, states and uptime only', async ({ request }) => {
  const body = await (await request.get('/api/status')).json()
  expect(body.services['Demo Up']).toEqual({ state: 'operational', uptime90d: 92.914 })
  expect(JSON.stringify(body)).not.toMatch(/https?:\/\//)
})

test('a project page shows its screenshot whole, not cropped to a strip', async ({ page }) => {
  for (const width of [375, 1280]) {
    await page.setViewportSize({ width, height: 900 })
    for (const slug of ['net-trailer', 'portfolio-rank']) {
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
  const net = card(page, 'Net-Trailer')
  await expect(
    net.getByRole('link', { name: 'Try the Net-Trailer live demo (new tab)' })
  ).toHaveAttribute('href', 'https://net-trailers.vercel.app/')
  // The card stays big and simple: the source, tech and features are on /projects and its page.
  await expect(net.getByRole('list', { name: 'What Net-Trailer does' })).toHaveCount(0)
  await net.getByRole('link', { name: 'Read the full story of Net-Trailer' }).click()
  await expect(page).toHaveURL(/\/projects\/net-trailer$/, { timeout: 30000 })
  await expect(
    page.getByRole('list', { name: 'What Net-Trailer does' }).getByRole('listitem')
  ).not.toHaveCount(0)
})

test('"Detailed view" opens /projects, with every project at full size', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await page.locator('#projects').getByRole('link', { name: 'Detailed view' }).click()
  await expect(page).toHaveURL(/\/projects$/)
  await expect(page.getByRole('heading', { level: 1, name: 'Projects, in detail' })).toBeVisible()
  await expect(page.getByRole('article', { name: 'New AI app - in progress' })).toBeVisible()
  for (const title of ['Net-Trailer', 'Portfolio Rank']) {
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
  ).toHaveAttribute('href', 'https://portfoliorank.n8builds.dev')

  await page.goto('/projects/portfolio-rank')
  await expect(page.getByRole('heading', { name: 'Credits' })).toBeVisible()
  await expect(page.getByRole('link', { name: /Add yours on Portfolio Rank/ })).toHaveAttribute(
    'href',
    'https://portfoliorank.n8builds.dev/'
  )
})

/**
 * A project page's footer: my two sites with their marks under "My sites",
 * then "Built in public at n8builds.dev" (owner, 2026-11-01).
 */
test("a project page's footer links my sites with their marks", async ({ page }) => {
  await page.goto('/projects/net-trailer')
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
