'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { FiBookOpen, FiCheck, FiExternalLink, FiGithub } from 'react-icons/fi'
import ProjectGallery from './ProjectGallery'
import StatusPill from './StatusPill'
import { BUTTON, QUIET, CreditLine } from './ProjectShowcase'
import { accents } from '@/lib/accents'
import { trackProjectEvent } from '@/lib/analytics'
import type { Project } from '@/lib/types'

/** The row's three buttons share the width, so a little less padding. */
const B = BUTTON.replace('px-4', 'px-3')

/**
 * A project at full size on /projects: every screenshot (left/right), the
 * whole description, what it does, the tech, and Live demo, Source and Full
 * story. Its own page (/projects/<slug>) goes deeper still.
 */
export default function ProjectFull({ project }: { project: Project }) {
  const accent = accents[project.accent]
  return (
    <article
      aria-label={project.title}
      id={project.slug}
      className="relative scroll-mt-28 overflow-hidden rounded-3xl border border-white/10 bg-white/3 p-4 sm:p-6 lg:p-8"
    >
      <div
        aria-hidden="true"
        className="lab-row-wash pointer-events-none absolute inset-0"
        style={{ '--lab-from': accent.rgb, '--lab-x': '0%' } as React.CSSProperties}
      />
      <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-10">
        <ProjectGallery
          title={project.title}
          images={project.images}
          className="w-full"
          sizes="(max-width: 1024px) 100vw, 40rem"
          frameClassName={`${accent.outline} ${accent.shadow}`}
          dotClassName={accent.dot}
          imageClassName="object-cover object-top"
        />
        <div className="min-w-0">
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
              <h2 className="text-2xl font-bold tracking-tight text-slate-50 sm:text-3xl">
                {project.wordmark ?? project.title}
              </h2>
              <p className={`text-sm font-semibold ${accent.subtitle}`}>{project.subTitle}</p>
            </div>
          </div>
          {project.statusName && (
            <div className="mt-3 h-6">
              <StatusPill name={project.statusName} />
            </div>
          )}
          <p className="mt-4 text-[0.95rem] leading-relaxed text-slate-300">{project.des}</p>
          <CreditLine project={project} />
          <ul
            aria-label={`What ${project.title} does`}
            className="mt-4 grid gap-x-5 gap-y-1.5 sm:grid-cols-2"
          >
            {project.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm font-medium text-slate-200">
                <FiCheck className={`mt-[3px] h-4 w-4 shrink-0 ${accent.check}`} aria-hidden="true" />
                {feature}
              </li>
            ))}
          </ul>
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
          <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {project.liveSite && (
              <a
                href={project.liveSite}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Try the ${project.title} live demo (new tab)`}
                onClick={() => trackProjectEvent('live_site_click', project.title, { source: 'projects' })}
                className={`${B} ${accent.primary}`}
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
                onClick={() => trackProjectEvent('github_click', project.title, { source: 'projects' })}
                className={`${B} ${QUIET}`}
              >
                <FiGithub className="h-4 w-4" aria-hidden="true" />
                Source
              </a>
            )}
            <Link
              href={`/projects/${project.slug}`}
              aria-label={`Read the full story of ${project.title}`}
              className={`${B} ${QUIET} col-span-2 sm:col-span-1`}
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
