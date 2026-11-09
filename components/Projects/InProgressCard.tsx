import React from 'react'
import { FiMessageCircle, FiSearch, FiBookmark } from 'react-icons/fi'
import type { InProgressProject } from '@/lib/types'

const ICONS = [FiMessageCircle, FiSearch, FiBookmark]

/**
 * The AI app being built now (data/projects.tsx `inProgress`): a compact card
 * with an "In progress" pill, a neutral label in place of a name, what it will
 * do, and a few chips. No links or screenshots until it ships, when a regular
 * project row replaces it.
 */
export default function InProgressCard({ project }: { project: InProgressProject }) {
  return (
    <article
      aria-label={project.label}
      className="relative overflow-hidden rounded-3xl border border-dashed border-sky-400/35 bg-linear-to-br from-[#0c4a6e]/35 via-darkBlue to-darkBlue p-6 sm:p-8"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(closest-side,rgba(56,189,248,0.14),transparent)]"
      />
      <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:gap-10">
        <div className="min-w-0 flex-1">
          <p className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1 text-[0.7rem] font-bold uppercase tracking-[0.16em] text-sky-300">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75 motion-safe:animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-400" />
            </span>
            In progress
          </p>
          <h3 className="mt-4 text-2xl font-bold tracking-tight text-slate-50 sm:text-3xl">
            {project.label}
          </h3>
          <p className="mt-2 max-w-2xl text-base leading-relaxed text-[#9cadc5] sm:text-lg">
            {project.pitch}
          </p>
        </div>
        <ul aria-label="What it will do" className="flex flex-wrap gap-2 md:w-56 md:flex-col">
          {project.points.map((point, i) => {
            const Icon = ICONS[i % ICONS.length]
            return (
              <li
                key={point}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/4 px-3 py-2 text-sm font-medium text-slate-200"
              >
                <Icon className="h-4 w-4 shrink-0 text-sky-400" aria-hidden="true" />
                {point}
              </li>
            )
          })}
        </ul>
      </div>
    </article>
  )
}
