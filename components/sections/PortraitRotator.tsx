'use client'

import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { PORTRAIT_BLUR } from '@/data/portraitBlur'

export type PortraitTransition = 'fade' | 'slide' | 'zoom-blur'

interface PortraitRotatorProps {
  images: string[]
  alt: string
  intervalMs?: number
  transition?: PortraitTransition
  sizes?: string
}

const transitionVariants = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slide: {
    initial: { x: 40, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -40, opacity: 0 },
  },
  'zoom-blur': {
    initial: { scale: 1.08, opacity: 0, filter: 'blur(8px)' },
    animate: { scale: 1, opacity: 1, filter: 'blur(0px)' },
    exit: { opacity: 0, filter: 'blur(8px)' },
  },
} as const

/**
 * One portrait over its own placeholder: the frame's background is a tiny blurred
 * copy of that portrait (data/portraitBlur.ts, generated from the photo by
 * scripts/gen-portrait-blur.mjs), never black. It is the frame's background, not
 * next/image's `placeholder`, so the photo can fade in over it. The photo is
 * visible by default (no JavaScript needed); once hydrated, a photo that has not
 * arrived yet is held transparent and fades in when it loads, instead of popping
 * in. A photo already there (cache, fast network) is not held. data: images are
 * never an LCP candidate, so the photo stays the LCP element.
 */
function PortraitFrame({ src, alt, sizes, first }: { src: string; alt: string; sizes: string; first?: boolean; heldUntilLoaded?: boolean }) {
  const frame = useRef<HTMLDivElement>(null)
  const [waiting, setWaiting] = useState(false)

  useEffect(() => {
    const img = frame.current?.querySelector('img')
    // Read once on mount from the DOM: the photo's state is outside React.
    if (img && !img.complete) setWaiting(true)
  }, [])

  const placeholder = PORTRAIT_BLUR[src]
  return (
    <div
      ref={frame}
      data-portrait-frame=""
      data-waiting={waiting ? '' : undefined}
      className="absolute inset-0 rounded-full bg-cover bg-center"
      style={placeholder ? { backgroundImage: `url("${placeholder}")` } : undefined}>
      <Image
        src={src}
        className="hero-portrait-photo rounded-full object-cover"
        fill
        {...(first
          ? {
              // The LCP element: preloaded and fetched at high priority (Next 16's
              // `priority` preloaded it at the default low priority for images).
              preload: true,
              loading: 'eager' as const,
              fetchPriority: 'high' as const,
            }
          : {})}
        sizes={sizes}
        alt={alt}
        onLoad={() => setWaiting(false)}
      />
    </div>
  )
}

/**
 * Cycles through a list of portrait images with a configurable transition.
 *
 * The first image is always statically rendered and preloaded so it stays
 * the LCP element; rotation only layers animated images on top of it. With a
 * single image the component behaves exactly like a static portrait.
 */
const PortraitRotator: React.FC<PortraitRotatorProps> = ({
  images,
  alt,
  intervalMs = 3000,
  transition = 'fade',
  sizes = '(max-width: 320px) 17rem, (max-width: 768px) 17rem, 20rem',
}) => {
  const [index, setIndex] = useState(0)
  const [hasRotated, setHasRotated] = useState(false)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    // Honor prefers-reduced-motion: hold on the first portrait, no auto-rotation.
    if (images.length <= 1 || prefersReducedMotion) return
    const id = setInterval(() => {
      setHasRotated(true)
      setIndex((prev) => (prev + 1) % images.length)
    }, intervalMs)
    return () => clearInterval(id)
  }, [images.length, intervalMs, prefersReducedMotion])

  const variants = transitionVariants[transition]

  return (
    <div className="absolute inset-0 rounded-full overflow-hidden">
      {/* Static base image - keeps LCP fast and avoids any blank frame */}
      <PortraitFrame src={images[0]} alt={alt} sizes={sizes} first />
      {hasRotated && (
        <AnimatePresence initial={false}>
          <motion.div
            key={index}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            className="absolute inset-0">
            <PortraitFrame src={images[index]} alt={alt} sizes={sizes} />
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}

export default PortraitRotator
