'use client'

import React from 'react'
import Link from 'next/link'
import StatusPill from './StatusPill'
import { FiBookOpen, FiGithub } from 'react-icons/fi'
import { motion } from 'framer-motion'
import { MdOpenInNew } from 'react-icons/md'
import IconCycle from '@/components/ui/ProjectComponents/iconCycle'
import CardImageCarousel from './CardImageCarousel'
import { staggerItemVariants } from '@/lib/animations'
import { trackProjectEvent } from '@/lib/analytics'
import { Project, IconCycleState } from '@/lib/types'

const ACTION =
  'inline-flex items-center gap-2 h-10 px-3.5 sm:px-4 rounded-full border text-sm font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-darkBlue'
const OUTLINE =
  'border-slate-600 text-slate-200 hover:border-sky-400/60 hover:text-sky-300 hover:bg-slate-800/60'

interface ProjectCardProps {
  project: Project
  index: number
  onProjectClick: (project: Project) => void
  onIconClick: (project: Project) => void
  iconCycleState: IconCycleState
  onIconCycleStateChange: (
    state: IconCycleState | ((prevState: IconCycleState) => IconCycleState)
  ) => void
}

/**
 * ProjectCard - alternating "back and forth" layout. One side is the auto-cycling
 * image; the other stacks the title over its description and the tech-stack cycler.
 * Sides flip per card (even = image left, odd = image right).
 */
const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  index,
  onProjectClick,
  onIconClick,
  iconCycleState,
  onIconCycleStateChange,
}) => {
  return (
    <motion.article
      key={project.id}
      variants={staggerItemVariants}
      aria-label={project.title}
      className="relative w-full max-w-full min-w-0 col-span-1"
    >
      <div
        className={`flex flex-col ${
          index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
        } gap-6 md:gap-10 lg:gap-12 items-start`}
      >
        {/* Image side - just the screenshot */}
        <div className="w-full md:w-1/2 min-w-0">
          <CardImageCarousel
            images={project.images}
            alt={project.title}
            onClick={() => onProjectClick(project)}
          />
        </div>

        {/* Text side - title over description + tech stack */}
        <div className="w-full md:w-1/2 flex flex-col gap-3 min-w-0">
          <div className="flex flex-col min-w-0 select-none">
            <h3 className="text-2xl md:text-3xl font-bold text-slate-100 truncate">
              {project.title}
            </h3>
            <span className="mt-1 text-xs md:text-sm font-semibold uppercase tracking-wider text-sky-400/90 truncate">
              {project.subTitle}
            </span>
            {/* The row's height is reserved, so the pill arriving moves nothing. */}
            {project.statusName && (
              <div className="mt-2 h-6">
                <StatusPill name={project.statusName} />
              </div>
            )}
          </div>

          <p className="text-base md:text-lg text-slate-700 dark:text-slate-300 leading-relaxed select-none">
            {project.des}
          </p>

          {/* The demo is the point: one row of real buttons, as on n8builds.dev's Lab rows. */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 pt-1">
            {project.liveSite && (
              <a
                href={project.liveSite}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Try the ${project.title} live demo (new tab)`}
                onClick={() =>
                  trackProjectEvent('live_site_click', project.title, { source: 'grid' })
                }
                className={`${ACTION} text-white bg-gradient-to-r from-cyan-500 to-blue-600 border-transparent hover:from-cyan-400 hover:to-blue-500 hover:shadow-lg hover:shadow-sky-500/30`}
              >
                <MdOpenInNew className="w-4 h-4" aria-hidden="true" />
                Live demo
              </a>
            )}
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`View ${project.title} source on GitHub (new tab)`}
                onClick={() => trackProjectEvent('github_click', project.title, { source: 'grid' })}
                className={`${ACTION} ${OUTLINE}`}
              >
                <FiGithub className="w-4 h-4" aria-hidden="true" />
                Source
              </a>
            )}
            <Link
              href={`/projects/${project.slug}`}
              aria-label={`View ${project.title} details`}
              onClick={() => trackProjectEvent('view', project.title, { source: 'grid' })}
              className={`${ACTION} ${OUTLINE}`}
            >
              <FiBookOpen className="w-4 h-4" aria-hidden="true" />
              Details
            </Link>
          </div>

          <IconCycle
            technologies={project.technologies}
            orientation="h"
            view="simple"
            initialCategory={iconCycleState?.currentCategory}
            initialIconIndex={iconCycleState?.cycledIconIndex}
            onStateChange={onIconCycleStateChange}
            onIconClick={() => onIconClick(project)}
            projectId={project.id}
          />
        </div>
      </div>
    </motion.article>
  )
}

ProjectCard.displayName = 'ProjectCard'

export default ProjectCard
