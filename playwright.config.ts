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

  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,

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
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Test against mobile viewports
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
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
        NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
        // Fixed live-demo statuses instead of OpenPing's real ones (app/api/status).
        STATUS_FIXTURE: '1',
      }).filter(([, value]) => value !== undefined)
    ) as Record<string, string>,
  },
})
