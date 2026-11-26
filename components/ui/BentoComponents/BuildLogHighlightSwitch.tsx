'use client'

import { useSyncExternalStore, type ReactNode } from 'react'

/**
 * TEMPORARY (owner, 2026-11-25): `?log=3` shows the build log card's first
 * preview's stronger highlight, a lit column and the other days dimmed
 * further, so the owner can compare it with the default. It lives here, on
 * this site only, outside the card that is shared with n8builds.dev
 * (components/build-log/), which never shows it. Remove this wrapper and the
 * `[data-highlight='strong']` rules in app/globals.css once he has compared.
 */
const subscribeNever = () => () => {}
const strongHighlight = () => new URLSearchParams(window.location.search).get('log') === '3'

export default function BuildLogHighlightSwitch({ children }: { children: ReactNode }) {
  const strong = useSyncExternalStore(subscribeNever, strongHighlight, () => false)
  return (
    <div className="contents" data-highlight={strong ? 'strong' : undefined}>
      {children}
    </div>
  )
}
