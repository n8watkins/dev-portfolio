'use client'

import React from 'react'
import Link from 'next/link'
import { FiGithub } from 'react-icons/fi'
import { motion } from 'framer-motion'
import { MdOpenInNew, MdOutlineUnfoldMore } from 'react-icons/md'
import IconCycle from '@/components/ui/ProjectComponents/iconCycle'
import CardImageCarousel from './CardImageCarousel'
import { staggerItemVariants } from '@/lib/animations'
import { trackProjectEvent } from '@/lib/analytics'
import { Project, IconCycleState } from '@/lib/types'

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
    <motion.div
      key={project.id}
      variants={staggerItemVariants}
      className="relative w-full max-w-full min-w-0 col-span-1">
      <div
        className={`flex flex-col ${
          index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
        } gap-6 md:gap-10 lg:gap-12 items-start`}>
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
          <div className="flex items-start justify-between gap-3 select-none">
            <div className="flex flex-col min-w-0">
              {project.liveSite ? (
                <a
                  href={project.liveSite}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Open the ${project.title} live site (new tab)`}
                  onClick={() => trackProjectEvent('live_site_click', project.title, { source: 'grid' })}
                  className="group/title flex items-center gap-1.5 w-fit cursor-pointer">
                  <h3 className="text-2xl md:text-3xl font-bold text-slate-100 truncate group-hover/title:text-sky-300 transition-colors">
                    {project.title}
                  </h3>
                  <MdOpenInNew className="w-5 h-5 flex-shrink-0 text-slate-400 group-hover/title:text-sky-300 transition-colors" aria-hidden="true" />
                </a>
              ) : (
                <h3 className="text-2xl md:text-3xl font-bold text-slate-100 truncate">
                  {project.title}
                </h3>
              )}
              <span className="mt-1 text-xs md:text-sm font-semibold uppercase tracking-wider text-sky-400/90 truncate">
                {project.subTitle}
              </span>
            </div>

            <div className="flex items-center gap-4 flex-shrink-0 pt-1.5">
              {project.github && (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`View ${project.title} source on GitHub`}
                  onClick={() => trackProjectEvent('github_click', project.title, { source: 'grid' })}
                  className="flex items-center gap-1.5 text-sm text-slate-300 hover:text-sky-400 transition-colors rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-darkBlue">
                  <FiGithub className="w-5 h-5" aria-hidden="true" />
                  <span className="hidden lg:inline underline underline-offset-2 decoration-1">Source</span>
                </a>
              )}
              <Link
                href={`/projects/${project.slug}`}
                aria-label={`View ${project.title} details`}
                onClick={() => trackProjectEvent('view', project.title, { source: 'grid' })}
                className="flex items-center gap-1.5 text-sm text-slate-300 hover:text-sky-400 transition-colors rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-darkBlue">
                <MdOutlineUnfoldMore className="w-5 h-5" />
                <span className="hidden lg:inline underline underline-offset-2 decoration-1 whitespace-nowrap">
                  Details
                </span>
              </Link>
            </div>
          </div>

          <p className="text-base md:text-lg text-slate-700 dark:text-slate-300 leading-relaxed select-none">
            {project.des}
          </p>

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
    </motion.div>
  )
}

ProjectCard.displayName = 'ProjectCard'

export default ProjectCard
