/**
 * The current state of an IntersectionObserver's target. One callback can carry
 * several entries for the same target, oldest first: when the page scrolls
 * before the first delivery (a jump to a section right after load), it gets
 * the initial "not intersecting" and then "intersecting" together. Reading the
 * first entry acted on the stale one, so a section stayed hidden and a video
 * never started until the next scroll (2026-11-03). For an observer with one
 * target, use the last entry.
 */
export function latestEntry(entries: IntersectionObserverEntry[]): IntersectionObserverEntry {
  return entries[entries.length - 1]
}
