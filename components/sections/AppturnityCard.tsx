'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { FiArrowUpRight, FiCheck, FiGithub } from 'react-icons/fi'
import PauseOffscreen from '@/components/ui/PauseOffscreen'
import SectionHeading from '@/components/ui/SectionHeading'
import {
  staggerContainerVariants,
  staggerItemVariants,
  defaultAnimationConfig,
} from '@/lib/animations'
import styles from './Doors.module.css'

/** A screenshot: when it is taller than its frame it scrolls (see Doors.module.css). */
interface Shot {
  src: string
  alt: string
  width: number
  height: number
  /** seconds for one pass down (or up) */
  duration?: number
}

interface Door {
  id: string
  title: string
  name: string
  icon: string
  blurb: React.ReactNode
  pointsLabel?: string
  points: string[]
  cta: { label: string; href: string }
  secondary?: { label: string; href: string }
  /** The site's source on GitHub, as a third, quieter link. */
  github?: string
  desktop: Shot
  phone: Shot
  /** true: the screenshots hold still (top of the page) instead of scrolling. */
  still?: boolean
  accent: { check: string; button: string; glow: string; ring: string }
}

const BROWSER_ASPECT = 16 / 10
const PHONE_ASPECT = 9 / 19.5

/** The screen inside a frame: a fixed aspect ratio, and a tall shot scrolls in it. */
const Screen = ({
  shot,
  aspect,
  sizes,
  still,
}: {
  shot: Shot
  aspect: number
  sizes: string
  still?: boolean
}) => {
  // How much of the image the frame shows, as a share of the image's height.
  const shown = shot.width / aspect / shot.height
  const scrolls = !still && shown < 0.98
  return (
    <div
      className="relative overflow-hidden [transform:translateZ(0)]"
      style={{ aspectRatio: aspect }}
    >
      <Image
        src={shot.src}
        alt={shot.alt}
        width={shot.width}
        height={shot.height}
        sizes={sizes}
        className={`block h-auto w-full ${scrolls ? styles.scroll : ''}`}
        style={
          scrolls
            ? ({
                '--travel': `${(-(1 - shown) * 100).toFixed(3)}%`,
                '--duration': `${shot.duration ?? 30}s`,
              } as React.CSSProperties)
            : undefined
        }
      />
    </div>
  )
}

/** A browser window and a phone, mostly side by side with a small overlap. */
const Showcase = ({ desktop, phone, still }: { desktop: Shot; phone: Shot; still?: boolean }) => (
  <PauseOffscreen className="relative flex items-center">
    <div className="w-[78%] overflow-hidden rounded-xl border border-white/10 bg-[#0a1322] shadow-2xl shadow-black/40">
      <div
        aria-hidden
        className="flex items-center gap-1.5 border-b border-white/[0.08] bg-white/[0.04] px-3 py-1.5"
      >
        <span className="h-2 w-2 rounded-full bg-white/20" />
        <span className="h-2 w-2 rounded-full bg-white/20" />
        <span className="h-2 w-2 rounded-full bg-white/20" />
      </div>
      <Screen
        shot={desktop}
        aspect={BROWSER_ASPECT}
        sizes="(max-width: 1024px) 72vw, 400px"
        still={still}
      />
    </div>
    <div className="relative -ml-[4%] w-[26%] shrink-0 overflow-hidden rounded-[1rem] border-[4px] border-[#0b1220] bg-[#0b1220] shadow-2xl shadow-black/60 ring-1 ring-white/[0.12]">
      <div className="overflow-hidden rounded-[0.7rem]">
        <Screen
          shot={phone}
          aspect={PHONE_ASPECT}
          sizes="(max-width: 1024px) 26vw, 140px"
          still={still}
        />
      </div>
    </div>
  </PauseOffscreen>
)

// The two other sites, as n8builds.dev's "Work with me" cards: Appturnity
// (the owner's company) and n8builds.dev (where he builds in public). Copy
// from n8builds.dev's own cards and the n8builds case study.
const doors: Door[] = [
  {
    id: 'appturnity',
    name: 'Appturnity',
    icon: '/brands/appturnity.png',
    title: 'Web services for service businesses',
    blurb:
      'We build pool, HVAC, landscaping and other service businesses a free website, then automate their busywork with AI.',
    pointsLabel: 'Today',
    points: [
      'A website built and launched for you, free',
      'Free hosting and 90 days of free edits',
      'Paid plans add your own domain and Google Business Profile help',
    ],
    cta: { label: 'Visit Appturnity', href: 'https://appturnity.com' },
    secondary: { label: 'See the plans', href: 'https://appturnity.com/pricing' },
    desktop: {
      src: '/work/landscaping-verdant.webp',
      alt: "Appturnity's landscaping website template",
      width: 1200,
      height: 750,
    },
    phone: {
      src: '/work/landscaping-verdant-mobile.webp',
      alt: "Appturnity's landscaping template on a phone",
      width: 320,
      height: 7136,
      duration: 40,
    },
    accent: {
      // Appturnity's own blue (#1066f4) on the button.
      check: 'text-sky-300',
      button: 'from-[#1066f4] to-[#1066f4] hover:from-[#3b82f6] hover:to-[#3b82f6]',
      glow: 'bg-[radial-gradient(closest-side,rgba(56,189,248,0.12),transparent)]',
      ring: 'hover:border-sky-300/30 hover:shadow-sky-500/20',
    },
  },
  {
    id: 'n8builds',
    name: 'n8builds.dev',
    icon: '/tab/n8-icon.png',
    title: 'Where I build in public',
    blurb:
      'Everything I make outside client work lives here, free to try, each build with the story of how I made it.',
    points: [
      'Tools I use every day, free to try',
      'Web apps and Chrome extensions',
      'All open source, this portfolio included: use it as a template or fork it',
    ],
    cta: { label: 'Visit n8builds.dev', href: 'https://n8builds.dev' },
    secondary: { label: "How it's built and tested", href: 'https://n8builds.dev/builds/n8builds' },
    github: 'https://github.com/n8watkins/n8builds-web',
    still: true,
    desktop: {
      src: '/work/n8builds-desktop.webp',
      alt: 'The n8builds.dev home page',
      width: 900,
      height: 1800,
      duration: 24,
    },
    phone: {
      src: '/work/n8builds-mobile.webp',
      alt: 'n8builds.dev on a phone',
      width: 320,
      height: 3200,
      duration: 30,
    },
    accent: {
      check: 'text-emerald-400',
      button: 'from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500',
      glow: 'bg-[radial-gradient(closest-side,rgba(52,211,153,0.11),transparent)]',
      ring: 'hover:border-emerald-300/30 hover:shadow-emerald-500/20',
    },
  },
]

