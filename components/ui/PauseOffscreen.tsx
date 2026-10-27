'use client'

import React, { useEffect, useRef } from 'react'

/**
 * Marks its box with `data-offscreen` while it is outside the viewport, so CSS
 * can pause looping animations inside it (`[data-offscreen] .x {
 * animation-play-state: paused }`). No re-renders: it sets the attribute
 * directly. Without JavaScript the animations simply run.
 */
export default function PauseOffscreen({ className, children }: { className?: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(([entry]) => {
      el.toggleAttribute('data-offscreen', !entry.isIntersecting)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
