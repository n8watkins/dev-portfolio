'use client'
import React, { useEffect } from 'react'
import { SCROLL_TO_KEY } from '@/components/Projects/BackToProjects'
import Hero from '@/components/sections/Hero'
import Grid from '@/components/sections/Grid'
import { FloatingNav } from '@/components/layout/FloatingNav'
import { navItems } from '@/data/navigation'
import { useSectionTracking } from '@/hooks/useSectionTracking'
import { useScrollTracking } from '@/hooks/useScrollTracking'
import SectionErrorBoundary from '@/components/SectionErrorBoundary'
import dynamic from 'next/dynamic'

// Only lazy load truly below-the-fold components
const Projects = dynamic(() => import('@/components/Projects'))
const Experience = dynamic(() => import('@/components/sections/Experience'))
const AppturnityCard = dynamic(() => import('@/components/sections/AppturnityCard'))
const Footer = dynamic(() => import('@/components/layout/Footer'))
const ScrollToTop = dynamic(() => import('@/components/ui/ScrollToTop'), { ssr: false })

export default function Home() {
  // Track section views as user scrolls
  useSectionTracking()

  // Track scroll depth milestones
  useScrollTracking()

  // Coming back from a project page ("Back to projects"): land on the
  // projects without a #projects in the address. The section is lazy-loaded,
  // so wait (up to 3s) until it has rendered.
  useEffect(() => {
    let target: string | null = null
    try {
      target = sessionStorage.getItem(SCROLL_TO_KEY)
      sessionStorage.removeItem(SCROLL_TO_KEY)
    } catch {
      return
    }
    if (!target) return
    const started = performance.now()
    let frame = 0
    const tryScroll = () => {
      const el = document.getElementById(target!)
      if (el && el.offsetHeight > 400) {
        window.scrollTo({
          top: el.getBoundingClientRect().top + window.scrollY - 80,
          behavior: 'instant',
        })
        return
      }
      if (performance.now() - started < 3000) frame = requestAnimationFrame(tryScroll)
    }
    tryScroll()
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="relative w-full bg-blue-400 dark:bg-darkBlue flex overflow-hidden focus:outline-none"
    >
      <div className="w-full m-auto">
        <SectionErrorBoundary sectionName="Hero Section">
          <Hero />
        </SectionErrorBoundary>

        <FloatingNav navItems={navItems} />

        <div className="m-auto max-w-md sm:max-w-xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl">
          <section id="about" aria-label="About me">
            <SectionErrorBoundary sectionName="About Section">
              <Grid />
            </SectionErrorBoundary>
          </section>

          <section id="projects" aria-label="Projects">
            <SectionErrorBoundary sectionName="Projects Section">
              <Projects />
            </SectionErrorBoundary>
          </section>

          <section id="experience" aria-label="Work experience">
            <SectionErrorBoundary sectionName="Experience Section">
              <Experience />
            </SectionErrorBoundary>
          </section>

          <section id="appturnity" aria-label="Appturnity consulting and social links">
            <SectionErrorBoundary sectionName="Appturnity Section">
              <AppturnityCard />
            </SectionErrorBoundary>
          </section>

          <section id="contact">
            <SectionErrorBoundary sectionName="Contact Section">
              <Footer />
            </SectionErrorBoundary>
          </section>
        </div>

        <ScrollToTop />
      </div>
    </main>
  )
}
