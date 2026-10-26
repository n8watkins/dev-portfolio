'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { FiArrowUpRight, FiChevronLeft, FiChevronRight, FiExternalLink } from 'react-icons/fi'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { trackProjectEvent } from '@/lib/analytics'

/**
 * The n8builds.dev teaser under the projects: the site's icon with a small
 * "Building in public" label, then its builds one at a time. Each shows its
 * own icon and accent (Portfolio Rank's gold "Rank"), what it is, a link to
 * its live site when it has one, and "See the build" on n8builds.dev. The
 * facts come from n8builds-web's data/builds.tsx and Lab rows.
 *
 * It advances every 7 seconds, pauses while hovered or focused (WCAG 2.2.2),
 * and holds still under reduced motion; the arrows and dots step by hand.
 */
interface Build {
  slug: string
  name: string
  wordmark?: React.ReactNode
  icon: string
  kind: string
  tagline: string
  desc: string
  tags: string[]
  liveSite?: string
  /** The accent: the product's own colour (text and the card's glow). */
  accent: { text: string; glow: string; bar: string }
}

const BUILDS: Build[] = [
  {
    slug: 'scribe',
    name: 'Scribe',
    icon: '/builds/scribe/icon.png',
    kind: 'Desktop app',
    tagline: 'Local dictation for Windows',
    desc: 'Hold a hotkey, talk and let go, and your words land at the cursor, transcribed on your own PC.',
    tags: ['Tauri', 'Rust', 'whisper.cpp'],
    liveSite: 'https://scribe.n8builds.dev',
    accent: { text: 'text-sky-300', glow: 'from-sky-400/[0.14]', bar: 'bg-sky-400' },
  },
  {
    slug: 'openping',
    name: 'OpenPing',
    icon: '/builds/openping/icon.svg',
    kind: 'Web tool',
    tagline: 'Self-hosted uptime monitoring',
    desc: 'Watches live demos, the ones on this page included, from your own Cloudflare account; off-hours never count as downtime.',
    tags: ['Cloudflare Workers', 'D1', 'Hono', 'React'],
    liveSite: 'https://openping.n8builds.dev',
    accent: { text: 'text-emerald-300', glow: 'from-emerald-400/[0.14]', bar: 'bg-emerald-400' },
  },
  {
    slug: 'solara',
    name: 'Solara',
    icon: '/builds/solara/icon.png',
    kind: 'Web app',
    tagline: 'Personal UV planner',
    desc: 'The UV index is a number, not an answer. Solara turns live UV, your skin type and your sunscreen into safe sun windows.',
    tags: ['Next.js', 'Firebase', 'Open-Meteo'],
    liveSite: 'https://solara-uv.web.app',
    accent: { text: 'text-orange-300', glow: 'from-orange-400/[0.14]', bar: 'bg-orange-400' },
  },
  {
    slug: 'portfolio-rank',
    name: 'Portfolio Rank',
    wordmark: (
      <>
        Portfolio <span className="text-[#fbbf24]">Rank</span>
      </>
    ),
    icon: '/builds/portfolio-rank/icon.png',
    kind: 'Web app',
    tagline: 'Developer portfolios, ranked',
    desc: 'Nearly 2,000 developer portfolios, ranked by head-to-head votes instead of A to Z, with a real screenshot of every site.',
    tags: ['Next.js', 'Gemini', 'Turso', 'Vercel'],
    liveSite: 'https://portfoliorank.vercel.app',
    accent: { text: 'text-amber-300', glow: 'from-amber-400/[0.14]', bar: 'bg-amber-400' },
  },
  {
    slug: 'tubevault',
    name: 'TubeVault',
    icon: '/builds/tubevault/icon.png',
    kind: 'Chrome extension',
    tagline: 'Local-first YouTube archiver',
    desc: 'Archive YouTube videos, playlists and channels locally with a yt-dlp helper. Your library, on your disk.',
    tags: ['Chrome MV3', 'yt-dlp', 'React'],
    accent: { text: 'text-rose-300', glow: 'from-rose-400/[0.14]', bar: 'bg-rose-400' },
  },
  {
    slug: 'piper-tts',
    name: 'Piper TTS',
    icon: '/builds/piper-tts/icon.png',
    kind: 'Chrome extension',
    tagline: 'Fully local read-aloud for Chrome',
    desc: 'Highlight text, right-click, and hear it read aloud by a Piper model running fully on your machine. No cloud, no keys.',
    tags: ['Chrome MV3', 'Piper', 'React'],
    accent: { text: 'text-violet-300', glow: 'from-violet-400/[0.14]', bar: 'bg-violet-400' },
  },
  {
    slug: 'tldw',
    name: 'TL;DW',
    icon: '/builds/tldw/icon.png',
    kind: 'Chrome extension',
    tagline: 'One-keystroke YouTube to Gemini',
    desc: "On any YouTube video, press Alt+G: it opens Gemini with your saved prompt and the video, and submits. Too Long; Didn't Watch.",
    tags: ['Chrome MV3', 'TypeScript', 'Vite'],
    accent: { text: 'text-orange-300', glow: 'from-orange-400/[0.14]', bar: 'bg-orange-400' },
  },
]

