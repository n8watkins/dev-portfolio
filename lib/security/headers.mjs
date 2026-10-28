// Security response headers for every route, consumed by next.config.mjs.
// Plain ESM (not TypeScript) so next.config.mjs can import it directly.
// Mirrors n8builds-web's lib/security/headers.mjs, with the portfolio's own origins.

const GOOGLE_ANALYTICS = [
  'https://www.googletagmanager.com',
  'https://*.google-analytics.com',
  'https://*.analytics.google.com',
]
// The dino catch game posts its rounds to n8builds.dev (components/features/TechStack.tsx).
const DINO_STATS = 'https://n8builds.dev'

// The Vercel toolbar is injected on preview deployments only.
// https://vercel.com/docs/vercel-toolbar/managing-toolbar#using-a-content-security-policy
const VERCEL_TOOLBAR = {
  script: ['https://vercel.live'],
  connect: ['https://vercel.live', 'wss://ws-us3.pusher.com'],
  img: ['https://vercel.live', 'https://vercel.com'],
  frame: ['https://vercel.live'],
  style: ['https://vercel.live'],
  font: ['https://vercel.live', 'https://assets.vercel.com'],
}

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
 * @param {{ dev?: boolean, preview?: boolean, reportUri?: string | null }} options
 * @returns {string}
 */
export function buildContentSecurityPolicy({ dev = false, preview = false, reportUri = null } = {}) {
  const toolbar = preview ? VERCEL_TOOLBAR : { script: [], connect: [], img: [], frame: [], style: [], font: [] }

  const directives = {
    'default-src': ["'self'"],
    // React Refresh needs eval in `next dev` only.
    'script-src': ["'self'", "'unsafe-inline'", ...(dev ? ["'unsafe-eval'"] : []), 'https://www.googletagmanager.com', ...toolbar.script],
    // Inline style attributes come from Motion, GSAP and next/font.
    'style-src': ["'self'", "'unsafe-inline'", ...toolbar.style],
    'img-src': ["'self'", 'data:', 'blob:', ...GOOGLE_ANALYTICS, ...toolbar.img],
    'font-src': ["'self'", 'data:', ...toolbar.font],
    // Sentry posts to the same-origin /monitoring tunnel; dev HMR uses a websocket.
    'connect-src': ["'self'", DINO_STATS, ...GOOGLE_ANALYTICS, ...(dev ? ['ws:'] : []), ...toolbar.connect],
    'frame-src': toolbar.frame.length ? toolbar.frame : ["'none'"],
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
 * @param {{ dev?: boolean, preview?: boolean, sentryDsn?: string }} options
 * @returns {{ key: string, value: string }[]}
 */
export function securityHeaders({ dev = false, preview = false, sentryDsn } = {}) {
  const reportUri = sentryCspReportUri(sentryDsn)

  return [
    { key: 'Content-Security-Policy', value: buildContentSecurityPolicy({ dev, preview, reportUri }) },
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
