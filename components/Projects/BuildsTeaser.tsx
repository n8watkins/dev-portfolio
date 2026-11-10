'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import {
  FiArrowUpRight,
  FiBell,
  FiChevronLeft,
  FiChevronRight,
  FiExternalLink,
} from 'react-icons/fi'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import ProjectClip from './ProjectClip'
import { trackProjectEvent } from '@/lib/analytics'

/**
 * The n8builds.dev card under the projects: the site's name as a link, "See
 * more of my selected work" under it, then its builds one at a time, the
 * featured ones (OpenPing, Solara) first, shown in use. Each shows its
 * own icon and accent, what it is, a link to
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
  liveSite?: string
  /**
   * Still being built (n8builds-web's data/upcoming.ts): "Coming soon", its
   * landing page, and "Join the waitlist" on n8builds.dev in place of the
   * build's page (owner, round 4 of 2026-11-09).
   */
  upcoming?: { landing: string }
  /** A screenshot beside the copy (contain: a small popup, shown whole on a dark frame). */
  shot?: { src: string; alt: string; contain?: boolean }
  /**
   * The product in use instead: a few muted seconds (n8builds.dev's own build
   * page clips, scripts/product-clips/ in n8builds-web), played like the
   * project clips.
   */
  clip?: { src: string; poster: string; alt: string }
  /** The accent: the product's own colour (text and the card's glow). */
  accent: { text: string; glow: string; bar: string; rgb: string }
}

