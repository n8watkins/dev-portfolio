'use client'

import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { FiPause, FiPlay } from 'react-icons/fi'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { latestEntry } from '@/lib/intersection'

/**
 * A few muted seconds of the live demo in use, looping, in the project's
 * accent frame (16:10, like the screenshots). The poster paints first; the
 * video loads only once its row nears the screen, plays while it is on
 * screen and pauses off it. Under reduced motion it stays on the poster
 * until the visitor presses play. The corner button pauses and plays it
 * (WCAG 2.2.2: anything moving for more than five seconds can be stopped).
 * Clicking the clip opens the project's page.
 */
export default function ProjectClip({
  title,
  src,
  poster,
  alt,
  frameClassName = 'border-white/8',
  onOpen,
  className = 'w-full shrink-0 md:w-1/2',
}: {
  title: string
  src: string
  poster: string
  alt: string
  frameClassName?: string
  onOpen?: () => void
  className?: string
}) {
  const box = useRef<HTMLDivElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const reduceMotion = usePrefersReducedMotion()
  // Loaded once near the screen; never before (the homepage stays light).
  const [near, setNear] = useState(false)
  const [visible, setVisible] = useState(false)
  // null: follow the defaults (play unless reduced motion); true/false: the visitor's choice.
  const [choice, setChoice] = useState<boolean | null>(null)
  const wanted = choice ?? !reduceMotion
  const playing = wanted && visible && near

  useEffect(() => {
    const el = box.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const nearby = new IntersectionObserver(
      (entries) => {
        if (latestEntry(entries).isIntersecting) {
          setNear(true)
          nearby.disconnect()
        }
      },
      { rootMargin: '400px 0px' }
    )
    const onScreen = new IntersectionObserver(
      (entries) => setVisible(latestEntry(entries).isIntersecting),
      { threshold: 0.25 }
    )
    nearby.observe(el)
    onScreen.observe(el)
    return () => {
      nearby.disconnect()
      onScreen.disconnect()
    }
  }, [])

  useEffect(() => {
    const v = video.current
    if (!v) return
    if (playing) v.play().catch(() => {})
    else v.pause()
  }, [playing])

  return (
    <div ref={box} className={className}>
      <div
        className={`group/clip relative aspect-16/10 overflow-hidden rounded-2xl border bg-[#07101d] transition-[border-color,box-shadow] duration-300 ${frameClassName}`}
      >
        <button
          type="button"
          onClick={onOpen}
          aria-label={`Open ${title}'s page`}
          className="absolute inset-0 cursor-pointer focus-visible:outline-hidden"
        >
          {/* The poster: the first paint, and all that shows under reduced motion. */}
          <Image src={poster} alt={alt} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover object-top" />
          {near && wanted && (
            <video
              ref={video}
              muted
              loop
              playsInline
              preload="auto"
              poster={poster}
              aria-hidden="true"
              className={`absolute inset-0 h-full w-full object-cover object-top transition-opacity duration-300 ${playing ? 'opacity-100' : 'opacity-0'}`}
            >
              <source src={src} type="video/mp4" />
            </video>
          )}
          <span className="pointer-events-none absolute inset-0 bg-linear-to-t from-darkBlue/30 to-transparent" />
        </button>
        <button
          type="button"
          onClick={() => setChoice(!wanted)}
          aria-label={wanted ? `Pause the ${title} clip` : `Play the ${title} clip`}
          className="absolute bottom-2.5 right-2.5 flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-[#07101d]/75 text-slate-100 opacity-70 shadow-lg shadow-black/40 backdrop-blur-xs transition-opacity duration-150 hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-cyan-300 group-hover/clip:opacity-100"
        >
          {wanted ? <FiPause className="h-4 w-4" aria-hidden="true" /> : <FiPlay className="h-4 w-4 translate-x-px" aria-hidden="true" />}
        </button>
      </div>
    </div>
  )
}
