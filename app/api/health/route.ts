// Liveness check for uptime monitors: answers 200 while the Worker serves
// requests. It calls no dependency and reports no config, version or runtime
// details, so it is safe to leave public.
export const dynamic = 'force-dynamic'

export function GET() {
  return Response.json({ status: 'ok' }, { headers: { 'Cache-Control': 'no-store' } })
}