const BUILDS: Build[] = [
  {
    slug: 'openping',
    clip: {
      src: '/builds/openping/clip.mp4',
      poster: '/builds/openping/clip-poster.webp',
      alt: "OpenPing checking whether a site is up: it's up, with its status and response time",
    },
    name: 'OpenPing',
    icon: '/builds/openping/icon.svg',
    kind: 'Web tool',
    tagline: 'Uptime monitoring on your own Cloudflare',
    desc: 'Watches live demos and sites without counting their scheduled off-hours as downtime.',
    liveSite: 'https://openping.n8builds.dev',
    accent: {
      text: 'text-emerald-300',
      glow: 'from-emerald-400/[0.14]',
      bar: 'bg-emerald-400',
      rgb: '52 211 153',
    },
  },
  {
    slug: 'solara',
    clip: {
      src: '/builds/solara/clip.mp4',
      poster: '/builds/solara/clip-poster.webp',
      alt: "Solara's dashboard: today's UV by hour and the next lower-UV slot for a run",
    },
    name: 'Solara',
    icon: '/builds/solara/icon.png',
    kind: 'Web app',
    tagline: 'Personal UV planner',
    desc: 'The UV index is a number, not an answer. Solara turns live UV, your skin type and your sunscreen into safe sun windows.',
    liveSite: 'https://solara-uv.web.app',
    accent: {
      text: 'text-orange-300',
      glow: 'from-orange-400/[0.14]',
      bar: 'bg-orange-400',
      rgb: '250 204 21',
    },
  },
  {
    slug: 'scribe',
    shot: {
      src: '/builds/scribe/shot-2026-10.webp',
      alt: "Scribe's site: hold a hotkey, talk, and it types",
    },
    name: 'Scribe',
    icon: '/builds/scribe/icon.png',
    kind: 'Desktop app',
    tagline: 'Speech-to-text for Windows',
    desc: 'Hold a hotkey, talk and let go: your words land at the cursor in any app, transcribed by Whisper on your own PC.',
    liveSite: 'https://scribe.n8builds.dev',
    accent: {
      text: 'text-sky-300',
      glow: 'from-sky-400/[0.14]',
      bar: 'bg-sky-400',
      rgb: '56 189 248',
    },
  },
  {
    slug: 'tubevault',
    shot: {
      src: '/builds/tubevault/shot-2026-10.webp',
      alt: "TubeVault's popup, archiving a YouTube video",
      contain: true,
    },
    name: 'TubeVault',
    icon: '/builds/tubevault/icon.png',
    kind: 'Chrome extension',
    tagline: 'Local-first YouTube archiver',
    desc: 'Archive YouTube videos, playlists and whole channels with a local yt-dlp helper. Your library, on your own disk.',
    accent: {
      text: 'text-rose-300',
      glow: 'from-rose-400/[0.14]',
      bar: 'bg-rose-400',
      rgb: '251 113 133',
    },
  },
  {
    slug: 'piper-tts',
    shot: {
      src: '/builds/piper-tts/shot-2026-10.webp',
      alt: "Piper TTS's popup, reading text aloud",
      contain: true,
    },
    name: 'Piper TTS',
    icon: '/builds/piper-tts/icon.png',
    kind: 'Chrome extension',
    tagline: 'Fully local read-aloud for Chrome',
    desc: 'Highlight text, right-click, and hear it read aloud by a Piper model running fully on your machine. No cloud, no keys.',
    accent: {
      text: 'text-violet-300',
      glow: 'from-violet-400/[0.14]',
      bar: 'bg-violet-400',
      rgb: '167 139 250',
    },
  },
  {
    slug: 'tldw',
    name: 'TL;DW',
    icon: '/builds/tldw/icon.png',
    kind: 'Chrome extension',
    tagline: 'One-keystroke YouTube to Gemini',
    desc: "On any YouTube video, press Alt+G: it opens Gemini with your saved prompt and the video, and submits. Too Long; Didn't Watch.",
    accent: {
      text: 'text-orange-300',
      glow: 'from-orange-400/[0.14]',
      bar: 'bg-orange-400',
      rgb: '251 146 60',
    },
  },
  {
    slug: 'keysready',
    name: 'KeysReady',
    icon: '/builds/keysready/icon.svg',
    shot: {
      src: '/builds/keysready/shot-2026-11.webp',
      alt: 'KeysReady\'s landing page: Stop answering "Is my car ready?"',
    },
    kind: 'Coming soon',
    tagline: 'Booking and live repair status for auto shops',
    desc: 'For small auto repair shops: customers book online, follow their repair live, and approve and pay from their phone.',
    upcoming: { landing: 'https://keysready.n8builds.dev' },
    accent: {
      text: 'text-red-300',
      glow: 'from-red-400/[0.14]',
      bar: 'bg-red-400',
      rgb: '255 90 78',
    },
  },
  {
    slug: 'relink',
    name: 'Relink',
    icon: '/builds/relink/icon.svg',
    shot: {
      src: '/builds/relink/shot-2026-11.webp',
      alt: "Relink's landing page: Catch every 404",
    },
    kind: 'Coming soon',
    tagline: 'Sends broken links to the right page',
    desc: 'When a visitor follows a broken link to your website, it sends them to the page they meant instead of an error page.',
    upcoming: { landing: 'https://relink.n8builds.dev' },
    accent: {
      text: 'text-orange-300',
      glow: 'from-orange-400/[0.14]',
      bar: 'bg-orange-400',
      rgb: '255 138 76',
    },
  },
  {
    slug: 'pivot',
    name: 'Pivot',
    icon: '/builds/pivot/icon.svg',
    shot: {
      src: '/builds/pivot/shot-2026-11.webp',
      alt: "Pivot's landing page: A pause button for the urge",
    },
    kind: 'Coming soon',
    tagline: 'A pause button for everyday urges',
    desc: 'When the pull to scroll, snack or check your email hits, it gives you one small next step you already picked.',
    upcoming: { landing: 'https://pivot.n8builds.dev/welcome' },
    accent: {
      text: 'text-emerald-300',
      glow: 'from-emerald-400/[0.14]',
      bar: 'bg-emerald-400',
      rgb: '143 191 159',
    },
  },
]

/** n8builds.dev's waitlist, with this build ticked (its public `?interest=` contract). */
const waitlistHref = (slug: string) => `https://n8builds.dev/upcoming?interest=${slug}#waitlist`

const INTERVAL_MS = 7000

