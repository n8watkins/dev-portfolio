'use client'

import Image from 'next/image'
import { FiFileText } from 'react-icons/fi'
import { RESUME_VIEW_URL } from '@/lib/resume'
import { trackResumeEvent } from '@/lib/analytics'

/**
 * The fixed top bar's corners, on every page: the n8builds.dev wordmark top left
 * (to n8builds.dev) and the resume top right, over a fade so content scrolls
 * under them cleanly. From sm up; on a phone the hero carries both.
 */
export default function CornerLinks() {
  return (
    <>
      <div className="fixed top-0 w-full h-16 lg:h-28 bg-gradient-to-t from-blue-400/0 via-blue-400/90 to-blue-400 dark:from-darkBlue/0 dark:via-darkBlue/90 dark:to-darkBlue z-[9999] select-none" />
      {/* Top left: the n8builds.dev wordmark, to n8builds.dev. Top right: the resume.
          Both sit further in from the edges on large screens.
          From sm up; on a phone the hero carries both. */}
      <a
        href="https://n8builds.dev"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="n8builds.dev (opens in a new tab)"
        className="group fixed left-4 lg:left-8 xl:left-12 2xl:left-16 top-2 1lg:top-4 xl:top-6 z-[9999] hidden sm:flex items-center gap-2.5 rounded-xl py-1 pr-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
      >
        <span className="relative h-9 w-9 lg:h-11 lg:w-11 overflow-hidden rounded-xl ring-1 ring-white/10 transition-all duration-200 group-hover:ring-white/25">
          <Image src="/tab/n8-icon.png" fill sizes="40px" className="object-cover" alt="" />
        </span>
        <span className="font-bold tracking-tight text-slate-100 text-[0.95rem] lg:text-xl group-hover:text-sky-300 transition-colors">
          n8builds.dev
        </span>
      </a>
      <a
        href={RESUME_VIEW_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackResumeEvent('view')}
        className="fixed right-4 lg:right-8 xl:right-12 2xl:right-16 top-2 1lg:top-4 xl:top-6 z-[9999] hidden sm:inline-flex items-center gap-2 rounded-xl border border-sky-400/40 bg-sky-500/10 h-10 px-3.5 lg:h-[3.5rem] lg:px-5 text-sm lg:text-base font-semibold text-sky-100 backdrop-blur-sm transition-colors duration-200 hover:border-sky-300/70 hover:bg-sky-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
      >
        <FiFileText className="h-4 w-4" aria-hidden="true" />
        Resume<span className="sr-only"> (opens in a new tab)</span>
      </a>
    </>
  )
}
