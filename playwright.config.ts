import { defineConfig, devices } from '@playwright/test'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '.env.local') })

// E2E_PORT lets a second checkout (or a running `npm run dev` on 4829) coexist.
const PORT = Number(process.env.E2E_PORT) || 4829

/**
 * Playwright configuration for Web Vitals testing
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  // tests/unit runs under node --test (npm run test:unit).
  testIgnore: '**/unit/**',

  // Run tests in files in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // No retries: a flaky test gets fixed, not retried until it passes.
  retries: 0,

  // Two per CI job, as on n8builds-web (the WebKit jobs pass --workers=1).
  workers: process.env.CI ? 2 : undefined,

  // Reporter to use
  reporter: [
    ['html'],
    ['list'],
  ],

  // Shared settings for all the projects below
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL: `http://localhost:${PORT}`,

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video on failure
    video: 'retain-on-failure',

    // A fixed time zone outside the ones asked about analytics consent, so the
    // consent banner (lib/consent.ts) never shows unless a spec asks for it.
    timezoneId: 'America/Los_Angeles',
  },

  // The same five browsers as n8builds-web, so the shared dino and its tests
  // are checked on every one of them here too.
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 7'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone 14'] } },
  ],

  // A production build, like the live site: the Web Vitals checks mean nothing
  // against the dev server. Locally an already-running server is reused.
  webServer: {
    command: `npm run build && npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 300000,
    env: Object.fromEntries(
      Object.entries({
        // A made-up GA ID, never the real property, so the consent banner and
        // the GA loader are built and tested (tests/consent.spec.ts).
        NEXT_PUBLIC_GA_ID: 'G-E2ETEST000',
        // Fixed live-demo statuses instead of OpenPing's real ones (app/api/status).
        STATUS_FIXTURE: '1',
      }).filter(([, value]) => value !== undefined)
    ) as Record<string, string>,
  },
})
