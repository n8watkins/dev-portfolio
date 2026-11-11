import { test as base } from '@playwright/test'

export * from '@playwright/test'

/**
 * The dino game reports its rounds to https://n8builds.dev/api/game (counts
 * only, see components/features/TechStack.tsx). A test run must never reach
 * production, so every browser context answers that call itself, the way the
 * real endpoint does: a round id and the record for a start, "counted" for a
 * score. A spec that checks what is sent registers its own page.route, which
 * takes precedence over this one.
 */
export const GAME_STATS_URL = 'https://n8builds.dev/api/game'

export const test = base.extend({
  context: async ({ context }, provide) => {
    await context.route(GAME_STATS_URL, async (route) => {
      const body = JSON.parse(route.request().postData() ?? 'null')
      await route.fulfill({
        json: body?.type === 'start' ? { round: 'a'.repeat(24), record: 0 } : { result: 'counted' },
        headers: { 'access-control-allow-origin': '*' },
      })
    })
    await provide(context)
  },
})
