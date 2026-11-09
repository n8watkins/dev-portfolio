'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import { FiArrowRight } from 'react-icons/fi'
import SectionHeading from '@/components/ui/SectionHeading'
import { stackHighlights } from '@/data/stackLayers'
import { fadeInUpVariants, defaultAnimationConfig } from '@/lib/animations'

/**
 * The home page's stack, compact (owner, 2026-11-08): a row of the tools I
 * reach for most, and "See my stack" to /stack, which has all of it by layer
 * and the dino game.
 */
export default function StackRow() {
  return (
    <div className="px-2 pt-6 pb-10 select-none md:px-4 md:pb-16">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeading eyebrow="Stack" title="What I build with" />
        <Link
          href="/stack"
          className="group inline-flex shrink-0 items-center gap-1.5 self-start rounded-xl border border-white/12 bg-white/4 px-3.5 py-2 text-sm font-semibold whitespace-nowrap text-slate-100 transition-colors hover:border-sky-400/50 hover:bg-white/8 hover:text-sky-200 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-400 sm:self-auto"
        >
          See my stack
          <FiArrowRight
            className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>
      </div>
      <motion.ul
        variants={fadeInUpVariants}
        {...defaultAnimationConfig}
        aria-label="Some of my stack"
        className="mt-6 grid grid-cols-6 gap-2 sm:gap-3 md:grid-cols-12"
      >
        {stackHighlights.map((tech) => (
          <li
            key={tech.name}
            title={tech.name}
            className="flex aspect-square items-center justify-center rounded-xl border border-white/8 bg-white/4"
          >
            <span aria-hidden="true" className="flex size-6 *:size-full! sm:size-7">
              {tech.icon}
            </span>
            <span className="sr-only">{tech.name}</span>
          </li>
        ))}
      </motion.ul>
    </div>
  )
}
