'use client'

import React from 'react'
import { motion, useReducedMotion, type Variants } from 'motion/react'
import { fadeInUpVariants, defaultAnimationConfig } from '@/lib/animations'

// Fades in on the spot: the box never moves, so a pointer that lands on it
// mid-reveal is still on it when the button is released.
const fadeInPlaceVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.7, ease: 'easeOut' } },
}

/**
 * The fade-and-rise a section heading makes as it scrolls into view. Anything
 * sitting in a row beside a heading (a "Detailed view" link, "Expand all")
 * wraps itself in this too, so the row arrives as one.
 *
 * `still` is for those controls: they fade in without rising. A link or button
 * that is 40px lower for 0.7s loses a click made in that time (the mouse goes
 * down on it and comes up on whatever it left behind, so no click lands on it).
 * Under reduced motion nothing rises either.
 */
export default function Reveal({
  children,
  className = '',
  still = false,
}: {
  children: React.ReactNode
  className?: string
  still?: boolean
}) {
  const reduced = useReducedMotion()
  return (
    <motion.div
      data-reveal=""
      variants={still || reduced ? fadeInPlaceVariants : fadeInUpVariants}
      {...defaultAnimationConfig}
      // Shown as soon as its top edge enters: a tall block (About's copy) may
      // never reach 30% in view, and the heading should peek in on its own.
      viewport={{ once: true, amount: 0.05 }}
      className={className}>
      {children}
    </motion.div>
  )
}
