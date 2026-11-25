'use client'

import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
import { latestEntry } from '@/lib/intersection'
import Backdrop from './Backdrop'

// The map's code, shaders and data (about 50 KB of places and elevations) load
// only when the card nears the screen, never with the page.
const BoldMap = dynamic(() => import('./BoldMap'), {
  ssr: false,
  loading: () => <Backdrop visitor={null} />,
})

/**
 * The home page's bold map: the card's navy, caption and screen-reader
 * sentence at once (and on the server), the map itself once the card is within
 * a screen or so of the viewport. The visitor's rough location is asked for by
 * the map after it is up (/api/where), so the page stays static.
 */
export default function BoldMapLazy() {
  const ref = useRef<HTMLDivElement>(null)
  const [near, setNear] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (!latestEntry(entries).isIntersecting) return
        setNear(true)
        io.disconnect()
      },
      { rootMargin: '300px 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <div
      ref={ref}
      data-bold-map-slot
      className="absolute inset-0 overflow-hidden bg-[#0b1b36] @container"
    >
      {near ? <BoldMap locate /> : <Backdrop visitor={null} />}
    </div>
  )
}
