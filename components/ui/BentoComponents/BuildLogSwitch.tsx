'use client'

import { useSyncExternalStore } from 'react'
import BuildLogCard from './BuildLogCard'
import BuildLogCardV2 from './BuildLogCardV2'

const subscribe = () => () => {}

/**
 * The build log card, or its preview with ?log=2 (owner, 2026-11-25), so the
 * two can be compared on one server. Without the switch it is the live card.
 * The server, and hydration, always render the live card.
 */
export default function BuildLogSwitch() {
  const version = useSyncExternalStore(
    subscribe,
    () => new URLSearchParams(window.location.search).get('log'),
    () => null
  )
  return version === '2' ? <BuildLogCardV2 /> : <BuildLogCard />
}
