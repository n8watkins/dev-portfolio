import { useSyncExternalStore } from 'react'

function subscribe() {
  return () => {}
}

/**
 * False during the server render and hydration, true once React has taken
 * over the page. Use it to keep controls disabled until their handlers exist.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  )
}
