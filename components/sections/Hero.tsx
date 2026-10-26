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
 * The hero's two doors, each with a line on what it is: the resume (the
 * hiring path, opened as the resume card opens it) and n8builds.dev.
 * Appturnity is in the cards, the contact section and the footer.
 */
const doors = [
  {
    href: RESUME_VIEW_URL,
    name: 'Resume',
    icon: (
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
        <FiFileText className="h-4 w-4" />
      </span>
    ),
    line: 'My experience and skills, on one page.',
    look: 'border-sky-400/40 bg-sky-500/[0.08] hover:border-sky-300/70 hover:bg-sky-500/[0.14]',
    onClick: () => trackResumeEvent('view'),
  },
  {
    href: 'https://n8builds.dev',
    name: 'n8builds.dev',
    icon: (
      <Image src="/tab/n8-icon.png" alt="" width={28} height={28} className="h-7 w-7 rounded-md" />
    ),
    line: 'Where I build in public: free, open-source tools.',
    look: 'border-white/10 bg-white/[0.03] hover:border-sky-400/50 hover:bg-white/[0.06]',
    onClick: undefined,
  },
]

const Hero = () => {
  return (
    <div
      className="relative flex flex-col items-center bg-darkBlue overflow-hidden select-none pt-24 md:pt-[6.5rem] pb-10 md:pb-8"
      id="home"
    >
      <HeroGrid />
      <div className="relative z-10 w-full max-w-5xl px-4 flex flex-col items-center">
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
            <h1 className="hero-slide-l text-center md:text-start w-full text-5xl lg:text-6xl font-semibold">
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
            </nav>

            {/* The two sites this one funnels to, each saying what it is. */}
            <div
              className="hero-in grid w-full max-w-md md:max-w-xl grid-cols-1 sm:grid-cols-2 gap-3 mx-auto md:mx-0"
              style={delay(450)}
            >
              {doors.map((door) => (
                <a
                  key={door.href}
                  href={door.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={door.onClick}
                  className={`group flex items-start gap-3 rounded-xl border p-3.5 text-left transition-all duration-200 hover:shadow-lg hover:shadow-sky-500/10 ${door.look}`}
                >
                  <span className="mt-0.5 shrink-0" aria-hidden="true">
                    {door.icon}
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-1 text-base font-semibold text-slate-100">
                      {door.name}
                      <FiArrowUpRight
                        className="h-4 w-4 text-slate-400 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-sky-300"
                        aria-hidden="true"
                      />
                    </span>
                    <span className="mt-0.5 block text-sm leading-snug text-slate-400">
                      {door.line}
                    </span>
                  </span>
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              ))}
            </div>
          </div>
          <div
            data-hero-portrait=""
            className="hero-slide-r w-[15rem] h-[15rem] 1sm:w-[17rem] 1sm:h-[17rem] 1lg:w-[19rem] 1lg:h-[19rem] sm:w-[20rem] sm:h-[20rem] relative shrink-0"
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
