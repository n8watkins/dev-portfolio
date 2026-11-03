import { defineCloudflareConfig } from '@opennextjs/cloudflare'
import r2IncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache'
import { withRegionalCache } from '@opennextjs/cloudflare/overrides/incremental-cache/regional-cache'
import doQueue from '@opennextjs/cloudflare/overrides/queue/do-queue'
import queueCache from '@opennextjs/cloudflare/overrides/queue/queue-cache'

// ISR on Workers (https://opennext.js.org/cloudflare/caching): /api/status
// (revalidate = 60) and the prerendered pages are kept in R2, with the Cache
// API in front of it in each region, and the Durable Object queue refreshes a
// stale entry once, however many visitors ask for it. No tag cache: nothing
// calls revalidateTag or revalidatePath.
export default defineCloudflareConfig({
  incrementalCache: withRegionalCache(r2IncrementalCache, { mode: 'long-lived' }),
  queue: queueCache(doQueue),
  // Serves a cached page from the routing layer without starting Next's
  // server for it (no PPR on this site, so it is safe).
  enableCacheInterception: true,
})
