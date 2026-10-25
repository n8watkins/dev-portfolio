import { test, expect, type Page } from '@playwright/test'

/**
 * What a search result or a shared link shows: one title and description
 * across the page, Open Graph and Twitter, a real 1200x630 card, and the
 * site's own address (never a leftover vercel.app one).
 */

const meta = (page: Page, key: string) =>
  page.locator(`meta[property="${key}"], meta[name="${key}"]`).first().getAttribute('content')

test('the home page has one title and a share card that matches it', async ({ page, request }) => {
  await page.goto('/')
  await expect(page).toHaveTitle('Nathan Watkins | AI Full-Stack Developer')
  expect(await meta(page, 'og:title')).toBe('Nathan Watkins | AI Full-Stack Developer')
  expect(await meta(page, 'twitter:title')).toBe('Nathan Watkins | AI Full-Stack Developer')

  const share = await meta(page, 'og:description')
  expect(share!.length).toBeLessThanOrEqual(120)
  expect(await meta(page, 'twitter:description')).toBe(share)
  expect((await meta(page, 'description'))!.length).toBeLessThanOrEqual(160)

  expect(await meta(page, 'og:url')).toBe('https://portfolio.n8builds.dev')
  expect(await page.locator('link[rel="canonical"]').getAttribute('href')).toBe('https://portfolio.n8builds.dev')

  for (const key of ['og:image', 'twitter:image']) {
    const url = new URL((await meta(page, key))!)
    expect(url.origin).toBe('https://portfolio.n8builds.dev')
    const image = await request.get(url.pathname + url.search)
    expect(image.status()).toBe(200)
    expect(image.headers()['content-type']).toBe('image/png')
    const png = await image.body()
    // PNG header: width and height are big-endian at bytes 16 and 20.
    expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([1200, 630])
  }
})

test('a project page is titled after the project, with a short share description', async ({ page }) => {
  await page.goto('/projects/echo')
  await expect(page).toHaveTitle(/^Echo - .+ \| Nathan Watkins$/)
  expect((await meta(page, 'og:description'))!.length).toBeLessThanOrEqual(120)
  expect(await meta(page, 'twitter:card')).toBe('summary_large_image')
  expect(await page.locator('link[rel="canonical"]').getAttribute('href')).toBe('https://portfolio.n8builds.dev/projects/echo')
})

test('no visible copy uses an em dash', async ({ page }) => {
  for (const path of ['/', '/projects/echo', '/projects/scout']) {
    await page.goto(path)
    // Sections fade in on scroll; walk the page so all of them render.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y)
        await new Promise((r) => setTimeout(r, 100))
      }
    })
    expect(await page.locator('body').innerText(), path).not.toContain('—')
  }
})

test('the "Building in public" card shows Scribe, not its old name LocalDictate', async ({ page }) => {
  await page.goto('/')
  const html = await page.content()
  expect(html).not.toContain('LocalDictate')
  expect(html).toContain('https://github.com/n8watkins/scribe')
})

test("the Sentry wizard's example page and API are not deployed", async ({ request }) => {
  // The example API throws on every request: public, it let anyone fill the Sentry quota.
  expect((await request.get('/sentry-example-page')).status()).toBe(404)
  expect((await request.get('/api/sentry-example-api')).status()).toBe(404)
})
