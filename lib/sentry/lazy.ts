/**
 * Sentry in the browser, loaded lazily: the SDK and its tracing are most of a
 * 174 KB gzip chunk with React, and about two seconds of script time on a
 * phone (Session Replay recording the whole page among it), so they load
 * once the page is idle instead of on the critical path. Until then, errors are
 * queued here (and by instrumentation-client.ts's early listeners) and sent as
 * soon as the SDK is up, so nothing is lost.
 *
 * Client code reports errors with captureError(), never by importing
 * @sentry/nextjs directly: a direct import would pull the SDK back into the
 * first load.
 */
import type * as SentryNext from '@sentry/nextjs'

type Sentry = typeof SentryNext
type Context = Parameters<Sentry['captureException']>[1]

let sentry: Sentry | null = null
let loading: Promise<void> | null = null
const queue: [unknown, Context][] = []

/** Report an error to Sentry: now if it has loaded, else as soon as it does. */
export function captureError(error: unknown, context?: Context) {
  if (sentry) sentry.captureException(error, context)
  else queue.push([error, context])
}

/** Load and start the SDK (once), then send anything queued before it. */
export function loadSentry(): Promise<void> {
  loading ??= import('./init')
    .then(({ Sentry }) => {
      sentry = Sentry
      for (const [error, context] of queue.splice(0)) Sentry.captureException(error, context)
    })
    .catch(() => {
      // Offline or blocked: the page works the same without error reporting.
    })
  return loading
}

/** App Router navigations, for tracing (a no-op until the SDK has loaded). */
export function captureRouterTransitionStart(...args: Parameters<Sentry['captureRouterTransitionStart']>) {
  sentry?.captureRouterTransitionStart(...args)
}
