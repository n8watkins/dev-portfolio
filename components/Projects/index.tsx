import React from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import { FiArrowRight } from 'react-icons/fi'
import { fadeInUpVariants, defaultAnimationConfig } from '@/lib/animations'
import { projects } from '@/data/projects'
import ProjectShowcase from './ProjectShowcase'
import BuildsTeaser from './BuildsTeaser'
import { DemoSleepNote } from './StatusPill'
import SectionHeading from '@/components/ui/SectionHeading'

const BLURB =
  'AI is changing what software can do and how it gets made. Each project here puts AI to work: Wren, an assistant that researches and remembers, a recommender that learns your taste, and a leaderboard that Gemini helps rank.'

/**
 * The home page's projects, first after the hero (owner, 2026-11-08): the
 * each project as one big card (Wren first), then the
 * n8builds.dev teaser. "Detailed view" opens /projects, with every project at
 * full size.
 */
const Projects: React.FC = () => {
  return (
    <div className="flex w-full flex-col gap-5 pt-14 pb-6 text-slate-200 md:pt-16 md:pb-12">
      <div className="flex flex-col gap-4 px-2 sm:flex-row sm:items-end sm:justify-between md:px-4">
        <SectionHeading
          eyebrow="Selected projects"
          title={
            <>
              Building for the <span className="text-sky-400">AI-native web</span>
            </>
          }
        />
        <Link
          href="/projects"
          className="group inline-flex shrink-0 items-center gap-1.5 self-start rounded-xl border border-white/12 bg-white/4 px-3.5 py-2 text-sm font-semibold whitespace-nowrap text-slate-100 transition-colors hover:border-sky-400/50 hover:bg-white/8 hover:text-sky-200 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-400 sm:self-auto"
        >
          Detailed view
          <FiArrowRight
            className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>
      </div>
      <motion.p
        variants={fadeInUpVariants}
        {...defaultAnimationConfig}
        className="max-w-3xl px-2 text-base leading-relaxed text-slate-400 md:px-4 md:text-lg/7"
      >
        {BLURB}
      </motion.p>
      {/* The weekday note only matters while a monitored demo is on the page. */}
      {projects.some((p) => p.statusName) && <DemoSleepNote className="px-2 md:px-4" />}

      <div className="mt-4 flex w-full flex-col gap-8 px-2 md:gap-10 md:px-4">
        {projects.map((project) => (
          <motion.div
            key={project.id}
            variants={fadeInUpVariants}
            {...defaultAnimationConfig}
            viewport={{ once: true, amount: 0.1 }}
          >
            <ProjectShowcase project={project} />
          </motion.div>
        ))}
        <motion.div variants={fadeInUpVariants} {...defaultAnimationConfig} className="select-none">
          <BuildsTeaser />
        </motion.div>
      </div>
    </div>
  )
}

export default Projects
