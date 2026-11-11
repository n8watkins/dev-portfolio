// The Worker's entry point (wrangler.jsonc "main"): the OpenNext build of the
// site (.open-next/worker.js, written by `opennextjs-cloudflare build`),
// wrapped by Sentry. See DEPLOY.md.
import * as Sentry from '@sentry/cloudflare'
import openNext from '../.open-next/worker.js'
import { SENTRY_DSN } from '../lib/sentryDsn.mjs'
import { healthCheck } from './health.js'

// The ISR revalidation queue's Durable Object (wrangler.jsonc durable_objects).
export { DOQueueHandler } from '../.open-next/worker.js'

/**
 * Next marks prerendered pages `s-maxage=<revalidate>, stale-while-revalidate`
 * for a CDN in front of it. There is none here (OpenNext's own cache in R2
 * plays that part), and Firefox applies stale-while-revalidate itself, so a
 * second visit would show the old page first. Browsers get what Vercel sent
 * them instead: revalidate every time.
 * @param {Response} response
 */
function forBrowsers(response) {
  if (!response.headers.get('Cache-Control')?.includes('s-maxage')) return response
  const fresh = new Response(response.body, response)
  fresh.headers.set('Cache-Control', 'public, max-age=0, must-revalidate')
  return fresh
}

const worker = {
  /**
   * @param {Request} request
   * @param {unknown} env
   * @param {ExecutionContext} ctx
   */
  async fetch(request, env, ctx) {
    return healthCheck(request) ?? forBrowsers(await openNext.fetch(request, env, ctx))
  },
}

// Server errors and traces, as sentry.server.config.ts sets them up under
// `next start` (on Workers that file only passes on the release).
export default Sentry.withSentry(() => ({ dsn: SENTRY_DSN, tracesSampleRate: 1 }), worker)
