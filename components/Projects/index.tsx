import React from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import { FiArrowRight } from 'react-icons/fi'
import { fadeInUpVariants, defaultAnimationConfig } from '@/lib/animations'
import { projects } from '@/data/projects'
import BuildsTeaser from './BuildsTeaser'
import GridLife from './GridLife'
import ProjectRow from './ProjectRow'
import { DemoSleepNote } from './StatusPill'
import styles from './marks.module.css'
import SectionHeading from '@/components/ui/SectionHeading'
import Reveal from '@/components/ui/Reveal'

const BLURB =
  'AI is changing what software can do and how it gets made. Each project here puts AI to work: a leaderboard that Gemini helps rank, a recommender that learns your taste, and Wren, an assistant that researches and remembers.'

/**
 * The home page's projects, first after the hero (owner, 2026-11-08): each
 * project as one big card (Portfolio Rank first), then the n8builds.dev
 * teaser. "Detailed view" opens /projects, with every project at full size.
 *
 * The section carries the hero's grid (owner, 2026-11-24): its own wandering
 * lit cells (GridLife) and, on wide screens, each project's pixel mark beside
 * its card (ProjectRow, PixelMark). Everything the grid's cells must keep off
 * is marked `data-grid-avoid`.
 */
const Projects: React.FC = () => {
  return (
    <div
      data-marks-root=""
      className={`${styles.root} relative isolate flex w-full flex-col gap-5 pt-14 pb-6 text-slate-200 md:pt-16 md:pb-12`}
    >
      <div data-marks-grid="" aria-hidden="true" className={`${styles.grid} -z-10`}>
        <GridLife />
      </div>
      <div
        data-grid-avoid=""
        className="flex flex-col gap-4 px-2 sm:flex-row sm:items-end sm:justify-between md:px-4"
      >
        <SectionHeading
          eyebrow="Selected projects"
          title={
            <>
              Building for the <span className="text-sky-400">AI-native web</span>
            </>
          }
        />
        <Reveal still className="shrink-0 self-start sm:self-auto">
          <Link
            href="/projects"
            className="group inline-flex items-center gap-1.5 rounded-xl border border-white/12 bg-white/4 px-3.5 py-2 text-sm font-semibold whitespace-nowrap text-slate-100 transition-colors hover:border-sky-400/50 hover:bg-white/8 hover:text-sky-200 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-400"
          >
            Detailed view
            <FiArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </Reveal>
      </div>
      <motion.p
        variants={fadeInUpVariants}
        {...defaultAnimationConfig}
        data-grid-avoid=""
        className="max-w-3xl px-2 text-base leading-relaxed text-slate-400 md:px-4 md:text-lg/7"
      >
        {BLURB}
      </motion.p>
      {/* The weekday note only matters while a monitored demo is on the page. */}
      {projects.some((p) => p.statusName) && (
        <div data-grid-avoid="">
          <DemoSleepNote className="px-2 md:px-4" />
        </div>
      )}

      <div className="mt-4 flex w-full flex-col gap-8 px-2 md:gap-10 md:px-4">
        {projects.map((project, index) => (
          <ProjectRow key={project.id} project={project} index={index} />
        ))}
        <motion.div
          variants={fadeInUpVariants}
          {...defaultAnimationConfig}
          className="select-none"
          data-grid-avoid=""
        >
          <BuildsTeaser />
        </motion.div>
      </div>
    </div>
  )
}

export default Projects
