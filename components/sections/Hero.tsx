import React from 'react'
import Image from 'next/image'
import { FiGithub, FiArrowUpRight, FiFileText } from 'react-icons/fi'
import { CiLinkedin } from 'react-icons/ci'
import { FaXTwitter } from 'react-icons/fa6'
import HeroGrid from '@/components/sections/HeroGrid'
import WhoamiTerminal from '@/components/sections/WhoamiTerminal'
import PortraitRotator from '@/components/sections/PortraitRotator'
import { heroPortraits } from '@/data/portraits'
import { ROLE } from '@/lib/seo'
import { RESUME_VIEW_URL } from '@/lib/resume'
import { trackResumeEvent } from '@/lib/analytics'

/**
 * The entrance is CSS (`.hero-in`, `.hero-slide-*` in globals.css), not JS: the
 * headline and portrait paint with the HTML instead of waiting for hydration,
 * which kept the portrait (the LCP element) invisible for seconds on phones.
 */
const delay = (ms: number) => ({ animationDelay: `${ms}ms` })

const socials = [
  {
    href: 'https://github.com/n8watkins',
    label: "View Nathan's GitHub profile",
    Icon: FiGithub,
    pad: 'p-3',
  },
  {
    href: 'https://www.linkedin.com/in/n8watkins/',
    label: "View Nathan's LinkedIn profile",
    Icon: CiLinkedin,
    pad: 'p-2',
  },
  {
    href: 'https://x.com/n8watkins',
    label: "View Nathan's X (Twitter) profile",
    Icon: FaXTwitter,
    pad: 'p-3',
  },
]

/**
 * The two sites this one leads to, each in its own brand: n8builds.dev's
 * cyan-to-blue and its N8 mark, Appturnity's white-to-light-blue and its A.
 * A gradient hairline frames each card; on hover (or keyboard focus) the
 * brand's colour washes in, the mark lifts and the arrow nudges out. CSS only.
 */
const doors = [
  {
    href: 'https://n8builds.dev',
    eyebrow: 'I build in public',
    name: 'n8builds.dev',
    icon: '/tab/n8-icon.png',
    pitch: 'Free tools I ship every week. Try one, or fork it.',
    detail: '7 builds · all open source',
    frame:
      'from-cyan-400/50 via-blue-500/30 to-blue-600/50 group-hover:from-cyan-300 group-hover:to-blue-500',
    wash: 'from-cyan-500/25 via-blue-600/10',
    eyebrowText: 'from-cyan-300 to-blue-400',
    dot: 'bg-emerald-400',
    glow: 'hover:shadow-xl hover:shadow-cyan-500/25',
  },
  {
    href: 'https://appturnity.com',
    eyebrow: 'My company',
    name: 'Appturnity',
    icon: '/brands/appturnity.png',
    pitch: 'Run a local business? We build your site and launch it free.',
    detail: 'Free website for local businesses',
    frame:
      'from-white/40 via-sky-300/25 to-[#1066f4]/50 group-hover:from-white/80 group-hover:to-[#1066f4]',
    wash: 'from-sky-300/20 via-[#1066f4]/15',
    eyebrowText: 'from-white to-sky-300',
    dot: 'bg-[#1066f4]',
    glow: 'hover:shadow-xl hover:shadow-[#1066f4]/30',
  },
]

