import React from 'react'
import GridBackground from '@/components/ui/GridBackground'
import { FiGithub, FiArrowUpRight, FiArrowDown } from 'react-icons/fi'
import { CiLinkedin } from 'react-icons/ci'
import { FaXTwitter } from 'react-icons/fa6'
import PortraitRotator from '@/components/sections/PortraitRotator'
import { heroPortraits } from '@/data/portraits'

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
      className="relative flex flex-col h-auto min-h-[40rem] md:h-[86vh] pb-16 md:pb-0 items-center justify-center bg-blue-400 dark:bg-darkBlue transition-bg select-none"
      id="home"
    >
      <GridBackground />
      <div className="max-w-[100vw] h-full md:max-w-2xl lg:max-w-[70vw] flex flex-col items-center justify-center z-50">
        <p className="uppercase tracking-widest pb-2 1lg:pb-5 md:pb-10 pt-40 sm:pt-40 md:pt-10 text-base md:text-xl text-center text-darkBlue font-semibold dark:font-normal dark:text-white max-w-80">
          <span className="hero-in inline-block">Code.</span>{' '}
          <span className="hero-in inline-block" style={delay(80)}>
            Create.
          </span>{' '}
          <span className="hero-in inline-block" style={delay(160)}>
            Innovate.
          </span>
        </p>
        <div className="flex flex-col-reverse md:flex-row items-center justify-center w-full gap-8 md:gap-14">
          <div className="flex max-w-[100vw] md:max-w-2xl lg:max-w-[60vw] flex-col items-start gap-3 md:gap-5">
            <h1 className="hero-slide-l text-center md:text-start w-full justify-start text-5xl lg:text-6xl font-semibold">
              Hi, I&apos;m <span className="text-sky-400">Nathan</span>
            </h1>
            <p
              className="hero-in text-center md:text-start w-full pl-1 md:tracking-wider text-2xl md:text-lg lg:text-2xl font-semibold dark:font-normal"
              style={delay(150)}
            >
              AI Full-Stack Developer
            </p>
            <p
              className="hero-in text-center md:text-start w-full pl-1 text-base md:text-lg text-slate-600 dark:text-slate-400 max-w-md"
              style={delay(250)}
            >
              Building intelligent products that automate, scale, and perform - across the full
              stack.
            </p>
            <div className="flex items-center justify-center md:justify-start w-full">
              <nav aria-label="Social media links" className="relative md:top-0 md:-left-2 z-50">
                <div className="flex items-center justify-center pb-2 gap-3">
                  {socials.map(({ href, label, Icon, pad }, i) => (
                    <a
                      key={href}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      style={delay(300 + i * 60)}
                      className="hero-in w-12 h-12 rounded-full hover:bg-blue-500/60 dark:hover:bg-slate-700/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-darkBlue transition-colors duration-200"
                    >
                      <Icon className={`w-full h-full ${pad}`} aria-hidden="true" />
                    </a>
                  ))}
                </div>
              </nav>
            </div>

            {/* The hiring path first (the projects), then the two sites this one funnels to. */}
            <div
              className="hero-in flex w-full flex-wrap items-center md:justify-start justify-center gap-3 pt-1"
              style={delay(450)}
            >
              <a
                href="#projects"
                className="group flex items-center gap-2 px-5 py-2.5 rounded-full border border-transparent text-base font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 hover:shadow-lg hover:shadow-sky-500/40 transition-all duration-300"
              >
                See my projects
                <FiArrowDown
                  className="w-4 h-4 group-hover:translate-y-0.5 transition-transform duration-300"
                  aria-hidden="true"
                />
              </a>
              <a
                href="https://n8builds.dev"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit my main site, n8builds.dev"
                className="group flex items-center gap-2 px-5 py-2.5 rounded-full border border-sky-400/40 text-base font-semibold text-slate-800 dark:text-slate-200 hover:text-white hover:border-transparent hover:bg-gradient-to-r hover:from-cyan-400 hover:to-blue-600 hover:shadow-lg hover:shadow-sky-500/40 transition-all duration-300"
              >
                n8builds.dev
                <FiArrowUpRight
                  className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300"
                  aria-hidden="true"
                />
              </a>
              <a
                href="https://appturnity.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit Appturnity, my consulting company"
                className="group flex items-center gap-2 px-5 py-2.5 rounded-full border border-slate-400 dark:border-slate-600 text-base font-semibold text-slate-800 dark:text-slate-200 hover:bg-white hover:text-slate-900 dark:hover:text-slate-900 hover:border-white hover:shadow-lg hover:shadow-slate-100/20 transition-all duration-300"
              >
                <span className="relative">
                  Appturnity
                  {/* Appturnity's hand-drawn understroke, shown on hover */}
                  <svg
                    className="absolute -bottom-1.5 left-0 w-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-[#237EF6]/40"
                    viewBox="0 0 300 12"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M1 5.5C54.5 2.5 150.5 1.5 299 11.5"
                      stroke="currentColor"
                      strokeWidth="14"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                <FiArrowUpRight
                  className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300"
                  aria-hidden="true"
                />
              </a>
            </div>
          </div>
          <div className="hero-slide-r w-[15rem] h-[15rem] 1sm:w-[17rem] 1sm:h-[17rem] 1lg:w-[19rem] 1lg:h-[19rem] sm:w-[22rem] sm:h-[22rem] relative">
            <div className="aspect-square w-full h-full relative">
              <div className="absolute inset-0 dark:bg-black/20 rounded-full z-10"></div>
              <PortraitRotator
                images={heroPortraits}
                transition="fade"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                alt="Professional headshot of Nathan Watkins, an AI full-stack developer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hero
