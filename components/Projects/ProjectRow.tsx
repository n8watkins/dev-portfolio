'use client'

import React, { useRef } from 'react'
import { motion } from 'motion/react'
import { fadeInUpVariants, defaultAnimationConfig } from '@/lib/animations'
import { accents } from '@/lib/accents'
import type { Project } from '@/lib/types'
import PauseOffscreen from '@/components/ui/PauseOffscreen'
import ProjectShowcase from './ProjectShowcase'
import PixelMark from './PixelMark'
import { markFor } from './marks'

/**
 * One project on the home page: its card and its pixel mark. On wide screens
 * (xl, 1280px and up) the card takes 60% of the width, on alternating sides,
 * and the mark stands in the open grid beside it; below that the card is full
 * width and the mark is not drawn.
 */
export default function ProjectRow({ project, index }: { project: Project; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const side = index % 2 === 0 ? 'right' : 'left' // the mark's side
  const kind = markFor[project.accent]
  return (
    <PauseOffscreen className={`relative flex ${side === 'right' ? '' : 'xl:justify-end'}`}>
      <motion.div
        ref={cardRef}
        variants={fadeInUpVariants}
        {...defaultAnimationConfig}
        viewport={{ once: true, amount: 0.1 }}
        className="w-full xl:w-[60%]"
        data-grid-avoid=""
      >
        <ProjectShowcase project={project} />
      </motion.div>
      <PixelMark
        kind={kind}
        rgb={accents[project.accent].rgb}
        side={side}
        // The bird looks toward its card.
        mirror={kind === 'wren' && side === 'right'}
        cardRef={cardRef}
      />
    </PauseOffscreen>
  )
}
