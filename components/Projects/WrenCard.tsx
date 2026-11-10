import React from 'react'
import { FiArrowUpRight, FiGithub } from 'react-icons/fi'
import type { FeaturedApp } from '@/lib/types'
import WrenMark from './WrenMark'

const BUTTON =
  'inline-flex h-11 items-center gap-2 rounded-xl px-4 text-base font-semibold transition-colors duration-200 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-400'

/**
 * Wren, live (owner, round 4 of 2026-11-09; it was the "New AI app, in
 * progress" card): its animated bird, its name and one line, then "Try it"
 * (guest mode, no sign-up) and "Source" on GitHub.
 */
export default function WrenCard({ app }: { app: FeaturedApp }) {
  return (
    <article
      aria-labelledby="featured-app-name"
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-linear-to-br from-[#0c4a6e]/35 via-darkBlue to-darkBlue p-5 transition-colors duration-300 hover:border-sky-300/30 sm:p-6"
    >
      {/* A little of Wren's ember behind the bird. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -left-16 h-64 w-64 rounded-full bg-[radial-gradient(closest-side,rgba(255,125,77,0.12),transparent)]"
      />
      <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-[#0a1322] text-slate-100 shadow-lg shadow-black/30">
            <WrenMark size={40} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <h3
                id="featured-app-name"
                className="text-2xl font-bold tracking-tight text-slate-50 sm:text-3xl"
              >
                {app.name}
              </h3>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-0.5 text-[0.7rem] font-bold tracking-[0.14em] text-emerald-300 uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
                Live
              </span>
            </div>
            <p className="mt-1 text-base leading-relaxed text-slate-300 sm:text-lg">{app.line}</p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2.5">
          <a
            href={app.site}
            target="_blank"
            rel="noopener noreferrer"
            className={`${BUTTON} bg-linear-to-r from-blue-600 to-cyan-700 text-white hover:from-blue-700 hover:to-cyan-800`}
          >
            Try it
            <FiArrowUpRight className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only"> (opens {app.name} in a new tab)</span>
          </a>
          <a
            href={app.source}
            target="_blank"
            rel="noopener noreferrer"
            className={`${BUTTON} border border-white/12 bg-white/4 text-slate-200 hover:border-sky-400/50 hover:bg-white/8 hover:text-sky-200`}
          >
            <FiGithub className="h-4 w-4" aria-hidden="true" />
            Source
            <span className="sr-only"> of {app.name} on GitHub (opens in a new tab)</span>
          </a>
        </div>
      </div>
    </article>
  )
}
