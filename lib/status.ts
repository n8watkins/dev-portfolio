/**
 * Live status of the projects' demo sites, from OpenPing
 * (https://openping.n8builds.dev, the owner's own uptime monitor). Its public
 * status feed is already redacted: names, states and uptime, never URLs.
 */

export const STATUS_PAGE = 'https://openping.n8builds.dev/status'
export const STATUS_FEED = 'https://openping.n8builds.dev/api/public/status'

/** OpenPing's public service states. */
export type ServiceState = 'operational' | 'degraded' | 'down' | 'suspended' | 'maintenance' | 'scheduled_off' | 'unknown'

export interface ServiceStatus {
  state: ServiceState
  /** Uptime over the last 90 days, in percent; scheduled off-hours don't count against it. */
  uptime90d: number | null
}

/** Statuses by the service's name on the status page. */
export type StatusMap = Record<string, ServiceStatus>

const STATES: readonly ServiceState[] = ['operational', 'degraded', 'down', 'suspended', 'maintenance', 'scheduled_off', 'unknown']

/** The parts of the public feed this site reads; anything else is ignored. */
export function toStatusMap(feed: unknown): StatusMap {
  const map: StatusMap = {}
  const groups = (feed as { groups?: { services?: unknown[] }[] })?.groups
  if (!Array.isArray(groups)) return map
  for (const group of groups) {
    for (const service of group?.services ?? []) {
      const { name, state, uptime90d } = (service ?? {}) as { name?: unknown; state?: unknown; uptime90d?: unknown }
      if (typeof name !== 'string') continue
      map[name] = {
        state: STATES.includes(state as ServiceState) ? (state as ServiceState) : 'unknown',
        uptime90d: typeof uptime90d === 'number' && Number.isFinite(uptime90d) ? uptime90d : null,
      }
    }
  }
  return map
}

/** How a state reads to a visitor: a short label, a longer explanation and a tone. */
export function describe(status: ServiceStatus): { label: string; detail: string; tone: 'up' | 'warn' | 'down' | 'idle' } | null {
  switch (status.state) {
    case 'operational':
      return { label: 'Online', detail: 'The live demo is up.', tone: 'up' }
    case 'degraded':
      return { label: 'Slow', detail: 'The live demo is up but responding slowly.', tone: 'warn' }
    case 'down':
      return { label: 'Down', detail: 'The live demo is not responding right now.', tone: 'down' }
    case 'maintenance':
      return { label: 'Maintenance', detail: 'The live demo is in planned maintenance.', tone: 'warn' }
    case 'scheduled_off':
    case 'suspended':
      // Render's free tier sleeps between visits; OpenPing keeps the demos awake on weekdays.
      return { label: 'Asleep', detail: 'Off-hours: the first visit wakes the demo, which takes about a minute.', tone: 'idle' }
    default:
      return null
  }
}

/** "93% uptime" (whole percent unless it's above 99, then one decimal). */
export function formatUptime(uptime: number | null): string | null {
  if (uptime === null) return null
  const rounded = uptime >= 99 && uptime < 100 ? uptime.toFixed(1) : String(Math.round(uptime))
  return `${rounded}% uptime`
}
