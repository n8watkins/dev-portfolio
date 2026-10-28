'use client'

import Link from 'next/link'
import { FiArrowLeft } from 'react-icons/fi'

/** Read by the home page (app/page.tsx): scroll to this section once it renders. */
export const SCROLL_TO_KEY = 'portfolio-scroll-to'

/**
 * Back to the home page's projects, landing on the section without leaving
 * "#projects" in the address: the link goes to "/" and leaves a note for the
 * home page to scroll to the section.
 */
export default function BackToProjects() {
  return (
    <Link
      href="/"
      scroll={false}
      onClick={() => {
        try {
          sessionStorage.setItem(SCROLL_TO_KEY, 'projects')
        } catch {
          // Storage blocked: the link still goes home, to the top.
        }
      }}
      className="group mb-10 inline-flex items-center gap-2.5 rounded-xl border border-white/12 bg-white/4 px-4 py-2.5 text-base font-semibold text-slate-200 transition-colors hover:border-sky-400/50 hover:bg-white/8 hover:text-sky-200 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-400"
    >
      <FiArrowLeft
        className="h-5 w-5 transition-transform group-hover:-translate-x-1"
        aria-hidden="true"
      />
      Back to projects
    </Link>
  )
}
