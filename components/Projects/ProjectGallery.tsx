'use client'
import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { useHydrated } from '@/hooks/useHydrated'

/**
 * A project's screenshots with left/right, ported from n8builds-web's Lab
 * rows (components/sections/FeaturedProjectIslands.tsx, ProjectGallery),
 * with an accent outline.
 */

export interface GalleryImage {
  src: string
  alt: string
}

/** How far a finger must travel sideways to count as a swipe, in pixels. */
const SWIPE = 40

/**
 * The row's screenshots, one at a time. Click (or tap) the left or right half
 * to step back or forward: an arrow shows on that side on hover or keyboard
 * focus. The arrow keys work once a side has focus, and a swipe works on touch.
 * Dots at the bottom show where you are. Only the first image loads up front;
 * the rest load once the visitor shows interest (hover, focus or touch), so
 * the homepage downloads no extra screenshots for rows nobody browses.
 * The Details dialog uses it too, at its own width (`className`, `sizes`).
 */
export default function ProjectGallery({
  title,
  images,
  imageClassName,
  className = 'w-full shrink-0 md:w-1/2',
  sizes = '(max-width: 768px) 100vw, 50vw',
  frameClassName = 'border-white/8',
  dotClassName = 'bg-cyan-300/70',
  onOpen,
}: {
  title: string
  images: GalleryImage[]
  imageClassName: string
  /** The gallery's own box: half the row by default. */
  className?: string
  /** The images' `sizes`, for that box. */
  sizes?: string
  /** The frame's border and hover glow (the project's accent). */
  frameClassName?: string
  /** The current screenshot's dot (the project's accent). */
  dotClassName?: string
  /** A single image's click (no arrows to take it): open the project. */
  onOpen?: () => void
}) {
  const [active, setActive] = useState(0)
  const [warm, setWarm] = useState(false)
  const touchX = useRef<number | null>(null)
  const swiped = useRef(false)
  const hydrated = useHydrated()
  const count = images.length
  const many = count > 1
  const go = (step: number) => {
    setWarm(true)
    setActive((i) => (i + step + count) % count)
  }
  const warmUp = () => setWarm(true)
  return (
    <div
      data-gallery
      role={many ? 'group' : undefined}
      aria-roledescription={many ? 'carousel' : undefined}
      aria-label={many ? `${title} screenshots` : undefined}
      onPointerEnter={many ? warmUp : undefined}
      onFocus={many ? warmUp : undefined}
      onKeyDown={
        many
          ? (e) => {
              if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                e.preventDefault()
                go(e.key === 'ArrowLeft' ? -1 : 1)
              }
            }
          : undefined
      }
      onTouchStart={
        many
          ? (e) => {
              warmUp()
              touchX.current = e.touches[0].clientX
              swiped.current = false
            }
          : undefined
      }
      onTouchEnd={
        many
          ? (e) => {
              if (touchX.current === null) return
              const dx = e.changedTouches[0].clientX - touchX.current
              touchX.current = null
              if (Math.abs(dx) >= SWIPE) {
                swiped.current = true
                go(dx < 0 ? 1 : -1)
              }
            }
          : undefined
      }
      className={`touch-pan-y ${className}`}
    >
      <div
        className={`group relative aspect-16/10 overflow-hidden rounded-2xl border bg-[#07101d] transition-[border-color,box-shadow] duration-300 ${frameClassName} ${!many && onOpen ? 'cursor-pointer' : ''}`}
        onClick={!many ? onOpen : undefined}
      >
        {images.map((image, i) =>
          i === 0 || warm || i === active ? (
            <Image
              key={image.src}
              src={image.src}
              alt={i === active ? image.alt : ''}
              aria-hidden={i === active ? undefined : true}
              fill
              sizes={sizes}
              className={`${imageClassName} transition-opacity duration-300 motion-reduce:transition-none ${i === active ? 'opacity-100' : 'opacity-0'}`}
            />
          ) : null
        )}
        {/* Subtle overlay */}
        <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-darkBlue/40 to-transparent" />

        {many && (
          <>
            {(['prev', 'next'] as const).map((side) => (
              <button
                key={side}
                type="button"
                // Server-rendered: disabled until its handler exists, so an early click isn't lost.
                disabled={!hydrated}
                onClick={() => {
                  // A swipe that ends over a half must not also step.
                  if (swiped.current) {
                    swiped.current = false
                    return
                  }
                  go(side === 'prev' ? -1 : 1)
                }}
                aria-label={`${side === 'prev' ? 'Previous' : 'Next'} ${title} screenshot`}
                className={`group/side absolute inset-y-0 ${side === 'prev' ? 'left-0 justify-start' : 'right-0 justify-end'} flex w-1/2 cursor-pointer items-center px-3 focus-visible:outline-hidden disabled:cursor-default`}
              >
                <span
                  aria-hidden="true"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-[#07101d]/75 text-slate-100 opacity-0 shadow-lg shadow-black/40 backdrop-blur-xs transition-opacity duration-150 group-hover/side:opacity-100 group-focus-visible/side:opacity-100 group-focus-visible/side:ring-2 group-focus-visible/side:ring-cyan-300 motion-reduce:transition-none"
                >
                  {side === 'prev' ? (
                    <FiChevronLeft className="h-5 w-5" />
                  ) : (
                    <FiChevronRight className="h-5 w-5" />
                  )}
                </span>
              </button>
            ))}
          </>
        )}
      </div>
      {many && (
        <>
          {/* Where you are, just under the image: one dot per screenshot, in the
              project's colour, each a button that shows its screenshot (the
              padding gives a fingertip-sized target around the small dot). */}
          <div className="mt-1 flex justify-center">
            {images.map((image, i) => (
              <button
                key={image.src}
                type="button"
                disabled={!hydrated}
                onClick={() => {
                  warmUp()
                  setActive(i)
                }}
                aria-label={`Show ${title} screenshot ${i + 1} of ${count}`}
                aria-current={i === active ? 'true' : undefined}
                className="group/dot flex h-6 cursor-pointer items-center px-1 focus-visible:outline-hidden disabled:cursor-default"
              >
                <span
                  data-dot
                  data-active={i === active ? '' : undefined}
                  className={`h-1.5 rounded-full transition-[width,background-color] duration-200 group-focus-visible/dot:ring-2 group-focus-visible/dot:ring-cyan-300 motion-reduce:transition-none ${
                    i === active ? `w-5 ${dotClassName}` : 'w-1.5 bg-white/25 group-hover/dot:bg-white/50'
                  }`}
                />
              </button>
            ))}
          </div>
          <p className="sr-only" aria-live="polite">
            {`Screenshot ${active + 1} of ${count}`}
          </p>
        </>
      )}
    </div>
  )
}
