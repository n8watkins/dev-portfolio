// Security response headers for every route, consumed by next.config.mjs.
// Plain ESM (not TypeScript) so next.config.mjs can import it directly.
// Mirrors n8builds-web's lib/security/headers.mjs, with the portfolio's own origins.

const GOOGLE_ANALYTICS = [
  'https://www.googletagmanager.com',
  'https://*.google-analytics.com',
  'https://*.analytics.google.com',
  // GA4 also posts some hits to www.google.com/g/collect (seen under Consent Mode).
  'https://www.google.com',
]
// The dino catch game posts its rounds to n8builds.dev (components/features/TechStack.tsx).
const DINO_STATS = 'https://n8builds.dev'

// Cloudflare Web Analytics (components/WebAnalytics.tsx): the beacon script,
// and the endpoint it reports to.
// https://developers.cloudflare.com/web-analytics/
const WEB_ANALYTICS = { script: 'https://static.cloudflareinsights.com', connect: 'https://cloudflareinsights.com' }

/**
 * Sentry's CSP report endpoint for a DSN, or null if the DSN is missing or
 * malformed. https://docs.sentry.io/platforms/javascript/security-policy-reporting/
 * @param {string | undefined} dsn
 * @returns {string | null}
 */
export function sentryCspReportUri(dsn) {
  if (!dsn) return null
  try {
    const url = new URL(dsn)
    const projectId = url.pathname.replace(/^\//, '')
    if (!url.username || !/^\d+$/.test(projectId)) return null
    return `${url.protocol}//${url.host}/api/${projectId}/security/?sentry_key=${url.username}`
  } catch {
    return null
  }
}

/**
 * Build the Content-Security-Policy.
 *
 * Scripts allow 'unsafe-inline' because App Router pages ship inline RSC
 * payload scripts (self.__next_f.push) and the consent bootstrap runs inline
 * before gtag.js; hashes can't live in static headers, and nonces would force
 * every page to render dynamically. Everything else is locked down: no
 * plugins, no frames, no <base> hijacking, forms post only to us, and every
 * external origin is listed explicitly.
 *
 * @param {{ dev?: boolean, reportUri?: string | null }} options
 * @returns {string}
 */
export function buildContentSecurityPolicy({ dev = false, reportUri = null } = {}) {

  const directives = {
    'default-src': ["'self'"],
    // React Refresh needs eval in `next dev` only.
    'script-src': ["'self'", "'unsafe-inline'", ...(dev ? ["'unsafe-eval'"] : []), 'https://www.googletagmanager.com', WEB_ANALYTICS.script],
    // Inline style attributes come from Motion, GSAP and next/font.
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'blob:', ...GOOGLE_ANALYTICS],
    'font-src': ["'self'", 'data:'],
    // Sentry posts to the same-origin /monitoring tunnel; dev HMR uses a websocket.
    'connect-src': ["'self'", DINO_STATS, ...GOOGLE_ANALYTICS, WEB_ANALYTICS.connect, ...(dev ? ['ws:'] : [])],
    'frame-src': ["'none'"],
    // Sentry Session Replay compresses in a blob: worker.
    'worker-src': ["'self'", 'blob:'],
    'media-src': ["'self'"],
    'manifest-src': ["'self'"],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'none'"],
  }

  const policy = Object.entries(directives).map(([name, values]) => `${name} ${values.join(' ')}`)
  if (reportUri) policy.push(`report-uri ${reportUri}`, 'report-to csp')
  return policy.join('; ')
}

/**
 * @param {{ dev?: boolean, sentryDsn?: string }} options
 * @returns {{ key: string, value: string }[]}
 */
export function securityHeaders({ dev = false, sentryDsn } = {}) {
  const reportUri = sentryCspReportUri(sentryDsn)

  return [
    { key: 'Content-Security-Policy', value: buildContentSecurityPolicy({ dev, reportUri }) },
    // Two years, as Vercel sent it, with no preload. public/_headers sends the
    // same for files served straight from the assets.
    ...(dev ? [] : [{ key: 'Strict-Transport-Security', value: 'max-age=63072000' }]),
    ...(reportUri ? [{ key: 'Reporting-Endpoints', value: `csp="${reportUri}"` }] : []),
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    // The portfolio opens no popups it needs to talk to, so isolating its
    // browsing context group costs nothing.
    { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
    {
      key: 'Permissions-Policy',
      value: [
        'camera=()',
        'microphone=()',
        'geolocation=()',
        'payment=()',
        'usb=()',
        'serial=()',
        'hid=()',
        'midi=()',
        'magnetometer=()',
        'display-capture=()',
        'browsing-topics=()',
      ].join(', '),
    },
  ]
}
