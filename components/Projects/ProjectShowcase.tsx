'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FiBookOpen, FiExternalLink } from 'react-icons/fi'
import ProjectClip from './ProjectClip'
import StatusPill from './StatusPill'
import { accents } from '@/lib/accents'
import { trackProjectEvent } from '@/lib/analytics'
import type { Project } from '@/lib/types'

export const BUTTON =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors duration-200 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-darkBlue'
export const QUIET = 'border border-white/12 bg-white/4 text-slate-200 hover:bg-white/8'

/** Who a project builds on, as one line (Portfolio Rank credits Emma Bostian's list). */
export function CreditLine({ project }: { project: Project }) {
  const accent = accents[project.accent]
  const credit = project.credits?.[0]
  if (!credit) return null
  return (
    <p className="mt-2 text-sm text-slate-400">
      Built on{' '}
      <a
        href={credit.href}
        target="_blank"
        rel="noopener noreferrer"
        className={`font-semibold underline decoration-current/40 underline-offset-4 transition-colors hover:text-white ${accent.subtitle}`}
      >
        {credit.name}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>{' '}
      list.
    </p>
  )
}

/**
 * A project on the home page as one big, full-width card (owner,
 * 2026-11-08): the demo in use (a looping clip, or its first screenshot) across
 * the top, then its icon and name, a sentence or two, Live demo and Full story.
 * Everything else (the screenshots, tech and features) is on /projects and the
 * project's own page.
 */
export default function ProjectShowcase({ project }: { project: Project }) {
  const router = useRouter()
  const accent = accents[project.accent]
  const open = () => {
    trackProjectEvent('view', project.title, { source: 'grid' })
    router.push(`/projects/${project.slug}`)
  }
  return (
    <article
      aria-label={project.title}
      className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-white/3 p-3 shadow-xl shadow-black/30 transition-[border-color,box-shadow] duration-300 sm:p-4 hover:border-white/20`}
    >
      <div
        aria-hidden="true"
        className="lab-row-wash pointer-events-none absolute inset-0"
        style={{ '--lab-from': accent.rgb, '--lab-x': '0%' } as React.CSSProperties}
      />
      <div className="relative">
        {project.clip ? (
          <ProjectClip
            title={project.title}
            src={project.clip.src}
            poster={project.clip.poster}
            alt={project.clip.alt}
            frameClassName={`${accent.outline} ${accent.shadow}`}
            onOpen={open}
            className="w-full"
            // Wide and short: the demo across the top, with room below for what it is.
            aspectClassName="aspect-video md:aspect-[21/9]"
          />
        ) : (
          <button
            type="button"
            onClick={open}
            aria-label={`Open ${project.title}'s page`}
            className={`relative block aspect-video w-full overflow-hidden rounded-2xl border bg-[#07101d] md:aspect-[21/9] ${accent.outline}`}
          >
            <Image
              src={project.images[0].src}
              alt={project.images[0].alt}
              fill
              sizes="(max-width: 1280px) 100vw, 80rem"
              className="object-cover object-top"
            />
          </button>
        )}

        <div className="flex flex-col gap-5 px-1 pt-5 pb-2 sm:px-3 md:flex-row md:items-end md:justify-between md:gap-10">
          <div className="min-w-0 md:max-w-3xl">
            <div className="flex items-center gap-3">
              <Image
                src={project.icon}
                alt=""
                width={56}
                height={56}
                unoptimized={project.icon.endsWith('.svg')}
                className="h-11 w-11 shrink-0 rounded-2xl shadow-lg shadow-black/40 sm:h-14 sm:w-14"
              />
              <div className="min-w-0">
                <h3 className="text-2xl font-bold tracking-tight text-slate-50 sm:text-3xl">
                  {project.wordmark ?? project.title}
                </h3>
                <p className={`text-sm font-semibold ${accent.subtitle}`}>{project.subTitle}</p>
              </div>
            </div>
            {project.statusName && (
              <div className="mt-3 h-6">
                <StatusPill name={project.statusName} />
              </div>
            )}
            <p className="mt-3 text-[0.95rem] leading-relaxed text-[#9cadc5] sm:text-base">
              {project.summary}
            </p>
            {project.highlight && (
              <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-[0.95rem]">
                <span className={`font-semibold ${accent.subtitle}`}>What&apos;s interesting: </span>
                {project.highlight}
              </p>
            )}
            <CreditLine project={project} />
          </div>
          <div className="grid shrink-0 grid-cols-2 gap-2 sm:flex">
            {project.liveSite && (
              <a
                href={project.liveSite}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Try the ${project.title} live demo (new tab)`}
                onClick={() => trackProjectEvent('live_site_click', project.title, { source: 'grid' })}
                className={`${BUTTON} ${accent.primary}`}
              >
                <FiExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                Live demo
              </a>
            )}
            <Link
              href={`/projects/${project.slug}`}
              aria-label={`Read the full story of ${project.title}`}
              onClick={() => trackProjectEvent('view', project.title, { source: 'grid' })}
              className={`${BUTTON} ${QUIET}`}
            >
              <FiBookOpen className="h-4 w-4" aria-hidden="true" />
              Full story
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}
