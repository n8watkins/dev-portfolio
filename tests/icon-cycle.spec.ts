import { test, expect, type Page } from '@playwright/test'

/**
 * Behavior lock for the IconCycle tech-stack widget (components/ui/ProjectComponents/iconCycle.tsx).
 *
 * These tests pin the externally-observable behavior so the in-progress refactor
 * (see docs/ICONCYCLE_REFACTOR_PLAN.md) can proceed safely. They drive the real
 * component in a browser - no framer-motion / next-image mocking needed.
 *
 * Conventions used:
 *  - The first project card (Echo) is always the first match of each selector.
 *  - `.select-text` is the tech-name label rendered under the icon row.
 *  - Reduced-motion is emulated to stop the auto-cycle for deterministic
 *    hover/click/nav assertions (the refactor wires the cycle to useReducedMotion).
 */

const firstLabel = (page: Page) =>
  page.locator('#projects .select-text').first().textContent().then((t) => (t ?? '').trim())

const firstCategory = (page: Page) =>
  page.evaluate(() => {
    const h3s = [...document.querySelectorAll('#projects h3')].map((h) => h.textContent?.trim())
    return h3s.find((t) => t === 'Frontend' || t === 'Backend' || t === 'Cloud')
  })

/**
 * The site scrolls smoothly (`scroll-smooth` on every element), so a scroll
 * Playwright starts keeps gliding for a few hundred milliseconds. Wait until it
 * stops, or a hover lands where the element was rather than where it ends up.
 */
async function settleScroll(page: Page) {
  await expect
    .poll(async () => {
      const before = await page.evaluate(() => window.scrollY)
      await page.waitForTimeout(150)
      return (await page.evaluate(() => window.scrollY)) === before
    })
    .toBe(true)
}

async function gotoProjects(page: Page) {
  await page.goto('/')
  // Projects is lazy-loaded (next/dynamic) below the fold - scroll it in.
  await page.getByText('Realtime Voice Agent').first().scrollIntoViewIfNeeded()
  await expect(page.locator('#projects .select-text').first()).toBeVisible()
  await settleScroll(page)
}

test.describe('IconCycle', () => {
  test('auto-cycles through tech icons over time', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await gotoProjects(page)
    const before = await firstLabel(page)
    // One interval is 3s; wait a bit past it and the highlighted tech should change.
    await expect(async () => {
      expect(await firstLabel(page)).not.toBe(before)
    }).toPass({ timeout: 6000 })
  })

  test('respects prefers-reduced-motion (no auto-advance)', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await gotoProjects(page)
    const before = await firstLabel(page)
    await page.waitForTimeout(4000) // would advance ~1 step if the cycle were running
    expect(await firstLabel(page)).toBe(before)
  })

  test('hovering an icon pauses the cycle and highlights that icon', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' })
    await gotoProjects(page)
    // Pick whatever icon is currently shown in the first card, then hover it.
    const alt = await page.evaluate(() => {
      const imgs = [...document.querySelectorAll('#projects img')].filter((i) =>
        /projectIcons/.test((i as HTMLImageElement).src) || /projectIcons/.test(i.getAttribute('src') || '')
      )
      return (imgs[0] as HTMLImageElement | undefined)?.alt
    })
    expect(alt, 'an icon should be visible in the first card').toBeTruthy()

    const icon = page.getByAltText(alt!).first()
    await icon.scrollIntoViewIfNeeded()
    await settleScroll(page)
    await icon.hover()
    await expect.poll(() => firstLabel(page)).toBe(alt) // label locks to the hovered icon
    await page.waitForTimeout(4000)
    expect(await firstLabel(page)).toBe(alt) // and stays (paused)
  })

  test('category nav button switches category', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' }) // stop the cycle for a stable read
    await gotoProjects(page)
    const before = await firstCategory(page)
    // Re-click each iteration so a click swallowed under heavy load doesn't flake the test.
    await expect(async () => {
      await page.getByLabel('Next tech category').first().click()
      expect(await firstCategory(page)).not.toBe(before)
    }).toPass({ timeout: 20000 })
  })

  test('the Details link navigates to the project detail page', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await gotoProjects(page)
    // First card is Echo; "Details" is a real link to its detail page.
    await page.getByRole('link', { name: /view echo details/i }).first().click()
    await expect(page).toHaveURL(/\/projects\/echo/, { timeout: 30000 })
  })

  test('tech icons are keyboard-operable buttons', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await gotoProjects(page)
    const alt = await page.evaluate(() => {
      const imgs = [...document.querySelectorAll('#projects img')].filter((i) =>
        /projectIcons/.test((i as HTMLImageElement).src) || /projectIcons/.test(i.getAttribute('src') || '')
      )
      return (imgs[0] as HTMLImageElement | undefined)?.alt
    })
    // Each tech icon is a real <button> (keyboard-reachable) named after the tech.
    const iconButton = page.getByRole('button', { name: alt! }).first()
    await iconButton.focus()
    await expect(iconButton).toBeFocused()
  })
})
