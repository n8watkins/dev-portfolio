import React from 'react'
import { motion } from 'framer-motion'
import GridBackground from '@/components/ui/GridBackground'
import { FiGithub, FiArrowUpRight } from 'react-icons/fi'
import { CiLinkedin } from 'react-icons/ci'
import { FaXTwitter } from 'react-icons/fa6'
import { staggerContainerVariants } from '@/lib/animations'
import PortraitRotator from '@/components/sections/PortraitRotator'
import { heroPortraits } from '@/data/portraits'

const Hero = () => {
  return (
    <div
      className="relative flex flex-col h-auto min-h-[40rem] md:h-[86vh] pb-16 md:pb-0 items-center justify-center bg-blue-400 dark:bg-darkBlue transition-bg select-none"
      id="home">
      <GridBackground />
      <div className="max-w-[100vw] h-full md:max-w-2xl lg:max-w-[70vw] flex flex-col items-center justify-center z-50">
        <motion.p
          initial="hidden"
          animate="visible"
          variants={staggerContainerVariants}
          className="uppercase tracking-widest pb-2 1lg:pb-5 md:pb-10 pt-40 sm:pt-40 md:pt-10 text-base md:text-xl text-center text-darkBlue font-semibold dark:font-normal dark:text-white max-w-80">
          <motion.span
            variants={{
              hidden: { opacity: 0, y: 15 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } }
            }}
            className="inline-block"
          >
            Code.
          </motion.span>{' '}
          <motion.span
            variants={{
              hidden: { opacity: 0, y: 15 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.4, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] } }
            }}
            className="inline-block"
          >
            Create.
          </motion.span>{' '}
          <motion.span
            variants={{
              hidden: { opacity: 0, y: 15 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.4, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] } }
            }}
            className="inline-block"
          >
            Innovate.
          </motion.span>
        </motion.p>
        <div className="flex flex-col-reverse md:flex-row items-center justify-center w-full gap-8 md:gap-14">
          <div className="flex max-w-[100vw] md:max-w-2xl lg:max-w-[60vw] flex-col items-start gap-3 md:gap-5">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-center md:text-start w-full justify-start text-5xl lg:text-6xl font-semibold">
              Hi, I&apos;m <span className="text-sky-400">Nathan</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.0, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-center md:text-start w-full pl-1 md:tracking-wider text-2xl md:text-lg lg:text-2xl font-semibold dark:font-normal">
              AI Full-Stack Developer
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.15, ease: [0.25, 0.1, 0.25, 1] }}
              className="text-center md:text-start w-full pl-1 text-base md:text-lg text-slate-600 dark:text-slate-400 max-w-md">
              Building intelligent products that automate, scale, and perform - across the full stack.
            </motion.p>
            <div className="flex items-center justify-center md:justify-start w-full">
              <nav aria-label="Social media links" className="relative md:top-0 md:-left-2 z-50">
                <div className="flex items-center justify-center pb-2 gap-3">
                  <motion.a
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
                    href="https://github.com/n8watkins"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="View Nathan's GitHub profile"
                    className="w-12 h-12 rounded-full hover:bg-blue-500/60 dark:hover:bg-slate-700/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-darkBlue transition-colors duration-200"
                  >
                    <FiGithub className="w-full h-full p-3" aria-hidden="true" />
                  </motion.a>
                  <motion.a
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 1.35, ease: [0.25, 0.1, 0.25, 1] }}
                    href="https://www.linkedin.com/in/n8watkins/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="View Nathan's LinkedIn profile"
                    className="w-12 h-12 rounded-full hover:bg-blue-500/60 dark:hover:bg-slate-700/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-darkBlue transition-colors duration-200"
                  >
                    <CiLinkedin className="w-full h-full p-2" aria-hidden="true" />
                  </motion.a>
                  <motion.a
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 1.5, ease: [0.25, 0.1, 0.25, 1] }}
                    href="https://x.com/n8watkins"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="View Nathan's X (Twitter) profile"
                    className="w-12 h-12 rounded-full hover:bg-blue-500/60 dark:hover:bg-slate-700/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-darkBlue transition-colors duration-200"
                  >
                    <FaXTwitter className="w-full h-full p-3" aria-hidden="true" />
                  </motion.a>
                </div>
              </nav>
            </div>

            {/* Brand CTAs - the two places this card funnels to */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.65, ease: [0.25, 0.1, 0.25, 1] }}
              className="flex w-full flex-wrap items-center md:justify-start justify-center gap-3 pt-1">
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
                    aria-hidden="true">
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
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
            className="w-[15rem] h-[15rem] 1sm:w-[17rem] 1sm:h-[17rem] 1lg:w-[19rem] 1lg:h-[19rem] sm:w-[22rem] sm:h-[22rem] relative">
            <div className="aspect-square w-full h-full relative">
              <div className="absolute inset-0 dark:bg-black/20 rounded-full z-10"></div>
              <PortraitRotator
                images={heroPortraits}
                transition="fade"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                alt="Professional headshot of Nathan Watkins, an AI full-stack developer"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Hero
