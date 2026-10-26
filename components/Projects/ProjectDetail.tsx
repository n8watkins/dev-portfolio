'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { FiArrowLeft, FiGithub, FiArrowUpRight } from 'react-icons/fi'
import { MdOpenInNew } from 'react-icons/md'
import IconCycle from '@/components/ui/ProjectComponents/iconCycle'
import { Project } from '@/lib/types'
import StatusPill, { DemoSleepNote } from './StatusPill'

function Heading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="scroll-mt-24 text-xs font-semibold uppercase tracking-widest text-sky-400 mb-3">
      {children}
    </h2>
  )
}

const ACTION =
  'inline-flex items-center justify-center gap-2 h-10 px-4 rounded-full border text-sm font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-darkBlue'
const OUTLINE =
  'border-slate-600 text-slate-200 hover:border-sky-400/60 hover:text-sky-300 hover:bg-slate-800/60'

/**
 * Live demo / Source as real buttons (as on the home page's cards), then the
 * status and an n8builds.dev link. Rendered inline (mobile, a row) and in the
 * sidebar (desktop, stacked to the sidebar's width).
 */
function ProjectLinks({ project, stacked = false }: { project: Project; stacked?: boolean }) {
  return (
    <div className={stacked ? 'flex flex-col gap-2.5' : 'flex flex-wrap items-center gap-2.5'}>
      {project.liveSite ? (
        <a
          href={project.liveSite}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Try the ${project.title} live demo (new tab)`}
          className={`${ACTION} text-white bg-gradient-to-r from-cyan-500 to-blue-600 border-transparent hover:from-cyan-400 hover:to-blue-500 hover:shadow-lg hover:shadow-sky-500/30`}>
          <MdOpenInNew className="w-4 h-4" aria-hidden="true" /> Live demo
        </a>
      ) : (
        <span className="inline-flex items-center gap-2 text-sm text-slate-400">
          <span className="h-2 w-2 rounded-full bg-slate-500" aria-hidden="true" /> Runs locally -
          grab it on GitHub
        </span>
      )}
      {project.github && (
        <a
          href={project.github}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`View ${project.title} source on GitHub (new tab)`}
          className={`${ACTION} ${OUTLINE}`}>
          <FiGithub className="w-4 h-4" aria-hidden="true" /> Source
        </a>
      )}
      <div className={`flex flex-wrap items-center gap-x-4 gap-y-2.5 ${stacked ? 'pt-1' : ''}`}>
        <a
          href="https://n8builds.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-slate-300 hover:text-sky-400 transition-colors">
          n8builds.dev <FiArrowUpRight className="w-4 h-4" aria-hidden="true" />
        </a>
        {/* Last in the row, so it appears without moving anything before it. */}
        {project.statusName && <StatusPill name={project.statusName} />}
      </div>
      {project.statusName && <DemoSleepNote className={stacked ? '' : 'basis-full'} />}
    </div>
  )
}

/**
 * Project detail page, read like a short blog post: image up top, a sticky
 * "on this page" itinerary + meta card on the side (desktop), generous spacing,
 * and a full-width interactive stack breakdown at the bottom.
 */
export default function ProjectDetail({ project }: { project: Project }) {
  // TOC derived from the sections that actually render (sections are conditional).
  const toc = [
    project.purpose && { id: 'goal', label: 'The goal' },
    project.aiUsage && { id: 'ai', label: 'How it uses AI' },
    project.highlights?.length && { id: 'how', label: 'How it works' },
    { id: 'stack', label: 'The stack' },
  ].filter(Boolean) as { id: string; label: string }[]

  return (
    <main className="min-h-screen bg-blue-400 dark:bg-darkBlue text-slate-700 dark:text-slate-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <Link
          href="/#projects"
          className="group inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-sky-400 transition-colors mb-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded">
          <FiArrowLeft className="group-hover:-translate-x-0.5 transition-transform" aria-hidden="true" />
          Back to projects
        </Link>

        {/* Header */}
        <header className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-sky-400 mb-2">
            {project.subTitle}
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-slate-100">
            {project.title}
          </h1>
          {/* No description here on purpose - the card already shows `des`; the
              article below opens with the distinct "goal" so the click pays off. */}
          {/* Primary links - visible at all breakpoints (the sidebar is desktop-only) */}
          <div className="mt-6 lg:hidden">
            <ProjectLinks project={project} />
          </div>
        </header>

        {/* Hero image - top of the post */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/10 bg-slate-900/40 shadow-xl shadow-black/30 mb-14">
          <Image
            src={project.images[0]}
            alt={project.title}
            fill
            sizes="(max-width: 1024px) 100vw, 64rem"
            className="object-cover object-center"
            priority
          />
        </motion.div>

        {/* Body - article + sticky sidebar */}
        <div className="grid lg:grid-cols-[1fr_15rem] gap-10 lg:gap-14 items-start">
          <article className="space-y-12 min-w-0">
            {project.purpose && (
              <section>
                <Heading id="goal">The goal - what I&apos;m exploring</Heading>
                <p className="text-lg md:text-xl leading-relaxed text-slate-600 dark:text-slate-300">
                  {project.purpose}
                </p>
              </section>
            )}

            {project.aiUsage && (
              <section>
                <Heading id="ai">How it uses AI</Heading>
                <p className="text-lg md:text-xl leading-relaxed text-slate-600 dark:text-slate-300">
                  {project.aiUsage}
                </p>
              </section>
            )}

            {project.highlights && project.highlights.length > 0 && (
              <section>
                <Heading id="how">How it works</Heading>
                <ul className="flex flex-col gap-3">
                  {project.highlights.map((highlight, i) => (
                    <li
                      key={i}
                      className="flex gap-3 text-lg md:text-xl leading-relaxed text-slate-600 dark:text-slate-300">
                      <span className="text-sky-400 select-none mt-1" aria-hidden="true">
                        ▸
                      </span>
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </article>

          {/* Sidebar (desktop) - itinerary + meta card */}
          <aside className="hidden lg:block sticky top-10 space-y-6 select-none">
            <nav aria-label="On this page">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-3">
                On this page
              </p>
              <ul className="space-y-2 border-l border-white/10">
                {toc.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="block -ml-px border-l border-transparent pl-4 text-sm text-slate-400 hover:text-sky-400 hover:border-sky-400 transition-colors">
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 mb-3">
                Project
              </p>
              <ProjectLinks project={project} stacked />
            </div>
          </aside>
        </div>

        {/* The stack - full width, room to breathe (it's back-end heavy) */}
        <section className="mt-16">
          <Heading id="stack">The stack</Heading>
          <div className="rounded-2xl border border-white/10 bg-slate-900/30 px-2 py-8 md:px-8">
            <IconCycle technologies={project.technologies} view="detailed" projectId={project.id} />
          </div>
        </section>
      </div>
    </main>
  )
}
