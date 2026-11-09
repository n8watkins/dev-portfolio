'use client'

import React from 'react'
import { FloatingNav } from '@/components/layout/FloatingNav'
import Footer from '@/components/layout/Footer'
import InProgressCard from '@/components/Projects/InProgressCard'
import ProjectFull from '@/components/Projects/ProjectFull'
import BackToProjects from '@/components/Projects/BackToProjects'
import { subpageNavItems } from '@/data/navigation'
import { inProgress, projects } from '@/data/projects'

/**
 * /projects, the "Detailed view" (owner, 2026-11-08): every project at full
 * size, with all its screenshots, the whole description, what it does and the
 * tech. Each one's own page (/projects/<slug>) still tells the full story.
 */
export default function ProjectsPage() {
  return (
    <>
      <FloatingNav navItems={subpageNavItems} />
      <main
        id="main-content"
        tabIndex={-1}
        className="relative w-full overflow-hidden bg-darkBlue text-slate-200 focus:outline-hidden"
      >
        <div className="mx-auto max-w-md px-4 pt-28 sm:max-w-xl md:max-w-3xl md:pt-36 lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl">
          <BackToProjects />
          <p className="text-xs font-semibold tracking-[0.2em] text-sky-400 uppercase">
            Selected projects
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-50 sm:text-5xl">
            Projects, in detail
          </h1>
          <div className="mt-10 mb-24 flex flex-col gap-8 md:gap-10">
            {inProgress && <InProgressCard project={inProgress} />}
            {projects.map((project) => (
              <ProjectFull key={project.id} project={project} />
            ))}
          </div>
        </div>
        <div className="mx-auto max-w-md sm:max-w-xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl">
          <Footer />
        </div>
      </main>
    </>
  )
}
