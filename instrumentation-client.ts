// Sentry in the browser. The SDK itself (with Session Replay and the bug
// report widget) loads lazily, once the page is idle (lib/sentry/lazy.ts):
// loaded with the page it was most of the first JavaScript and about two
// seconds of script time on a phone (2026-11-04). Until then these listeners
// catch any error so it is reported once the SDK is up.
import { captureError, captureRouterTransitionStart, loadSentry } from '@/lib/sentry/lazy'

if (typeof window !== 'undefined') {
  const onError = (event: ErrorEvent) => captureError(event.error ?? event.message)
  const onRejection = (event: PromiseRejectionEvent) => captureError(event.reason)
  window.addEventListener('error', onError)
  window.addEventListener('unhandledrejection', onRejection)

  const start = () =>
    loadSentry().then(() => {
      // From here Sentry's own global handlers report errors.
      window.removeEventListener('error', onError)
      window.removeEventListener('unhandledrejection', onRejection)
    })
  const whenIdle = () =>
    'requestIdleCallback' in window ? window.requestIdleCallback(start, { timeout: 8_000 }) : setTimeout(start, 3_000)
  if (document.readyState === 'complete') whenIdle()
  else window.addEventListener('load', whenIdle, { once: true })
}

// App Router navigations, for tracing once the SDK has loaded.
export const onRouterTransitionStart = captureRouterTransitionStart
