'use client'

import { useEffect, useState } from 'react'
import { STATUS_PAGE, describe, type StatusMap } from '@/lib/status'

// One request per page view, shared by every pill on the page.
let statuses: Promise<StatusMap> | null = null
function loadStatuses(): Promise<StatusMap> {
  statuses ??= fetch('/api/status')
    .then((response) => (response.ok ? response.json() : { services: {} }))
    .then((body: { services?: StatusMap }) => body.services ?? {})
    .catch(() => ({}))
  return statuses
}

type Shown = NonNullable<ReturnType<typeof describe>>

const TONES = {
  up: { dot: 'bg-emerald-400', ring: 'border-emerald-400/30 text-emerald-200' },
  warn: { dot: 'bg-amber-400', ring: 'border-amber-400/30 text-amber-200' },
  down: { dot: 'bg-rose-400', ring: 'border-rose-400/30 text-rose-200' },
  idle: { dot: 'bg-slate-400', ring: 'border-slate-400/30 text-slate-300' },
} as const

/**
 * Whether a project's live demo is up right now, from OpenPing. Shows nothing
 * until the status arrives, and nothing if it can't be read, so it never
 * claims a state it doesn't know. It shows the state only, not the uptime
 * number: the demos are monitored on weekdays only, on purpose (2026-10-26).
 */
export default function StatusPill({ name, className = '' }: { name: string; className?: string }) {
  const [status, setStatus] = useState<Shown | null>(null)

  useEffect(() => {
    let alive = true
    loadStatuses().then((map) => {
      const service = map[name]
      const described = service ? describe(service) : null
      if (alive && described) setStatus(described)
    })
    return () => {
      alive = false
    }
  }, [name])

  if (!status) return null
  const tone = TONES[status.tone]
  return (
    <a
      href={STATUS_PAGE}
      target="_blank"
      rel="noopener noreferrer"
      title={`${status.detail} Monitored by OpenPing.`}
      aria-label={`Live demo: ${status.label}. Open the status page (new tab)`}
      data-status={status.tone}
      className={`inline-flex w-fit items-center gap-2 h-6 rounded-full border bg-slate-900/60 px-2.5 text-xs font-medium transition-colors hover:bg-slate-800/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${tone.ring} ${className}`}
    >
      <span className="relative flex h-2 w-2" aria-hidden="true">
        {status.tone === 'up' && (
          <span
            className={`absolute inline-flex h-full w-full rounded-full opacity-60 motion-safe:animate-ping ${tone.dot}`}
          />
        )}
        <span className={`relative inline-flex h-2 w-2 rounded-full ${tone.dot}`} />
      </span>
      {status.label}
    </a>
  )
}

/**
 * The demos are kept awake on weekdays only; this says so once, near the pills,
 * so "Asleep" reads as expected rather than broken.
 */
export function DemoSleepNote({ className = '' }: { className?: string }) {
  return (
    <p className={`flex items-start gap-2 text-sm text-slate-400 ${className}`}>
      <span className="mt-[0.4rem] h-2 w-2 shrink-0 rounded-full bg-slate-400" aria-hidden="true" />
      <span>
        Live demos sleep on weekends; the first visit then may take a few seconds to wake.
      </span>
    </p>
  )
}
