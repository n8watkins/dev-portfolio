// The portfolio's Sentry DSN, shared by the client, server, edge and worker
// configs and by the CSP's violation reports (lib/security/headers.mjs). A DSN
// is public by design: it only lets a page send events to this one project.
//
// NEXT_PUBLIC_SENTRY_DISABLED=1 leaves the DSN out (undefined): Sentry then
// initialises without a destination and sends nothing, and the CSP has no
// report-uri. The Playwright web server sets it (playwright.config.ts), so a
// test run never reports to the real project as if it were a visitor
// (tests/no-sentry.spec.ts). It is NEXT_PUBLIC_ so the browser bundle reads it
// too, which means it is fixed when the site is built; production never sets it.
const DISABLED = process.env.NEXT_PUBLIC_SENTRY_DISABLED === '1'

export const SENTRY_DSN = DISABLED
  ? undefined
  : 'https://5fe024399bcfe69a9436b0e5fa84c17d@o4507767562371072.ingest.us.sentry.io/4507817472098304'