/** A step back or forward through the builds. */
const ArrowButton = ({ side, onClick }: { side: 'prev' | 'next'; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={side === 'prev' ? 'Previous build' : 'Next build'}
    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/12 text-slate-300 hover:bg-white/8 hover:text-white focus:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-400"
  >
    {side === 'prev' ? (
      <FiChevronLeft className="h-5 w-5" aria-hidden="true" />
    ) : (
      <FiChevronRight className="h-5 w-5" aria-hidden="true" />
    )}
  </button>
)

const BUTTON =
  'inline-flex items-center gap-2 h-11 rounded-xl px-4 text-base font-semibold transition-colors duration-200 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-400'

export default function BuildsTeaser() {
  const [index, setIndex] = useState(0)
  // 1 when moving forward (the next build slides in from the right), -1 back
  const [dir, setDir] = useState<1 | -1>(1)
  const [paused, setPaused] = useState(false)
  const reduceMotion = usePrefersReducedMotion()
  const build = BUILDS[index]
  const go = (step: number) => {
    setDir(step < 0 ? -1 : 1)
    setIndex((i) => (i + step + BUILDS.length) % BUILDS.length)
  }

  useEffect(() => {
    if (reduceMotion || paused) return
    const id = setTimeout(() => {
      setDir(1)
      setIndex((i) => (i + 1) % BUILDS.length)
    }, INTERVAL_MS)
    return () => clearTimeout(id)
  }, [reduceMotion, paused, index])

  return (
    <section
      aria-labelledby="building-in-public"
      aria-describedby="building-in-public-sub"
      className="w-full text-left"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {/* The site, then what it is: its icon with the small label together. */}
      <div className="flex flex-col gap-2">
        {/* The site's name on top, plainly a link, and the invitation under it
            (owner, 2026-11-08). */}
        <div className="flex items-center gap-3">
          <Image
            src="/tab/n8-icon.png"
            alt=""
            width={48}
            height={48}
            className="h-12 w-12 shrink-0 rounded-xl ring-1 ring-white/10"
          />
          <div className="min-w-0">
            <h3 id="building-in-public" className="text-2xl font-bold sm:text-3xl">
              <a
                href="https://n8builds.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-1.5 rounded text-slate-50 underline decoration-sky-400/50 decoration-2 underline-offset-4 transition-colors hover:text-sky-300 hover:decoration-sky-300 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-400"
              >
                n8builds.dev
                <FiArrowUpRight
                  className="h-6 w-6 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  aria-hidden="true"
                />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </h3>
            <p id="building-in-public-sub" className="text-base text-slate-300 sm:text-lg">
              See more of my selected work
            </p>
          </div>
        </div>
      </div>

      {/* One build at a time, in its own colour */}
      <div
        // On hover the card's edge and a soft glow pick up the current build's colour.
        className="relative mt-4 overflow-hidden rounded-2xl border border-white/10 bg-white/3 p-4 transition-[border-color,box-shadow] duration-300 hover:border-[rgb(var(--build)/0.4)] hover:shadow-[0_0_44px_-16px_rgb(var(--build)/0.5)] sm:p-5"
        style={{ '--build': build.accent.rgb } as React.CSSProperties}
        role="group"
        aria-roledescription="carousel"
        aria-label="Builds on n8builds.dev"
      >
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(closest-side,var(--tw-gradient-from),transparent)] ${build.accent.glow}`}
        />
        <div
          key={build.slug}
          className={`${dir > 0 ? 'teaser-in-r' : 'teaser-in-l'} relative grid items-center gap-5 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] md:gap-6`}
        >
          <div className="min-w-0">
            {/* Its icon beside its name, as on the project rows; the copy runs full width under them. */}
            <div className="flex items-center gap-3">
              <Image
                src={build.icon}
                alt=""
                width={56}
                height={56}
                unoptimized={build.icon.endsWith('.svg')}
                className="h-12 w-12 shrink-0 rounded-xl sm:h-14 sm:w-14"
              />
              <div className="min-w-0">
                <h3 className="text-2xl font-bold tracking-tight text-slate-50 sm:text-3xl">
                  {build.wordmark ?? build.name}
                </h3>
                <p className={`text-base font-semibold ${build.accent.text}`}>
                  {build.kind} · {build.tagline}
                </p>
              </div>
            </div>
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
              {build.desc}
            </p>
            <div className="mt-4 flex flex-wrap gap-2.5">
              {build.liveSite && (
                <a
                  href={build.liveSite}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() =>
                    trackProjectEvent('more_builds_click', build.name, { url: build.liveSite })
                  }
                  className={`${BUTTON} bg-linear-to-r from-blue-600 to-cyan-700 text-white hover:from-blue-700 hover:to-cyan-800`}
                >
                  <FiExternalLink className="h-4 w-4" aria-hidden="true" />
                  Live site<span className="sr-only"> of {build.name} (opens in a new tab)</span>
                </a>
              )}
              {build.upcoming && (
                <>
                  <a
                    href={waitlistHref(build.slug)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      trackProjectEvent('more_builds_click', build.name, {
                        url: waitlistHref(build.slug),
                      })
                    }
                    className={`${BUTTON} bg-linear-to-r from-blue-600 to-cyan-700 text-white hover:from-blue-700 hover:to-cyan-800`}
                  >
                    <FiBell className="h-4 w-4" aria-hidden="true" />
                    Join the waitlist
                    <span className="sr-only">
                      {' '}
                      for {build.name} on n8builds.dev (opens in a new tab)
                    </span>
                  </a>
                  <a
                    href={build.upcoming.landing}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      trackProjectEvent('more_builds_click', build.name, {
                        url: build.upcoming!.landing,
                      })
                    }
                    className={`${BUTTON} border border-white/12 bg-white/4 text-slate-200 hover:bg-white/8`}
                  >
                    Its landing page
                    <FiArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </>
              )}
              {!build.upcoming && (
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
                  className={`${BUTTON} border border-white/12 bg-white/4 text-slate-200 hover:bg-white/8`}
                >
                  See the build
                  <FiArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </a>
              )}
            </div>
          </div>
          {/* The product in use, a screenshot, or the icon on its own frame when there is neither */}
          {build.clip ? (
            <ProjectClip
              title={build.name}
              src={build.clip.src}
              poster={build.clip.poster}
              alt={build.clip.alt}
              frameClassName="border-white/10 shadow-2xl shadow-black/40"
              className="hidden md:block"
              onOpen={() =>
                window.open(
                  `https://n8builds.dev/builds/${build.slug}`,
                  '_blank',
                  'noopener,noreferrer'
                )
              }
            />
          ) : (
            <div className="relative hidden aspect-16/10 overflow-hidden rounded-xl border border-white/10 bg-[#0a1322] shadow-2xl shadow-black/40 md:block">
              {build.shot ? (
                <Image
                  src={build.shot.src}
                  alt={build.shot.alt}
                  fill
                  sizes="(max-width: 1024px) 40vw, 440px"
                  className={build.shot.contain ? 'object-contain p-4' : 'object-cover object-top'}
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Image
                    src={build.icon}
                    alt=""
                    width={96}
                    height={96}
                    unoptimized={build.icon.endsWith('.svg')}
                    className="h-24 w-24 rounded-3xl"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* The controls, centred: back, where you are, forward */}
        <div className="relative mt-4 flex items-center justify-center gap-4">
          <ArrowButton side="prev" onClick={() => go(-1)} />
          <div className="flex items-center gap-1.5">
            {BUILDS.map((b, i) => (
              <button
                key={b.slug}
                type="button"
                aria-label={`Show ${b.name}`}
                aria-current={i === index}
                onClick={() => {
                  setDir(i < index ? -1 : 1)
                  setIndex(i)
                }}
                className={`h-1.5 rounded-full transition-all duration-300 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-400 ${
                  i === index ? `w-6 ${build.accent.bar}` : 'w-1.5 bg-white/30 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
          <ArrowButton side="next" onClick={() => go(1)} />
        </div>
        <p
          className="sr-only"
          aria-live="polite"
        >{`${build.name}, ${index + 1} of ${BUILDS.length}`}</p>
      </div>
    </section>
  )
}
