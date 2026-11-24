'use client'

import React from 'react'
import { motion } from 'motion/react'
import { fadeInUpVariants, defaultAnimationConfig } from '@/lib/animations'

/**
 * The fade-and-rise a section heading makes as it scrolls into view. Anything
 * sitting in a row beside a heading (a "Detailed view" link, "Expand all")
 * wraps itself in this too, so the row arrives as one.
 */
export default function Reveal({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.div
      data-reveal=""
      variants={fadeInUpVariants}
      {...defaultAnimationConfig}
      // Shown as soon as its top edge enters: a tall block (About's copy) may
      // never reach 30% in view, and the heading should peek in on its own.
      viewport={{ once: true, amount: 0.05 }}
      className={className}>
      {children}
    </motion.div>
  )
}
