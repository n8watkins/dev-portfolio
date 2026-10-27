'use client'

import { useEffect, useRef, useState, type ComponentType } from 'react'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

/**
 * The tech stack card's easter egg, ported from n8builds-web's AI kit
 * (components/features/dino there): a pixel dino that walks along the marquee
 * rows (components/features/dino/DinoGame.tsx). This shell is all the page
 * ships up front: an empty, absolutely positioned layer (so nothing shifts)
 * that loads the game once the marquee nears the viewport. Under reduced
 * motion there is no layer and nothing loads.
 *
 * Place it inside the marquee panel (an element with `data-dino-panel`),
 * after the rows and before the edge fades, so the dino walks into the fades.
 */
export default function DinoEasterEgg() {
  const layer = useRef<HTMLDivElement>(null)
  const reduceMotion = usePrefersReducedMotion()
  const [Game, setGame] = useState<ComponentType | null>(null)

  useEffect(() => {
    const el = layer.current
    if (reduceMotion || Game || !el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        observer.disconnect()
        import('./DinoGame').then((mod) => setGame(() => mod.default))
      },
      { rootMargin: '400px 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [reduceMotion, Game])

  if (reduceMotion) return null
  return (
    <div
      ref={layer}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {Game && <Game />}
    </div>
  )
}
