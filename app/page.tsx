'use client'
import React, { useEffect } from 'react'
import { SCROLL_TO_KEY } from '@/components/Projects/BackToHome'
import { forgetHomeSpot, rememberHomeSpot, takeRestoreSpot } from '@/lib/returnTo'
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
const Footer = dynamic(() => import('@/components/layout/Footer'))
const ScrollToTop = dynamic(() => import('@/components/ui/ScrollToTop'), { ssr: false })

export default function Home() {
  // Track section views as user scrolls
  useSectionTracking()

  // Track scroll depth milestones
  useScrollTracking()

  // On the way to /about (any link there): remember how far down the page is,
  // for /about's "Continue where you were".
  useEffect(() => {
    forgetHomeSpot()
    const onClick = (e: MouseEvent) => {
      const link = (e.target as Element | null)?.closest?.('a[href]')
      if (link && new URL((link as HTMLAnchorElement).href).pathname === '/about') rememberHomeSpot()
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [])

  // Back from /about's "Continue where you were": return to that spot once its
  // section has rendered (the sections below the hero are lazy), up to 3s.
  useEffect(() => {
    const spot = takeRestoreSpot()
    if (spot === null) return
    const started = performance.now()
    let frame = 0
    // Until it sticks: the section must have rendered, the page must be tall
    // enough to reach the spot (or the browser clamps the scroll), and the
    // scroll must have landed there.
    const tryRestore = () => {
      const el = spot.section ? document.getElementById(spot.section) : null
      const ready = !spot.section || (el !== null && el.offsetHeight > 200)
      const base = el ? el.getBoundingClientRect().top + window.scrollY : 0
      const target = Math.max(0, base + spot.offset)
      const reachable = document.documentElement.scrollHeight - window.innerHeight >= target - 1
      if (ready && reachable) {
        window.scrollTo({ top: target, behavior: 'instant' })
        if (Math.abs(window.scrollY - target) <= 2) return
      }
      if (performance.now() - started < 3000) frame = requestAnimationFrame(tryRestore)
      else window.scrollTo({ top: target, behavior: 'instant' })
    }
    tryRestore()
    return () => cancelAnimationFrame(frame)
  }, [])

  // Arriving from another page through the nav or the site map: land on the
  // section without a #section in the address. The sections are lazy-loaded,
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
      // A lazy section is a short placeholder until it renders.
      if (el && el.offsetHeight > 200) {
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
      className="relative w-full bg-blue-400 dark:bg-darkBlue flex overflow-hidden focus:outline-hidden"
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
