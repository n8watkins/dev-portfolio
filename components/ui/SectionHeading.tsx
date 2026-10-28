'use client'

import React from 'react'
import { motion } from 'motion/react'
import { fadeInUpVariants, defaultAnimationConfig } from '@/lib/animations'

/**
 * Every section's heading, in n8builds.dev's style: a small label, then a
 * left-aligned heading, then an optional line or two under it.
 */
export default function SectionHeading({
  eyebrow,
  title,
  children,
  className = '',
}: {
  eyebrow: string
  title: React.ReactNode
  children?: React.ReactNode
  className?: string
}) {
  return (
    <motion.div
      variants={fadeInUpVariants}
      {...defaultAnimationConfig}
      // Shown as soon as its top edge enters: a tall block (About's copy) may
      // never reach 30% in view, and the heading should peek in on its own.
      viewport={{ once: true, amount: 0.05 }}
      className={`w-full text-left select-none ${className}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-400">{eyebrow}</p>
      <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-slate-100">{title}</h2>
      {children && (
        <div className="mt-4 max-w-3xl text-base md:text-lg/7 leading-relaxed text-slate-400">
          {children}
        </div>
      )}
    </motion.div>
  )
}
