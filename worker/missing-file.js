// A plain 404 for a path that cannot be a route, answered before Next starts.
//
// Scanners ask for /config.json, /.s3cfg, /www.zip, /terraform.tfvars and the
// like. Static files (public/, /_next/static) are served by Workers static
// assets before this Worker runs, so a file-like path that reaches it is a
// miss, and Next would spend a full render (about 100 to 150 ms of CPU) on the
// 404 page to say so.
//
// The rule is an allowlist plus a shape: a path with a dot in any segment (an
// extension, or a leading-dot name such as /.env) is answered here unless it is
// a route or file that really has a dot in it. Paths without a dot never
// match, so the site's own 404 page still comes from Next for them. Project
// slugs (/projects/<slug>) have no dot.

/** The routes and files whose paths contain a dot (app/sitemap.ts, public/robots.txt). */
const DOTTED_ROUTES = new Set(['/sitemap.xml', '/robots.txt'])

/**
 * Prefixes that next.config.mjs redirects to the home page whatever follows
 * (old /blog/... and /portfolio/... links).
 */
const DOTTED_PREFIXES = ['/blog/', '/portfolio/']

/**
 * Whether a path is file-like (a dot in any segment) and not a known route.
 * @param {string} pathname
 */
export function isMissingFile(pathname) {
  if (!pathname.includes('.')) return false
  if (DOTTED_ROUTES.has(pathname)) return false
  return !DOTTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

/**
 * The 404 for a missing file, or null for everything else. Small, no cookies,
 * and kept briefly by browsers and the edge so a scanner's repeat costs less.
 * @param {Request} request
 * @returns {Response | null}
 */
export function missingFile(request) {
  if (!isMissingFile(new URL(request.url).pathname)) return null
  return new Response('Not found', {
    status: 404,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=60, s-maxage=300',
    },
  })
}
