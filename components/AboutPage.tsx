'use client'

import React from 'react'
import { FiDownload, FiFileText } from 'react-icons/fi'
import { FloatingNav } from '@/components/layout/FloatingNav'
import PageFooter from '@/components/layout/PageFooter'
import SectionErrorBoundary from '@/components/SectionErrorBoundary'
import SectionHeading from '@/components/ui/SectionHeading'
import AboutStory from '@/components/sections/AboutStory'
import HowIWork from '@/components/sections/HowIWork'
import { aboutNavItems } from '@/data/navigation'
import { RESUME_DOWNLOAD_URL, RESUME_VIEW_URL } from '@/lib/resume'
import { trackResumeEvent } from '@/lib/analytics'

// Imported, not lazy: "/about#experience" must find the section at load.
import StackGrid from '@/components/sections/StackGrid'
import Experience from '@/components/sections/Experience'
import WorkshopCards from '@/components/sections/WorkshopCards'

const BUTTON =
  'inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors duration-200 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-400'

/**
 * The About page (variant B): the full story with photos, how I work, my
 * stack (the bento, with the dino), the resume, every role in full, and my
 * company and workshop. The home page keeps a short teaser and the work.
 */
export default function AboutPage() {
  return (
    <>
      <FloatingNav navItems={aboutNavItems} />
      <main
        id="main-content"
        tabIndex={-1}
        className="relative w-full overflow-hidden bg-darkBlue text-slate-200 focus:outline-hidden"
      >
        <div className="mx-auto max-w-md px-4 pt-28 sm:max-w-xl md:max-w-3xl md:pt-36 lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl">
          <section aria-labelledby="about-heading">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-400">
              Get to know me
            </p>
            <h1
              id="about-heading"
              className="mt-3 text-4xl font-bold tracking-tight text-slate-50 sm:text-5xl"
            >
              About me
            </h1>
            <div className="mt-8">
              <AboutStory />
            </div>
          </section>

          <section aria-labelledby="how-i-work" className="mt-20 md:mt-28">
            <SectionHeading eyebrow="How I work" title={<span id="how-i-work">What I bring</span>} />
            <HowIWork className="mt-8" />
          </section>

          <section aria-label="My stack and my resume" className="mt-20 md:mt-28">
            <SectionHeading eyebrow="Stack and resume" title="What I build with" className="mb-8" />
            <div className="-mx-4">
              <SectionErrorBoundary sectionName="Stack Section">
                <StackGrid />
              </SectionErrorBoundary>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href={RESUME_VIEW_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackResumeEvent('view')}
                className={`${BUTTON} border border-sky-400/40 bg-sky-500/10 text-sky-100 hover:border-sky-300/70 hover:bg-sky-500/20`}
              >
                <FiFileText className="h-4 w-4" aria-hidden="true" />
                View my resume<span className="sr-only"> (opens in a new tab)</span>
              </a>
              <a
                href={RESUME_DOWNLOAD_URL}
                onClick={() => trackResumeEvent('download')}
                className={`${BUTTON} border border-white/12 bg-white/4 text-slate-200 hover:bg-white/8`}
              >
                <FiDownload className="h-4 w-4" aria-hidden="true" />
                Download PDF
              </a>
            </div>
          </section>

          <section id="experience" aria-label="Work experience" className="-mx-4 mt-16 md:mt-24">
            <SectionErrorBoundary sectionName="Experience Section">
              <Experience />
            </SectionErrorBoundary>
          </section>

          <section id="workshop" aria-label="My company and my workshop" className="-mx-4 mt-4 mb-20">
            <SectionErrorBoundary sectionName="Workshop Section">
              <WorkshopCards />
            </SectionErrorBoundary>
          </section>
        </div>
      </main>
      <PageFooter />
    </>
  )
}
