import { test, expect } from '@playwright/test'

/**
 * Variant B: a work-first home page with a short About teaser and a compact
 * experience timeline, and the full story on its own About page.
 */
test('the home page teases About and links to the full page', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  const teaser = page.locator('#about')
  await expect(teaser.getByRole('heading', { name: 'About me' })).toBeVisible()
  await teaser.getByRole('link', { name: 'More about me' }).click()
  await expect(page).toHaveURL(/\/about$/)
  await expect(page.getByRole('heading', { level: 1, name: 'About me' })).toBeVisible()
})

test('the About page has the story, how I work, the stack, the resume and every role', async ({
  page,
}) => {
  await page.goto('/about')
  await expect(page).toHaveTitle('About | Nathan Watkins')
  await expect(page.getByRole('heading', { name: 'What I bring' })).toBeAttached()
  await expect(page.getByText('Tested like a product')).toBeAttached()
  await expect(page.locator('[data-dino-panel]')).toBeAttached()
  await expect(page.getByRole('link', { name: /View my resume/ })).toHaveAttribute(
    'href',
    /drive\.google\.com/
  )
  // Every role's bullets are open here.
  const exp = page.locator('#experience')
  await expect(exp.locator('details')).toHaveCount(0)
  await expect(exp.getByText(/Led end-to-end delivery of client apps/)).toBeAttached()
  // The nav marks About as the current page.
  await expect(
    page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'About' })
  ).toHaveAttribute('aria-current', 'page')
})

test('the home timeline folds each role into "What I did"', async ({ page }) => {
  await page.goto('/')
  const exp = page.locator('#experience')
  const first = exp.locator('details').first()
  await first.scrollIntoViewIfNeeded()
  const bullet = exp.getByText(/Building Tech for Pros, a SaaS/)
  await expect(bullet).toBeHidden()
  await first.getByText('What I did').click()
  await expect(bullet).toBeVisible()
})

test("the About page's nav leads back to the home page's sections", async ({ page, isMobile }) => {
  test.skip(isMobile, 'The same nav on phones; one viewport is enough.')
  await page.goto('/about')
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'Projects' })
    .click()
  await expect(page).toHaveURL(/\/$/)
  await expect(page.locator('#projects')).toBeInViewport()
})

test('the About page is in the sitemap and not redirected', async ({ request }) => {
  const about = await request.get('/about', { maxRedirects: 0 })
  expect(about.status()).toBe(200)
  expect(await (await request.get('/sitemap.xml')).text()).toContain(
    'https://portfolio.n8builds.dev/about'
  )
})
