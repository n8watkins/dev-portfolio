import React, { createContext, useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useHydrated } from '@/hooks/useHydrated'

/**
 * True inside the loop's duplicate copies. Focusable children should leave the
 * tab order there (tabIndex -1), so keyboard users reach each item once.
 */
export const MarqueeCopyContext = createContext(false)

interface MarqueeProps {
  /** Accessible name for the list, used when it becomes a scrollable region. */
  label: string
  className?: string
  reverse?: boolean
  pauseOnHover?: boolean
  children?: React.ReactNode
  vertical?: boolean
  repeat?: number
  [key: string]: any
}

export default function Marquee({
  label,
  className,
  reverse,
  pauseOnHover = false,
  children,
  vertical = false,
  repeat = 4,
  ...props
}: MarqueeProps) {
  const [isHovered, setIsHovered] = useState(false)
  // Focus inside (a keyboard user, or a tapped tile) always pauses, so the
  // focused item doesn't slide out from under the visitor.
  const [hasFocus, setHasFocus] = useState(false)
  const isPaused = (pauseOnHover && isHovered) || hasFocus
  // The items are server-rendered, so a visitor can focus one before the page
  // hydrates, when React isn't listening yet and onFocus never fires. Catch
  // that once hydrated, or the focused item slides away.
  const firstCopy = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (firstCopy.current?.contains(document.activeElement)) setHasFocus(true)
  }, [])
  const reduceMotion = usePrefersReducedMotion()
  // The server sends one copy of the items; the loop's duplicates are added
  // once the page hydrates. They only make the loop seamless, and repeating
  // every tile in the HTML made the page heavy to download and parse.
  const copies = useHydrated() ? repeat : 1
  const rowRef = useRef<HTMLDivElement>(null)

  // The first copy started animating at first paint; the loop's copies join
  // after hydration. Line them up with it, or they run out of step and the
  // copies drift over each other.
  useEffect(() => {
    const tracks = rowRef.current ? [...rowRef.current.children] : []
    const animations = tracks.map((track) => track.getAnimations()[0]).filter(Boolean)
    const lead = animations[0]
    if (!lead || animations.length < 2) return
    let cancelled = false
    // Once every copy has started, give them the lead's clock.
    Promise.all(animations.map((animation) => animation.ready))
      .then(() => {
        if (cancelled) return
        for (const animation of animations.slice(1)) {
          if (lead.startTime !== null && animation.startTime !== null)
            animation.startTime = lead.startTime
          else animation.currentTime = lead.currentTime
        }
      })
      // A copy replaced or cancelled mid-way has nothing left to sync.
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [copies])

  // Reduced motion: show every item once instead of a frozen track that clips
  // items at the edges. Small screens get a row the visitor swipes themselves;
  // wider ones wrap the items into a centred grid.
  if (reduceMotion) {
    return (
      <div
        {...props}
        // Scrollable on small screens, so it must be reachable by keyboard.
        role="region"
        aria-label={label}
        tabIndex={0}
        className={cn(
          'flex p-2 [--gap:1rem] gap-(--gap)',
          vertical
            ? 'flex-col items-center'
            : 'w-full snap-x overflow-x-auto md:flex-wrap md:justify-center md:overflow-visible *:shrink-0 *:snap-start',
          className
        )}
      >
        {children}
      </div>
    )
  }

  return (
    <div
      {...props}
      ref={rowRef}
      className={cn(
        'flex overflow-hidden p-2 [--duration:40s] [--gap:1rem] gap-(--gap)',
        {
          'flex-row': !vertical,
          'flex-col': vertical,
        },
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setHasFocus(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setHasFocus(false)
      }}
    >
      {Array(copies)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            ref={i === 0 ? firstCopy : undefined}
            // The copies only make the loop seamless: hide them from assistive
            // tech so each item is announced once (see MarqueeCopyContext).
            aria-hidden={i > 0 || undefined}
            className={cn('flex shrink-0 justify-around gap-(--gap)', {
              'animate-marquee flex-row': !vertical,
              'animate-marquee-vertical flex-col': vertical,
              '[animation-play-state:paused]': isPaused,
              '[animation-direction:reverse]': reverse,
            })}
          >
            <MarqueeCopyContext.Provider value={i > 0}>{children}</MarqueeCopyContext.Provider>
          </div>
        ))}
    </div>
  )
}
