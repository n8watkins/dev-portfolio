import React from 'react'
import { FiGithub, FiFileText } from 'react-icons/fi'
import { CiLinkedin } from 'react-icons/ci'
import { FaXTwitter } from 'react-icons/fa6'
import HeroGrid from '@/components/sections/HeroGrid'
import WhoamiTerminal from '@/components/sections/WhoamiTerminal'
import SiteDoors from '@/components/ui/SiteDoors'
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
            <SiteDoors
              className="hero-in w-full max-w-md md:max-w-xl mx-auto md:mx-0"
              style={delay(450)}
            />
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
