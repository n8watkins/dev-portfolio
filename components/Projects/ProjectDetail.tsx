'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { FiArrowLeft, FiArrowUpRight, FiCheck, FiExternalLink, FiGithub } from 'react-icons/fi'
import { Project, Technologies } from '@/lib/types'
import { techNameMapping } from '@/data/projects'
import { accents } from '@/lib/accents'
import ProjectGallery from './ProjectGallery'
import StatusPill, { DemoSleepNote } from './StatusPill'

function Heading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="scroll-mt-24 text-xs font-semibold uppercase tracking-widest text-sky-400 mb-3"
    >
      {children}
    </h2>
  )
}

/** The row buttons from the home page's project rows. */
const BUTTON =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-darkBlue'
const QUIET = 'border border-white/[0.12] bg-white/[0.04] text-slate-200 hover:bg-white/[0.08]'

/**
 * Live demo (in the project's colour) and Source as buttons, then the status
 * and an n8builds.dev link. Rendered under the header (a row) and in the
 * desktop sidebar (stacked to its width).
 */
function ProjectLinks({ project, stacked = false }: { project: Project; stacked?: boolean }) {
  const accent = accents[project.accent]
  return (
    <div className={stacked ? 'flex flex-col gap-2.5' : 'flex flex-wrap items-center gap-2.5'}>
      {project.liveSite ? (
        <a
          href={project.liveSite}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Try the ${project.title} live demo (new tab)`}
          className={`${BUTTON} ${accent.primary}`}
        >
          <FiExternalLink className="w-3.5 h-3.5" aria-hidden="true" /> Live demo
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
          className={`${BUTTON} ${QUIET}`}
        >
          <FiGithub className="w-4 h-4" aria-hidden="true" /> Source
        </a>
      )}
      <div className={`flex flex-wrap items-center gap-x-4 gap-y-2.5 ${stacked ? 'pt-1' : ''}`}>
        <a
          href="https://n8builds.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-slate-300 hover:text-sky-400 transition-colors"
        >
          n8builds.dev <FiArrowUpRight className="w-4 h-4" aria-hidden="true" />
        </a>
        {/* Last in the row, so it appears without moving anything before it. */}
        {project.statusName && <StatusPill name={project.statusName} />}
      </div>
      {project.statusName && <DemoSleepNote className={stacked ? '' : 'basis-full'} />}
    </div>
  )
}

/** The stack in its three groups, each line with its tech's marks. */
function Stack({ technologies }: { technologies: Technologies }) {
  const names = techNameMapping as Record<string, string>
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {(Object.keys(technologies) as (keyof Technologies)[]).map((group) => (
        <section
          key={group}
          aria-labelledby={`stack-${group}`}
          className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
        >
          <h3 id={`stack-${group}`} className="text-base font-bold text-slate-100">
            {group}
          </h3>
          <ul className="mt-3 flex flex-col gap-3">
            {technologies[group].descriptionParts.map((part) => (
              <li key={part.text} className="text-sm leading-relaxed text-slate-300">
                {part.icons?.length > 0 && (
                  <span className="mb-1.5 flex items-center gap-1.5">
                    {part.icons.map(({ icon }) => (
                      <span
                        key={icon}
                        title={names[icon] ?? icon}
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-slate-900/80"
                      >
                        <Image
                          src={`/projectIcons/${icon}`}
                          alt={names[icon] ?? ''}
                          width={16}
                          height={16}
                          className="h-4 w-4 object-contain"
                        />
                      </span>
                    ))}
                  </span>
                )}
                {part.text}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

/**
 * A project's page, read like a short blog post: the header with its icon,
 * buttons and status; the screenshots (a gallery with left/right, smaller than
 * the page); what it does as checks in its colour; then the goal, how it uses
 * AI, how it works and the stack in its three groups, with an "on this page"
 * sidebar on desktop.
 */
export default function ProjectDetail({ project }: { project: Project }) {
  const accent = accents[project.accent]
  // TOC derived from the sections that actually render (sections are conditional).
  const toc = [
    project.purpose && { id: 'goal', label: 'The goal' },
    project.aiUsage && { id: 'ai', label: 'How it uses AI' },
    project.highlights?.length && { id: 'how', label: 'How it works' },
    { id: 'stack', label: 'The stack' },
  ].filter(Boolean) as { id: string; label: string }[]

  return (
    <main className="relative min-h-screen overflow-hidden bg-darkBlue text-slate-200">
      {/* The project's colour, glowing in from the top */}
      <div
        aria-hidden="true"
        className="lab-row-wash pointer-events-none absolute inset-x-0 top-0 h-[40rem]"
        style={{ '--lab-from': accent.rgb, '--lab-x': '0%' } as React.CSSProperties}
      />
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <Link
          href="/#projects"
          className="group inline-flex items-center gap-2 text-sm text-slate-400 hover:text-sky-400 transition-colors mb-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded"
        >
          <FiArrowLeft
            className="group-hover:-translate-x-0.5 transition-transform"
            aria-hidden="true"
          />
          Back to projects
        </Link>

        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-4">
            <Image
              src={project.icon}
              alt=""
              width={56}
              height={56}
              unoptimized={project.icon.endsWith('.svg')}
              className="h-14 w-14 shrink-0 rounded-2xl"
            />
            <div className="min-w-0">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-50">
                {project.title}
              </h1>
              <p className={`mt-1 text-base font-semibold ${accent.subtitle}`}>
                {project.subTitle}
              </p>
            </div>
          </div>
          {/* Primary links - visible at all breakpoints (the sidebar is desktop-only) */}
          <div className="mt-6 lg:hidden">
            <ProjectLinks project={project} />
          </div>
        </header>

        {/* Screenshots and what it does */}
        <div className="grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-center mb-14">
          <ProjectGallery
            title={project.title}
            images={project.images}
            className="w-full"
            sizes="(max-width: 1024px) 100vw, 36rem"
            frameClassName={accent.outline}
            imageClassName="object-cover object-top"
          />
          <div>
            <p className="text-base leading-relaxed text-slate-300">{project.des}</p>
            <ul
              aria-label={`What ${project.title} does`}
              className="mt-5 grid gap-x-5 gap-y-2 sm:grid-cols-2"
            >
              {project.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-2 text-sm font-medium text-slate-200"
                >
                  <FiCheck
                    className={`mt-[3px] h-4 w-4 shrink-0 ${accent.check}`}
                    aria-hidden="true"
                  />
                  {feature}
                </li>
              ))}
            </ul>
            <ul
              aria-label={`${project.title} is built with`}
              className="mt-5 flex flex-wrap gap-1.5"
            >
              {project.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 font-mono text-xs text-slate-300"
                >
                  {tag}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Body - article + sticky sidebar */}
        <div className="grid lg:grid-cols-[1fr_15rem] gap-10 lg:gap-14 items-start">
          <article className="space-y-12 min-w-0">
            {project.purpose && (
              <section>
                <Heading id="goal">The goal - what I&apos;m exploring</Heading>
                <p className="text-lg md:text-xl leading-relaxed text-slate-300">
                  {project.purpose}
                </p>
              </section>
            )}

            {project.aiUsage && (
              <section>
                <Heading id="ai">How it uses AI</Heading>
                <p className="text-lg md:text-xl leading-relaxed text-slate-300">
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
                      className="flex gap-3 text-lg md:text-xl leading-relaxed text-slate-300"
                    >
                      <FiCheck
                        className={`mt-1.5 h-5 w-5 shrink-0 ${accent.check}`}
                        aria-hidden="true"
                      />
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
                      className="block -ml-px border-l border-transparent pl-4 text-sm text-slate-400 hover:text-sky-400 hover:border-sky-400 transition-colors"
                    >
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

        {/* The stack, in its three groups */}
        <section className="mt-16">
          <Heading id="stack">The stack</Heading>
          <Stack technologies={project.technologies} />
        </section>
      </div>
    </main>
  )
}
