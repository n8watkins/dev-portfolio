/**
 * Live status of the projects' demo sites, from OpenPing
 * (https://openping.n8builds.dev, the owner's own uptime monitor). Its public
 * status feed is already redacted: names, states and uptime, never URLs.
 */

export const STATUS_PAGE = 'https://openping.n8builds.dev/status'
/** OpenPing's own site, and its page on n8builds.dev. */
export const OPENPING_SITE = 'https://openping.n8builds.dev'
export const OPENPING_BUILD = 'https://n8builds.dev/builds/openping'

/**
 * When the live demos (Echo, Scout, GeminiGPT) are kept awake: their OpenPing
 * monitors' schedule, in the installation's timezone (America/Los_Angeles).
 * The public feed doesn't carry schedules, so this is kept by hand; change it
 * here if the monitors' schedule changes.
 */
export const DEMO_HOURS = 'Monday to Friday (Pacific time)'
export const STATUS_FEED = 'https://openping.n8builds.dev/api/public/status'

/** OpenPing's public service states. */
export type ServiceState =
  'operational' | 'degraded' | 'down' | 'suspended' | 'maintenance' | 'scheduled_off' | 'unknown'

export interface ServiceStatus {
  state: ServiceState
  /** Uptime over the last 90 days, in percent; scheduled off-hours don't count against it. */
  uptime90d: number | null
}

/** Statuses by the service's name on the status page. */
export type StatusMap = Record<string, ServiceStatus>

const STATES: readonly ServiceState[] = [
  'operational',
  'degraded',
  'down',
  'suspended',
  'maintenance',
  'scheduled_off',
  'unknown',
]

/**
 * OpenPing checks every 12 minutes while a schedule is on. A feed older than
 * this means it isn't checking (off-hours, like weekends), so the Render demos
 * it would keep awake are asleep, whatever state the last check left.
 */
export const STALE_AFTER_MS = 30 * 60 * 1000

/** The parts of the public feed this site reads; anything else is ignored. */
export function toStatusMap(feed: unknown, now = Date.now()): StatusMap {
  const map: StatusMap = {}
  const { groups, updatedAt } = (feed ?? {}) as {
    groups?: { services?: unknown[] }[]
    updatedAt?: unknown
  }
  if (!Array.isArray(groups)) return map
  const offDuty = typeof updatedAt === 'number' && now - updatedAt > STALE_AFTER_MS
  for (const group of groups) {
    for (const service of group?.services ?? []) {
      const { name, state, uptime90d } = (service ?? {}) as {
        name?: unknown
        state?: unknown
        uptime90d?: unknown
      }
      if (typeof name !== 'string') continue
      const known = STATES.includes(state as ServiceState) ? (state as ServiceState) : 'unknown'
      map[name] = {
        state:
          offDuty && (known === 'operational' || known === 'degraded') ? 'scheduled_off' : known,
        uptime90d: typeof uptime90d === 'number' && Number.isFinite(uptime90d) ? uptime90d : null,
      }
    }
  }
  return map
}

/** How a state reads to a visitor: a short label, a longer explanation and a tone. */
export function describe(
  status: ServiceStatus
): { label: string; detail: string; tone: 'up' | 'warn' | 'down' | 'idle' } | null {
  switch (status.state) {
    case 'operational':
      return { label: 'Online', detail: 'Online: the live demo is running now.', tone: 'up' }
    case 'degraded':
      return {
        label: 'Slow',
        detail: 'Slow: the live demo is up but responding slowly.',
        tone: 'warn',
      }
    case 'down':
      return {
        label: 'Down',
        detail: 'Down: the live demo is not responding right now.',
        tone: 'down',
      }
    case 'maintenance':
      return {
        label: 'Maintenance',
        detail: 'Maintenance: the live demo is in planned maintenance.',
        tone: 'warn',
      }
    case 'scheduled_off':
    case 'suspended':
      // Render's free tier sleeps between visits; OpenPing keeps the demos awake on weekdays.
      return {
        label: 'Asleep',
        detail:
          'Asleep: off-hours, so the first visit wakes the demo, which may take up to a minute.',
        tone: 'idle',
      }
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