const Hero = () => {
  return (
    <div
      className="relative flex flex-col items-center justify-center bg-darkBlue overflow-hidden select-none pt-28 pb-10 md:min-h-[calc(100svh-7rem)] md:pt-28 md:pb-10"
      id="home"
    >
      <HeroGrid />
      <div className="relative z-10 w-full max-w-5xl 2xl:max-w-6xl px-4 flex flex-col items-center">
        <p className="uppercase tracking-widest pb-6 md:pb-6 text-base md:text-lg text-center text-white font-normal">
          <span className="hero-in inline-block">Code.</span>{' '}
          <span className="hero-in inline-block" style={delay(80)}>
            Create.
          </span>{' '}
          <span className="hero-in inline-block" style={delay(160)}>
            Innovate.
          </span>
        </p>
        <div className="flex flex-col-reverse md:flex-row items-center justify-center w-full gap-8 md:gap-14">
          <div className="flex w-full md:w-auto flex-col items-start gap-3 md:gap-4">
            <h1 className="hero-slide-l text-center md:text-start w-full text-5xl lg:text-6xl 2xl:text-7xl font-semibold">
              Hi, I&apos;m <span className="text-sky-400">Nathan</span>
            </h1>
            <p
              className="hero-in text-center md:text-start w-full pl-1 md:tracking-wider text-2xl md:text-lg lg:text-2xl font-normal"
              style={delay(150)}
            >
              {ROLE}
            </p>
            <div className="w-full md:pl-1">
              <WhoamiTerminal
                className="hero-in mx-auto md:mx-0 w-full max-w-md"
                style={delay(200)}
              />
            </div>
            <nav
              aria-label="Social media links"
              className="flex w-full items-center justify-center md:justify-start md:-ml-2 gap-3"
            >
              {socials.map(({ href, label, Icon, pad }, i) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  style={delay(300 + i * 60)}
                  className="hero-in w-12 h-12 rounded-full hover:bg-slate-700/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 transition-colors duration-200"
                >
                  <Icon className={`w-full h-full ${pad}`} aria-hidden="true" />
                </a>
              ))}
              {/* The resume, opened as the resume card opens it */}
              <a
                href={RESUME_VIEW_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackResumeEvent('view')}
                style={delay(480)}
                className="hero-in ml-1 inline-flex h-10 items-center gap-2 rounded-xl border border-sky-400/40 bg-sky-500/10 px-3.5 text-sm font-semibold text-sky-100 transition-colors duration-200 hover:border-sky-300/70 hover:bg-sky-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
              >
                <FiFileText className="h-4 w-4" aria-hidden="true" />
                Resume<span className="sr-only"> (opens in a new tab)</span>
              </a>
            </nav>

            {/* The two sites this one funnels to, each saying what it is. */}
            <div
              className="hero-in grid w-full max-w-md md:max-w-xl grid-cols-1 sm:grid-cols-2 gap-3.5 mx-auto md:mx-0"
              style={delay(450)}
            >
              {doors.map((door) => (
                <a
                  key={door.href}
                  href={door.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group relative block rounded-2xl bg-gradient-to-br p-px text-left shadow-lg shadow-black/30 transition-all duration-300 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${door.frame} ${door.glow}`}
                >
                  <span className="relative flex h-full flex-col overflow-hidden rounded-[15px] bg-[#0b1324] p-4">
                    {/* The brand's colour, washing in from the top left on hover */}
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${door.wash} to-transparent opacity-30 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100`}
                    />
                    <span className="relative flex items-center gap-3">
                      <Image
                        src={door.icon}
                        alt=""
                        width={36}
                        height={36}
                        className="h-9 w-9 shrink-0 rounded-lg object-contain transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110"
                      />
                      <span className="min-w-0 flex-1">
                        <span
                          className={`block bg-gradient-to-r ${door.eyebrowText} bg-clip-text text-[0.65rem] font-bold uppercase tracking-[0.14em] text-transparent`}
                        >
                          {door.eyebrow}
                        </span>
                        <span className="block text-base font-bold text-slate-50">{door.name}</span>
                      </span>
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-300 transition-all duration-300 group-hover:border-white/30 group-hover:bg-white/10 group-hover:text-white">
                        <FiArrowUpRight
                          className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                          aria-hidden="true"
                        />
                      </span>
                    </span>
                    <span className="relative mt-2.5 block text-pretty text-sm leading-snug text-slate-300">
                      {door.pitch}
                    </span>
                    <span className="relative mt-3 inline-flex w-fit items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-xs font-medium text-slate-300">
                      <span className={`h-1.5 w-1.5 rounded-full ${door.dot}`} aria-hidden="true" />
                      {door.detail}
                    </span>
                  </span>
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              ))}
            </div>
          </div>
          <div
            data-hero-portrait=""
            className="hero-slide-r w-[15rem] h-[15rem] 1sm:w-[17rem] 1sm:h-[17rem] 1lg:w-[19rem] 1lg:h-[19rem] sm:w-[20rem] sm:h-[20rem] 2xl:w-[26rem] 2xl:h-[26rem] relative shrink-0"
          >
            <div className="aspect-square w-full h-full relative">
              <div className="absolute inset-0 dark:bg-black/20 rounded-full z-10"></div>
              <PortraitRotator
                images={heroPortraits}
                transition="fade"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                alt="Professional headshot of Nathan Watkins, a full-stack developer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hero
