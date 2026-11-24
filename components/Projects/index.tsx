'use client'

import React, { Suspense, useRef } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion } from 'motion/react'
import { FiArrowRight } from 'react-icons/fi'
import { fadeInUpVariants, defaultAnimationConfig } from '@/lib/animations'
import { accents } from '@/lib/accents'
import { projects } from '@/data/projects'
import type { Project } from '@/lib/types'
import PauseOffscreen from '@/components/ui/PauseOffscreen'
import ProjectShowcase from './ProjectShowcase'
import BuildsTeaser from './BuildsTeaser'
import PixelMark from './PixelMark'
import GridLife from './GridLife'
import { DemoSleepNote } from './StatusPill'
import { markFor, marksMode, type MarksMode } from './marks'
import styles from './marks.module.css'
import SectionHeading from '@/components/ui/SectionHeading'
import Reveal from '@/components/ui/Reveal'

const BLURB =
  'AI is changing what software can do and how it gets made. Each project here puts AI to work: a leaderboard that Gemini helps rank, a recommender that learns your taste, and Wren, an assistant that researches and remembers.'

/**
 * LAB (exp/project-marks): one project's row with the marks on. On wide
 * screens (xl, 1280px) the card takes 60% of the width, alternating sides,
 * and its pixel mark stands in the open grid beside it; below that the card
 * is full width and the mark is not drawn.
 */
function MarkRow({ project, index, still }: { project: Project; index: number; still: boolean }) {
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
        <ProjectShowcase project={project} narrow />
      </motion.div>
      <PixelMark
        kind={kind}
        rgb={accents[project.accent].rgb}
        side={side}
        // The bird looks toward its card.
        mirror={kind === 'wren' && side === 'right'}
        still={still}
        cardRef={cardRef}
      />
    </PauseOffscreen>
  )
}

/**
 * The home page's projects, first after the hero (owner, 2026-11-08): the
 * each project as one big card (Portfolio Rank first), then the
 * n8builds.dev teaser. "Detailed view" opens /projects, with every project at
 * full size.
 *
 * LAB: on this branch the section also carries the hero's grid and the pixel
 * marks; `?marks=0` shows today's layout, `?marks=quiet|bold` the loudness,
 * `?marks=still` the marks without their idle actions.
 */
function ProjectsBody({ mode }: { mode: MarksMode }) {
  const lab = mode !== 'off'
  return (
    <div
      data-marks-root={lab ? '' : undefined}
      data-level={lab ? mode : undefined}
      className={`flex w-full flex-col gap-5 pt-14 pb-6 text-slate-200 md:pt-16 md:pb-12 ${lab ? `${styles.root} relative isolate` : ''}`}
    >
      {lab && (
        <div data-marks-grid="" aria-hidden="true" className={`${styles.grid} -z-10`}>
          <GridLife />
        </div>
      )}
      <div
        data-grid-avoid={lab ? '' : undefined}
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
        <Reveal className="shrink-0 self-start sm:self-auto">
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
        data-grid-avoid={lab ? '' : undefined}
        className="max-w-3xl px-2 text-base leading-relaxed text-slate-400 md:px-4 md:text-lg/7"
      >
        {BLURB}
      </motion.p>
      {/* The weekday note only matters while a monitored demo is on the page. */}
      {projects.some((p) => p.statusName) &&
        (lab ? (
          <div data-grid-avoid="">
            <DemoSleepNote className="px-2 md:px-4" />
          </div>
        ) : (
          <DemoSleepNote className="px-2 md:px-4" />
        ))}

      <div className="mt-4 flex w-full flex-col gap-8 px-2 md:gap-10 md:px-4">
        {projects.map((project, index) =>
          lab ? (
            <MarkRow key={project.id} project={project} index={index} still={mode === 'still'} />
          ) : (
            <motion.div
              key={project.id}
              variants={fadeInUpVariants}
              {...defaultAnimationConfig}
              viewport={{ once: true, amount: 0.1 }}
            >
              <ProjectShowcase project={project} />
            </motion.div>
          )
        )}
        <motion.div
          variants={fadeInUpVariants}
          {...defaultAnimationConfig}
          className="select-none"
          data-grid-avoid={lab ? '' : undefined}
        >
          <BuildsTeaser />
        </motion.div>
      </div>
    </div>
  )
}

function ProjectsFromQuery() {
  return <ProjectsBody mode={marksMode(useSearchParams().get('marks'))} />
}

const Projects: React.FC = () => (
  <Suspense fallback={<ProjectsBody mode="default" />}>
    <ProjectsFromQuery />
  </Suspense>
)

export default Projects
