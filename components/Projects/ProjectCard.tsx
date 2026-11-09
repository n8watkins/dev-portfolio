'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FiBookOpen, FiExternalLink, FiGithub } from 'react-icons/fi'
import StatusPill from './StatusPill'
import ProjectGallery from './ProjectGallery'
import ProjectClip from './ProjectClip'
import { accents } from '@/lib/accents'
import { trackProjectEvent } from '@/lib/analytics'
import type { Project } from '@/lib/types'

/** A row button. None grows on hover, so the row's buttons sit level. */
const BUTTON =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl px-3 sm:px-4 py-2 text-sm font-semibold transition-colors duration-200 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-darkBlue'

/**
 * A project as a Lab row, after n8builds.dev's (components/sections/
 * FeaturedProjects.tsx there): the screenshots with left/right on one side,
 * and on the other its icon and name, a short summary (and who it builds on,
 * when it credits someone), then Live demo, Source and Full story. The tech
 * pills and feature checks live on the project's page, so the card stays
 * tight (owner, 2026-11-08). The row sits in a wash of its brand colour from
 * the screenshot's side (see Projects/index.tsx). Sides alternate per row.
 */
export default function ProjectCard({ project, index }: { project: Project; index: number }) {
  const router = useRouter()
  const accent = accents[project.accent]
  const flipped = index % 2 === 1
  const open = () => {
    trackProjectEvent('view', project.title, { source: 'grid' })
    router.push(`/projects/${project.slug}`)
  }

  return (
    <article
      aria-label={project.title}
      className={`group flex flex-col ${flipped ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-6 md:gap-12`}
    >
      {/* The demo in use when there is a clip of it, the screenshots otherwise. */}
      {project.clip ? (
        <ProjectClip
          title={project.title}
          src={project.clip.src}
          poster={project.clip.poster}
          alt={project.clip.alt}
          frameClassName={`${accent.outline} ${accent.shadow}`}
          onOpen={open}
        />
      ) : (
        <ProjectGallery
          title={project.title}
          images={project.images}
          frameClassName={`${accent.outline} ${accent.shadow}`}
          dotClassName={accent.dot}
          onOpen={open}
          // On hover the screenshot's frame lights up in the project's colour (no zoom).
          className="w-full shrink-0 md:w-1/2"
          imageClassName="object-cover object-top"
        />
      )}

      <div className="flex w-full flex-col md:w-1/2">
        <div className="flex items-center gap-3">
          <Image
            src={project.icon}
            alt=""
            width={56}
            height={56}
            unoptimized={project.icon.endsWith('.svg')}
            className="h-12 w-12 shrink-0 rounded-2xl shadow-lg shadow-black/40 sm:h-14 sm:w-14"
          />
          <div className="min-w-0">
            <h3 className="text-2xl font-bold tracking-tight text-slate-50 sm:text-3xl">
              {project.wordmark ?? project.title}
            </h3>
            <p className={`text-sm font-semibold ${accent.subtitle}`}>{project.subTitle}</p>
          </div>
        </div>

        {/* The row's height is reserved, so the pill arriving moves nothing. */}
        {project.statusName && (
          <div className="mt-3 h-6">
            <StatusPill name={project.statusName} />
          </div>
        )}

        <p className="mt-3 text-sm leading-relaxed text-[#9cadc5] sm:text-[0.95rem]">
          {project.summary}
        </p>

        {project.credits?.[0] && (
          <p className="mt-3 text-sm text-slate-400">
            Built on{' '}
            <a
              href={project.credits[0].href}
              target="_blank"
              rel="noopener noreferrer"
              className={`font-semibold underline decoration-current/40 underline-offset-4 transition-colors hover:text-white ${accent.subtitle}`}
            >
              {project.credits[0].name}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>{' '}
            list.
          </p>
        )}

        <div className="mt-5 grid grid-cols-3 gap-2">
          {project.liveSite && (
            <a
              href={project.liveSite}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Try the ${project.title} live demo (new tab)`}
              onClick={() =>
                trackProjectEvent('live_site_click', project.title, { source: 'grid' })
              }
              className={`${BUTTON} ${accent.primary}`}
            >
              <FiExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
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
              className={`${BUTTON} border border-white/12 bg-white/4 text-slate-200 hover:bg-white/8`}
            >
              <FiGithub className="h-4 w-4" aria-hidden="true" />
              Source
            </a>
          )}
          <Link
            href={`/projects/${project.slug}`}
            aria-label={`Read the full story of ${project.title}`}
            onClick={() => trackProjectEvent('view', project.title, { source: 'grid' })}
            className={`${BUTTON} border border-white/12 bg-white/4 text-slate-200 hover:bg-white/8`}
          >
            <FiBookOpen className="h-4 w-4" aria-hidden="true" />
            Full story
          </Link>
        </div>
      </div>
    </article>
  )
}
