'use client'

import Link from 'next/link'
import { FiArrowLeft } from 'react-icons/fi'

/**
 * Read by the home page (app/page.tsx): scroll to this section once it
 * renders. The nav and the footer's site map set it when they go home from
 * another page, so no "#section" stays in the address.
 */
export const SCROLL_TO_KEY = 'portfolio-scroll-to'

/**
 * "Back to home" on /projects and the project pages (owner, 2026-11-08): to
 * the top of the main page.
 */
export default function BackToHome() {
  return (
    <Link
      href="/"
      className="group mb-10 inline-flex items-center gap-2.5 rounded-xl border border-white/12 bg-white/4 px-4 py-2.5 text-base font-semibold text-slate-200 transition-colors hover:border-sky-400/50 hover:bg-white/8 hover:text-sky-200 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-400"
    >
      <FiArrowLeft
        className="h-5 w-5 transition-transform group-hover:-translate-x-1"
        aria-hidden="true"
      />
      Back to home
    </Link>
  )
}
