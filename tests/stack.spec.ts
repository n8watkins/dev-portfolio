import { test, expect } from '@playwright/test'

/**
 * The stack (owner, 2026-11-08): the home page's tech stack card (with the
 * dino) has "See my stack" to /stack, with every tool by layer (each with a line on why) and
 * the dino game as a proper play area, roomy on phones too.
 */
test("the home page's tech stack card leads to /stack", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  const link = page.locator('#about').getByRole('link', { name: 'See my stack' })
  await link.scrollIntoViewIfNeeded()
  await link.click()
  await expect(page).toHaveURL(/\/stack$/)
  await expect(page.getByRole('heading', { level: 1, name: 'What I build with' })).toBeVisible()
})

test('/stack lists every tool once, by layer, each with its reason', async ({ page }) => {
  await page.goto('/stack')
  const items = page.locator('[data-stack-layer] > li')
  const names = await items.locator('p.font-semibold').allTextContents()
  // data/stack.tsx: 8 agents and models, 3 local AI tools, 27 in the dev stack.
  expect(names).toHaveLength(38)
  expect(new Set(names).size).toBe(38)
  for (const reason of await items.locator('p.text-sm').allTextContents()) {
    expect(reason.trim().length).toBeGreaterThan(5)
  }
})

for (const width of [320, 390]) {
  test(`the dino's play area is full width and tall enough at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 })
    await page.goto('/stack')
    const area = page.getByRole('region', { name: 'My tech stack, with the dino game' })
    const box = (await area.boundingBox())!
    // Edge to edge: as wide as the page (on desktop the page keeps a scrollbar gutter).
    const pageWidth = await page.evaluate(() => document.documentElement.getBoundingClientRect().width)
    expect(box.width).toBeGreaterThanOrEqual(pageWidth - 1)
    expect(box.height).toBeGreaterThanOrEqual(440)
    await expect(area.locator('[data-dino-panel]')).toBeAttached()
  })
}
