'use client'
import React from 'react'
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

  return (
    <main id="main-content" tabIndex={-1} className="relative w-full bg-blue-400 dark:bg-darkBlue flex overflow-hidden focus:outline-none">
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
