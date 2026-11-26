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
import { projectAnchor } from '@/data/stack'

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
      {/* The card's anchor (/#project-<slug>): the stack's links land here
          (lib/projectAnchor.ts). It never moves, unlike the card inside it,
          which slides up as it reveals, so a scroll to it lands where the
          card ends up; it takes focus when a link lands on it. */}
      <div id={projectAnchor(project.slug)} data-project-anchor="" tabIndex={-1} className="w-full xl:w-[60%]">
        <motion.div
          ref={cardRef}
          variants={fadeInUpVariants}
          {...defaultAnimationConfig}
          viewport={{ once: true, amount: 0.1 }}
          className="w-full"
          data-grid-avoid=""
        >
          <ProjectShowcase project={project} />
        </motion.div>
      </div>
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
