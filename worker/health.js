/**
 * The uptime check (GET /healthz): `ok`, answered before Next.js or anything
 * else runs. No cookie, no bindings, no cache.
 * @param {Request} request
 * @returns {Response | null} null for every other request
 */
export function healthCheck(request) {
  if (request.method !== 'GET' && request.method !== 'HEAD') return null
  if (new URL(request.url).pathname !== '/healthz') return null
  return new Response(request.method === 'HEAD' ? null : 'ok', {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
  })
}
