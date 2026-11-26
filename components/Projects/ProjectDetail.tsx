'use client'

import React from 'react'
import Image from 'next/image'
import { FiArrowUpRight, FiCheck, FiExternalLink, FiGithub } from 'react-icons/fi'
import type { Project, StoryChapter } from '@/lib/types'
import { accents } from '@/lib/accents'
import Breadcrumb from '@/components/ui/Breadcrumb'
import TechStackCycle from './TechStackCycle'
import ProjectClip from './ProjectClip'
import StatusPill, { DemoSleepNote } from './StatusPill'
import ProjectIcon from '@/components/Projects/ProjectIcon'

type Accent = (typeof accents)[Project['accent']]

/** The row buttons from the home page's project rows. */
const BUTTON =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold transition-colors duration-200 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-darkBlue'
const QUIET = 'border border-white/12 bg-white/4 text-slate-200 hover:bg-white/8'

/** The story's body text: a comfortable line length and a steady rhythm. */
const PROSE = 'max-w-[40rem] text-lg/8 text-slate-300 md:text-[1.1875rem]/9'

/** A small label over a section (the beats, "Credits", "The stack"). */
const KICKER = 'text-xs font-semibold uppercase tracking-[0.18em]'

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

/** A screenshot where the story mentions it, whole (16:10, like every capture), with its caption. */
function Figure({
  project,
  image,
  caption,
  accent,
}: {
  project: Project
  image: number
  caption: string
  accent: Accent
}) {
  const shot = project.images[image]
  if (!shot) return null
  return (
    <figure className="mt-8">
      <div
        className={`relative aspect-16/10 overflow-hidden rounded-2xl border bg-[#07101d] shadow-[0_24px_60px_-30px_rgba(0,0,0,0.8)] ${accent.outline}`}
      >
        <Image
          src={shot.src}
          alt={shot.alt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 44rem, 52rem"
          className="object-cover object-top"
        />
      </div>
      <figcaption className="mt-3 text-sm leading-relaxed text-slate-400">{caption}</figcaption>
    </figure>
  )
}

/** Dated steps down a line in the project's colour. */
function Timeline({ steps, accent }: { steps: NonNullable<StoryChapter['timeline']>; accent: Accent }) {
  return (
    <ol aria-label="Timeline" className="mt-8 max-w-[40rem] border-l border-white/12">
      {steps.map((step, i) => (
        <li key={i} className="relative pb-5 pl-6 last:pb-0">
          <span
            aria-hidden="true"
            className={`absolute -left-[5px] top-[0.55rem] h-2.5 w-2.5 rounded-full ring-4 ring-darkBlue ${accent.dot}`}
          />
          <p className="font-mono text-xs uppercase tracking-wider text-slate-400">{step.when}</p>
          <p className="mt-0.5 text-base leading-relaxed text-slate-200">{step.what}</p>
        </li>
      ))}
    </ol>
  )
}

/**
 * One beat of the story: its number and name small in the project's colour,
 * the title, the question set large when it has one, the words, then the
 * dated steps and the screenshot the words mention.
 */
function Chapter({
  project,
  chapter,
  index,
  accent,
  children,
}: {
  project: Project
  chapter: StoryChapter
  index: number
  accent: Accent
  children?: React.ReactNode
}) {
  return (
    <section aria-labelledby={chapter.id} className="scroll-mt-24">
      <p className={`${KICKER} ${accent.subtitle}`}>
        <span className="font-mono tabular-nums">{String(index + 1).padStart(2, '0')}</span>
        <span aria-hidden="true" className="mx-2 text-slate-600">
          /
        </span>
        {chapter.beat}
      </p>
      <h2
        id={chapter.id}
        className="mt-3 scroll-mt-24 text-2xl font-bold tracking-tight text-slate-50 md:text-[2rem]/tight"
      >
        {chapter.title}
      </h2>
      {chapter.quote && (
        <blockquote
          className="mt-6 max-w-[40rem] border-l-[3px] pl-5 text-xl/8 font-semibold text-slate-100 md:pl-6 md:text-2xl/10"
          style={{ borderColor: `rgb(${accent.rgb} / 0.7)` }}
        >
          {chapter.quote}
        </blockquote>
      )}
      <div className="mt-5 space-y-5">
        {chapter.paragraphs.map((p, i) => (
          <p key={i} className={PROSE}>
            {p}
          </p>
        ))}
      </div>
      {chapter.timeline && <Timeline steps={chapter.timeline} accent={accent} />}
      {chapter.media && (
        <Figure project={project} image={chapter.media.image} caption={chapter.media.caption} accent={accent} />
      )}
      {children}
    </section>
  )
}

/**
 * A project's page, told as a short story (owner, 2026-11-26: "I want it to
 * tell a story"): the same breadcrumb as /about, the header with the opening
 * line and the clip of the live app, then five beats (the spark, the
 * question, the build, how it grew, where it is now) with each screenshot
 * where the words mention it, what it does, the credits and an invitation,
 * and last the stack. An "on this page" sidebar follows the beats on desktop.
 */
export default function ProjectDetail({ project }: { project: Project }) {
  const accent = accents[project.accent]
  const { story } = project
  const toc = [
    ...story.chapters.map((c) => ({ id: c.id, label: c.beat })),
    project.credits?.length && { id: 'credits', label: 'Credits' },
    { id: 'stack', label: 'The stack' },
  ].filter(Boolean) as { id: string; label: string }[]
  const hero = project.clip ?? {
    src: '',
    poster: project.images[0]?.src ?? '',
    alt: project.images[0]?.alt ?? project.title,
  }

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="relative min-h-screen overflow-hidden bg-darkBlue text-slate-200 focus:outline-hidden"
    >
      {/* The project's colour, glowing in from the top */}
      <div
        aria-hidden="true"
        className="lab-row-wash pointer-events-none absolute inset-x-0 top-0 h-160"
        style={{ '--lab-from': accent.rgb, '--lab-x': '0%' } as React.CSSProperties}
      />
      {/* The same top as /about: its container, padding and breadcrumb. */}
      <div className="relative mx-auto max-w-md px-4 pt-14 pb-12 sm:max-w-xl md:max-w-3xl md:pt-36 md:pb-16 lg:max-w-4xl xl:max-w-6xl 2xl:max-w-7xl">
        <Breadcrumb current={project.title} className="mb-8 md:mb-10" />

        {/* Header: who it is and the opening line, beside the live app in motion */}
        <header className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] xl:items-center xl:gap-12">
          <div>
            <div className="flex items-center gap-4">
              <ProjectIcon project={project} size={64} className="h-14 w-14 sm:h-16 sm:w-16" />
              <div className="min-w-0">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-50">
                  {project.wordmark ?? project.title}
                </h1>
                <p className={`mt-1 text-base font-semibold ${accent.subtitle}`}>
                  {project.subTitle}
                </p>
              </div>
            </div>
            <p className="mt-6 max-w-[40rem] text-xl/8 text-slate-200 md:text-2xl/10">
              {story.lede}
            </p>
            {/* The links, at every width but the desktop's, where the sidebar has them */}
            <div className="mt-6 lg:hidden">
              <ProjectLinks project={project} />
            </div>
          </div>
          {hero.src ? (
            <ProjectClip
              title={project.title}
              src={hero.src}
              poster={hero.poster}
              alt={hero.alt}
              frameClassName={accent.outline}
              className="w-full"
              sizes="(max-width: 1280px) 100vw, 40rem"
            />
          ) : (
            <Figure project={project} image={0} caption={hero.alt} accent={accent} />
          )}
        </header>

        {/* The story, with the sidebar beside it on desktop */}
        <div className="mt-16 grid items-start gap-10 md:mt-20 lg:grid-cols-[minmax(0,1fr)_15rem] lg:gap-14">
          <article className="min-w-0 space-y-16 md:space-y-20">
            {story.chapters.map((chapter, i) => (
              <Chapter key={chapter.id} project={project} chapter={chapter} index={i} accent={accent}>
                {chapter.id === 'now' && (
                  <ul
                    aria-label={`What ${project.title} does`}
                    className="mt-8 grid max-w-[40rem] gap-x-6 gap-y-3 sm:grid-cols-2"
                  >
                    {project.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2.5 text-base font-medium text-slate-200"
                      >
                        <FiCheck
                          className={`mt-[5px] h-4 w-4 shrink-0 ${accent.check}`}
                          aria-hidden="true"
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>
                )}
              </Chapter>
            ))}

            {project.invite && (
              <section
                aria-labelledby="invite"
                className="rounded-2xl border border-white/10 bg-white/3 p-6 sm:p-8"
              >
                <h2 id="invite" className="text-2xl font-bold tracking-tight text-slate-50">
                  {project.invite.heading}
                </h2>
                <p className="mt-2 max-w-[40rem] text-base leading-relaxed text-slate-300 md:text-lg/8">
                  {project.invite.body}
                </p>
                <a
                  href={project.invite.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${BUTTON} ${accent.primary} mt-5`}
                >
                  {project.invite.label}
                  <FiArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </section>
            )}

            {project.credits && project.credits.length > 0 && (
              <section aria-labelledby="credits">
                <h2 id="credits" className={`${KICKER} scroll-mt-24 text-slate-400`}>
                  Credits
                </h2>
                <ul className="mt-4 flex flex-col gap-4">
                  {project.credits.map((credit) => (
                    <li key={credit.href} className={PROSE}>
                      <a
                        href={credit.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`font-semibold underline decoration-current/40 underline-offset-4 hover:text-white transition-colors ${accent.subtitle}`}
                      >
                        {credit.name}
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                      : {credit.note}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </article>

          {/* Sidebar (desktop): the beats, then the project's links */}
          <aside className="hidden lg:block sticky top-24 space-y-6 select-none">
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

        {/* The stack: the pills, then Frontend / Backend / Cloud cycling through
            what each part uses (n8builds.dev's TechStackCycle, kept in sync) */}
        <section aria-labelledby="stack" className="mt-20 md:mt-24">
          <h2 id="stack" className={`${KICKER} scroll-mt-24 text-slate-400`}>
            The stack
          </h2>
          <ul aria-label={`${project.title} is built with`} className="mt-4 flex flex-wrap gap-1.5">
            {project.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-md border border-white/10 bg-white/4 px-2 py-1 font-mono text-xs text-slate-300"
              >
                {tag}
              </li>
            ))}
          </ul>
          <div className="mt-5 rounded-2xl border border-white/10 bg-white/3 p-5 sm:p-8">
            <TechStackCycle technologies={project.technologies} />
          </div>
        </section>
      </div>
    </main>
  )
}
