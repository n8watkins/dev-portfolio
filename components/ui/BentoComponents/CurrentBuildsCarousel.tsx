'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { FiGithub, FiArrowUpRight } from 'react-icons/fi'

/**
 * "Building in public" - a living feed of the projects I'm shipping in public
 * (see n8builds.dev), adapted into the bento style. The header stays fixed
 * top-left while the build cycles underneath: each slide carries the project's
 * own icon, a one-line pitch, its stack, and direct links out (Code / Live).
 * Auto-advances, but pauses on hover/focus.
 */
type BuildLink = { github: string; live?: string }

interface Build {
  name: string
  tag: string
  desc: string
  image: string
  gradient: string
  accent: string
  stack: string[]
  links: BuildLink
}

const BUILDS: Build[] = [
  {
    name: 'Scribe',
    tag: 'Desktop · Rust + Whisper',
    desc: 'Hold a hotkey, talk, release: transcribed on-device by whisper.cpp and dropped right at your cursor. No cloud, no account, no audio leaves your machine.',
    image: '/builds/scribe.png',
    gradient: 'from-slate-500/25 via-blue-600/15 to-transparent',
    accent: 'text-sky-300',
    stack: ['Tauri', 'Rust', 'whisper.cpp', 'SQLite'],
    links: { github: 'https://github.com/n8watkins/scribe', live: 'https://scribe.n8builds.dev' },
  },
  {
    name: 'TL;DW',
    tag: 'Chrome extension · Gemini',
    desc: 'Too Long; Didn’t Watch - press Alt+G on any YouTube video and it opens Gemini with your saved prompt and the video URL already filled in.',
    image: '/builds/tldw.png',
    gradient: 'from-orange-500/25 via-amber-500/12 to-transparent',
    accent: 'text-orange-300',
    stack: ['Chrome MV3', 'TypeScript', 'Vite'],
    links: { github: 'https://github.com/n8watkins/tl-dw' },
  },
  {
    name: 'Portfolio Rank',
    tag: 'Web app · AI scoring',
    desc: '1,700+ developer portfolios, browsable and searchable - soon ranked by head-to-head votes and AI scoring instead of alphabetically.',
    image: '/builds/portfolio-rank.png',
    gradient: 'from-sky-500/25 via-blue-500/12 to-transparent',
    accent: 'text-sky-300',
    stack: ['Next.js', 'TypeScript', 'Vercel'],
    links: { github: 'https://github.com/n8watkins/portfolio-rank', live: 'https://portfoliorank.vercel.app' },
  },
]

const INTERVAL_MS = 6000

export default function CurrentBuildsCarousel() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    if (prefersReducedMotion || paused) return
    const id = setInterval(() => setIndex((i) => (i + 1) % BUILDS.length), INTERVAL_MS)
    return () => clearInterval(id)
    // Re-arm on index change too (e.g. dot click) so the timer bar stays in sync.
    // Pause on hover/focus (WCAG 2.2.2) - also keeps the focused slide from
    // unmounting and dropping a keyboard user's focus mid-interaction.
  }, [prefersReducedMotion, paused, index])

  const build = BUILDS[index]

  return (
    <div
      className="absolute inset-0 z-30 flex flex-col p-4 md:p-5 select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}>
      {/* Fixed header - stays put while the build below cycles */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 motion-safe:animate-ping" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </span>
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-slate-100">
            Building in public
          </p>
        </div>
        <a
          href="https://n8builds.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="group/n8 inline-flex items-center gap-1 text-sm font-semibold text-sky-300 hover:text-sky-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded">
          <span className="underline-offset-4 group-hover/n8:underline">n8builds.dev</span>
          <FiArrowUpRight
            className="w-4 h-4 transition-transform group-hover/n8:translate-x-0.5 group-hover/n8:-translate-y-0.5"
            aria-hidden="true"
          />
        </a>
      </div>

      {/* Timer bar - fills over each build's turn */}
      <div className="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-white/10">
        {prefersReducedMotion ? (
          <div className="h-full w-full bg-sky-400/60" />
        ) : (
          <motion.div
            key={index}
            className="h-full bg-sky-400"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: INTERVAL_MS / 1000, ease: 'linear' }}
          />
        )}
      </div>

      {/* Cycling build - icon + details */}
      <div className="relative flex-1 mt-2.5 min-h-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="flex h-full w-full items-start gap-4 md:gap-5">
            {/* Project icon */}
            <div
              className={`relative hidden sm:block h-20 w-20 md:h-24 md:w-24 flex-shrink-0 rounded-2xl border border-white/10 bg-gradient-to-br ${build.gradient}`}>
              <div className="absolute inset-[18%]">
                <Image src={build.image} alt="" fill sizes="96px" className="object-contain" />
              </div>
            </div>

            {/* Details */}
            <div className="flex min-w-0 flex-col">
              <h3 className="text-2xl font-bold text-slate-100 lg:text-3xl">{build.name}</h3>
              <p className={`mt-1 text-xs font-semibold uppercase tracking-wider ${build.accent}`}>
                {build.tag}
              </p>
              <p className="mt-2 max-w-2xl text-sm text-slate-200/90 md:text-base leading-snug line-clamp-2">
                {build.desc}
              </p>

              {/* Stack */}
              <div className="mt-2.5 hidden flex-wrap gap-1.5 md:flex">
                {build.stack.map((s) => (
                  <span
                    key={s}
                    className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-xs font-medium text-slate-300">
                    {s}
                  </span>
                ))}
              </div>

              {/* Per-build redirects */}
              <div className="mt-2.5 flex items-center gap-2.5">
                <a
                  href={build.links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${build.name} source on GitHub`}
                  className="group/code inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-medium text-slate-200 hover:bg-white/10 hover:text-white hover:border-white/25 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400">
                  <FiGithub className="w-4 h-4 transition-transform group-hover/code:scale-110" aria-hidden="true" />
                  Code
                </a>
                {build.links.live && (
                  <a
                    href={build.links.live}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${build.name} live demo`}
                    className="group/live inline-flex items-center gap-1.5 rounded-lg border border-sky-400/30 bg-sky-500/15 px-3 py-1.5 text-sm font-medium text-sky-200 hover:bg-sky-500/25 hover:text-sky-100 hover:border-sky-400/60 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-sky-500/20 active:translate-y-0 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400">
                    Live
                    <FiArrowUpRight
                      className="w-4 h-4 transition-transform group-hover/live:translate-x-0.5 group-hover/live:-translate-y-0.5"
                      aria-hidden="true"
                    />
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots */}
      <div className="mt-2.5 flex items-center gap-1.5">
        {BUILDS.map((b, i) => (
          <button
            key={b.name}
            type="button"
            aria-label={`Show ${b.name}`}
            aria-current={i === index}
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
              i === index ? 'w-6 bg-sky-400' : 'w-1.5 bg-white/40 hover:bg-white/70'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