const SECONDARY =
  'inline-flex items-center gap-1 text-sm font-semibold text-slate-300 underline decoration-white/20 underline-offset-4 transition-colors hover:text-white hover:decoration-white/60'

// Cards stack, and the screenshots alternate sides from lg up: right on the
// first card, left on the second. On phones they sit above the copy.
const DoorCard = ({ door, index }: { door: Door; index: number }) => {
  const flip = index % 2 === 1
  return (
    <motion.article
      variants={staggerItemVariants}
      aria-labelledby={`door-${door.id}`}
      // The portfolio's card gradient and hover lift, in n8builds.dev's layout.
      className={`group relative grid items-center gap-7 overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#0c4a6e]/40 via-[#0f172a] to-[#0f172a] p-5 shadow-xl shadow-black/30 transition-all duration-300 hover:shadow-2xl sm:p-7 lg:grid-cols-[1.05fr_1fr] lg:gap-10 lg:px-10 lg:py-8 ${door.accent.ring}`}
    >
      <div
        aria-hidden
        className={`pointer-events-none absolute -top-24 h-72 w-72 rounded-full ${door.accent.glow} ${flip ? '-right-20' : '-left-20'}`}
      />

      {/* Screenshots */}
      <a
        href={door.cta.href}
        target="_blank"
        rel="noopener noreferrer"
        tabIndex={-1}
        aria-hidden
        className={`relative block transition-transform duration-500 group-hover:-translate-y-1 ${flip ? 'lg:order-first' : 'lg:order-last'}`}
      >
        <Showcase desktop={door.desktop} phone={door.phone} still={door.still} />
      </a>

      {/* Copy */}
      <div className="relative flex flex-col">
        <div className="flex items-center gap-3">
          <Image
            src={door.icon}
            alt=""
            width={36}
            height={36}
            className="h-9 w-9 rounded-xl object-contain"
          />
          <p className="text-xl font-bold text-slate-100">{door.name}</p>
        </div>

        <h3
          id={`door-${door.id}`}
          className="mt-4 text-balance text-2xl font-extrabold leading-tight tracking-tight text-slate-50 sm:text-[1.75rem]"
        >
          {door.title}
        </h3>
        <p className="mt-2.5 text-[15px] leading-relaxed text-[#9cadc5]">{door.blurb}</p>

        {door.pointsLabel && (
          <p className="mt-4 text-[0.7rem] font-bold uppercase tracking-[0.16em] text-slate-400">
            {door.pointsLabel}
          </p>
        )}
        <ul className={`${door.pointsLabel ? 'mt-2' : 'mt-4'} flex flex-col gap-1.5`}>
          {door.points.map((p) => (
            <li key={p} className="flex items-start gap-2.5 text-sm leading-snug text-slate-300">
              <FiCheck aria-hidden className={`mt-0.5 h-4 w-4 shrink-0 ${door.accent.check}`} />
              <span>{p}</span>
            </li>
          ))}
        </ul>

        {/* The main button, then the smaller links together on one line */}
        <div className="mt-6 flex flex-col items-start gap-4">
          <a
            href={door.cta.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 rounded-xl bg-gradient-to-r ${door.accent.button} px-5 py-2.5 text-sm font-bold text-white transition-all duration-200 hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400`}
          >
            {door.cta.label}
            <FiArrowUpRight aria-hidden className="h-4 w-4" />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            {door.secondary && (
              <a
                href={door.secondary.href}
                target="_blank"
                rel="noopener noreferrer"
                className={SECONDARY}
              >
                {door.secondary.label}
                <FiArrowUpRight aria-hidden className="h-3.5 w-3.5" />
              </a>
            )}
            {door.github && (
              <a href={door.github} target="_blank" rel="noopener noreferrer" className={SECONDARY}>
                <FiGithub aria-hidden className="h-4 w-4" />
                Source on GitHub
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  )
}

/** "My company and my workshop": Appturnity and n8builds.dev, after n8builds.dev's Work with me. */
const AppturnityCard = () => {
  return (
    <div className="relative pb-10 px-4 select-none">
      <SectionHeading
        eyebrow="Beyond the resume"
        title="My workshop"
        className="mb-8"
      />
      <motion.div
        variants={staggerContainerVariants}
        {...defaultAnimationConfig}
        className="flex flex-col gap-5"
      >
        {doors.map((d, i) => (
          <DoorCard key={d.id} door={d} index={i} />
        ))}
      </motion.div>
    </div>
  )
}

export default AppturnityCard
