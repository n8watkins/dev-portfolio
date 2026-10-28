'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'

export type PortraitTransition = 'fade' | 'slide' | 'zoom-blur'

interface PortraitRotatorProps {
  images: string[]
  alt: string
  intervalMs?: number
  transition?: PortraitTransition
  sizes?: string
  blurDataURL?: string
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
 * Cycles through a list of portrait images with a configurable transition.
 *
 * The first image is always statically rendered with `priority` so it stays
 * the LCP element; rotation only layers animated images on top of it. With a
 * single image the component behaves exactly like a static portrait.
 */
const PortraitRotator: React.FC<PortraitRotatorProps> = ({
  images,
  alt,
  intervalMs = 3000,
  transition = 'fade',
  sizes = '(max-width: 320px) 17rem, (max-width: 768px) 17rem, 20rem',
  blurDataURL,
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
      <Image
        src={images[0]}
        className="rounded-full object-cover"
        fill
        priority
        placeholder={blurDataURL ? 'blur' : 'empty'}
        blurDataURL={blurDataURL}
        sizes={sizes}
        alt={alt}
      />
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
            <Image
              src={images[index]}
              className="rounded-full object-cover"
              fill
              sizes={sizes}
              alt={alt}
            />
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}

export default PortraitRotator