const INTERVAL_MS = 7000

const BUTTON =
  'inline-flex items-center gap-1.5 h-9 rounded-lg px-3.5 text-sm font-semibold transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400'

export default function BuildsTeaser() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const reduceMotion = usePrefersReducedMotion()
  const build = BUILDS[index]
  const go = (step: number) => setIndex((i) => (i + step + BUILDS.length) % BUILDS.length)

  useEffect(() => {
    if (reduceMotion || paused) return
    const id = setTimeout(() => setIndex((i) => (i + 1) % BUILDS.length), INTERVAL_MS)
    return () => clearTimeout(id)
  }, [reduceMotion, paused, index])

  return (
    <section
      aria-labelledby="building-in-public"
      className="w-full text-left"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {/* The site, then what it is: its icon with the small label together. */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <a
          href="https://n8builds.dev"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-3 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
        >
          <Image
            src="/tab/n8-icon.png"
            alt=""
            width={40}
            height={40}
            className="h-10 w-10 rounded-xl ring-1 ring-white/10"
          />
          <span className="flex flex-col">
            <span
              id="building-in-public"
              className="flex items-center gap-2 text-[0.7rem] font-bold uppercase tracking-[0.16em] text-emerald-300"
            >
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 motion-safe:animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              Building in public
            </span>
            <span className="flex items-center gap-1 text-xl font-bold text-slate-100 group-hover:text-sky-300 transition-colors">
              n8builds.dev
              <FiArrowUpRight className="h-4 w-4 opacity-70" aria-hidden="true" />
              <span className="sr-only"> (opens in a new tab)</span>
            </span>
          </span>
        </a>
        <p className="max-w-md text-sm text-slate-400">
          Beyond these projects, I ship tools in public. Here is more of what I&apos;m building.
        </p>
      </div>

      {/* One build at a time, in its own colour */}
      <div
        className="relative mt-5 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6"
        role="group"
        aria-roledescription="carousel"
        aria-label="Builds on n8builds.dev"
      >
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(closest-side,var(--tw-gradient-from),transparent)] ${build.accent.glow}`}
        />
        <div key={build.slug} className="teaser-in relative flex items-start gap-4">
          <Image
            src={build.icon}
            alt=""
            width={48}
            height={48}
            unoptimized={build.icon.endsWith('.svg')}
            className="h-12 w-12 shrink-0 rounded-xl"
          />
          <div className="min-w-0 flex-1">
            <h3 className="text-2xl font-bold tracking-tight text-slate-50">
              {build.wordmark ?? build.name}
            </h3>
            <p className={`text-sm font-semibold ${build.accent.text}`}>
              {build.kind} · {build.tagline}
            </p>
            <p className="mt-2 max-w-2xl text-[0.95rem] leading-relaxed text-slate-300">
              {build.desc}
            </p>
            <ul aria-label={`${build.name} is built with`} className="mt-3 flex flex-wrap gap-1.5">
              {build.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 font-mono text-xs text-slate-300"
                >
                  {tag}
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap gap-2">
              {build.liveSite && (
                <a
                  href={build.liveSite}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() =>
                    trackProjectEvent('more_builds_click', build.name, { url: build.liveSite })
                  }
                  className={`${BUTTON} bg-gradient-to-r from-blue-600 to-cyan-700 text-white hover:from-blue-700 hover:to-cyan-800`}
                >
                  <FiExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  Live site<span className="sr-only"> of {build.name} (opens in a new tab)</span>
                </a>
              )}
              <a
                href={`https://n8builds.dev/builds/${build.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`See the build: ${build.name} on n8builds.dev`}
                onClick={() =>
                  trackProjectEvent('more_builds_click', build.name, {
                    url: `https://n8builds.dev/builds/${build.slug}`,
                  })
                }
                className={`${BUTTON} border border-white/12 bg-white/[0.04] text-slate-200 hover:bg-white/[0.08]`}
              >
                See the build
                <FiArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>

        {/* Where you are, and the controls */}
        <div className="relative mt-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            {BUILDS.map((b, i) => (
              <button
                key={b.slug}
                type="button"
                aria-label={`Show ${b.name}`}
                aria-current={i === index}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
                  i === index ? `w-6 ${build.accent.bar}` : 'w-1.5 bg-white/30 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            {(['prev', 'next'] as const).map((side) => (
              <button
                key={side}
                type="button"
                onClick={() => go(side === 'prev' ? -1 : 1)}
                aria-label={side === 'prev' ? 'Previous build' : 'Next build'}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/12 text-slate-300 hover:bg-white/[0.08] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
              >
                {side === 'prev' ? (
                  <FiChevronLeft className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <FiChevronRight className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            ))}
          </div>
        </div>
        <p
          className="sr-only"
          aria-live="polite"
        >{`${build.name}, ${index + 1} of ${BUILDS.length}`}</p>
      </div>
    </section>
  )
}
