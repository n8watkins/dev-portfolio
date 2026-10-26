import { FaXTwitter, FaTwitch, FaYoutube } from 'react-icons/fa6'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { FiGithub, FiArrowUpRight, FiMail } from 'react-icons/fi'
import { CiLinkedin } from 'react-icons/ci'
import {
  fadeInVariants,
  staggerContainerVariants,
  staggerItemVariants,
  defaultAnimationConfig,
} from '@/lib/animations'
import SectionHeading from '@/components/ui/SectionHeading'

const EMAIL = 'contact@n8builds.dev'

const BUTTON =
  'inline-flex items-center justify-center gap-2 h-10 px-3.5 text-sm sm:h-11 sm:px-5 sm:text-base rounded-full border font-semibold transition-all duration-200'
const OUTLINE = 'border-slate-600 text-slate-200 hover:border-sky-400/60 hover:text-sky-300'

const Footer = () => {
  return (
    <footer className="xl:max-w-5xl pt-0 pb-20 lg:pb-12">
      {/* background grid */}
      <div className="w-full absolute left-0 1sm:-translate-y-52 -bottom-72 min-h-96 pointer-events-none">
        <Image
          src="/footer-grid.svg"
          alt=""
          className="w-full h-full opacity-50 z-10 pointer-events-none"
          fill
          sizes="100vw"
        />
      </div>

      <div className="px-4 pt-20">
        <SectionHeading
          eyebrow="Contact"
          title={
            <>
              Let&apos;s build something <span className="text-sky-400">together</span>
            </>
          }
        >
          Hiring for an AI full-stack role, or have a project in mind? Reach me directly, or send a
          message through the form on n8builds.dev.
        </SectionHeading>

        {/* Direct connections on the left; the n8builds.dev form for a real message on the right. */}
        <motion.div
          variants={fadeInVariants}
          {...defaultAnimationConfig}
          className="mt-8 mb-8 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 shadow-xl md:grid-cols-2"
        >
          <div className="flex flex-col gap-4 bg-slate-900/90 p-5 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Reach me directly
            </p>
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              <a
                href={`mailto:${EMAIL}`}
                className={`${BUTTON} border-transparent text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 hover:shadow-lg hover:shadow-sky-500/30`}
              >
                <FiMail className="w-4 h-4" aria-hidden="true" />
                Email me
              </a>
              <a
                href="https://www.linkedin.com/in/n8watkins/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn (new tab)"
                className={`${BUTTON} ${OUTLINE}`}
              >
                <CiLinkedin className="w-5 h-5" aria-hidden="true" />
                LinkedIn
              </a>
              <a
                href="https://x.com/n8watkins"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (new tab)"
                title="X"
                className={`inline-flex items-center justify-center h-10 w-10 sm:h-11 sm:w-11 rounded-full border transition-all duration-200 ${OUTLINE}`}
              >
                <FaXTwitter className="w-4 h-4" aria-hidden="true" />
              </a>
            </div>
            <a
              href={`mailto:${EMAIL}`}
              className="w-fit text-sm text-slate-400 hover:text-sky-400 transition-colors duration-200 break-all"
            >
              {EMAIL}
            </a>
          </div>
          <div className="flex flex-col gap-4 bg-slate-900/90 p-5 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Have a longer message?
            </p>
            <p className="text-base text-slate-300 leading-relaxed">
              Tell me about the role or the project in the contact form on n8builds.dev.
            </p>
            <a
              href="https://n8builds.dev/#contact"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open the contact form on n8builds.dev (new tab)"
              className={`${BUTTON} ${OUTLINE} w-fit border-sky-400/40 text-sky-200`}
            >
              Open the contact form
              <FiArrowUpRight className="w-4 h-4" aria-hidden="true" />
            </a>
          </div>
        </motion.div>
      </div>
      <motion.div
        variants={staggerContainerVariants}
        {...defaultAnimationConfig}
        className="flex mt-8 lg:flex-row flex-col-reverse justify-center xl:justify-between items-center gap-8 lg:mx-10"
      >
        <motion.p
          variants={staggerItemVariants}
          className="lg:text-base text-sm lg:font-normal font-light"
        >
          Copyright © 2026 Nathan Watkins
        </motion.p>

        <motion.nav
          variants={staggerItemVariants}
          aria-label="Footer social media links"
          className="flex flex-wrap items-center justify-center pb-4 gap-x-3 gap-y-1 z-50"
        >
          <div className="flex items-center gap-3">
            <a
              href="https://n8builds.dev"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit my main site, n8builds.dev"
              className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400 hover:text-sky-500 dark:hover:text-sky-400 transition-colors duration-200"
            >
              n8builds.dev
              <FiArrowUpRight className="w-4 h-4" aria-hidden="true" />
            </a>
            <a
              href="https://appturnity.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit Appturnity, my consulting company"
              className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400 hover:text-sky-500 dark:hover:text-sky-400 transition-colors duration-200"
            >
              Appturnity
              <FiArrowUpRight className="w-4 h-4" aria-hidden="true" />
            </a>
          </div>
          <span
            className="hidden sm:block w-px h-6 bg-slate-300 dark:bg-slate-700"
            aria-hidden="true"
          />
          <div className="flex items-center gap-1 sm:gap-3">
            <a
              href="https://github.com/n8watkins"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View Nathan's GitHub profile"
              className="w-12 h-12 rounded-full hover:bg-blue-500/60 dark:hover:bg-slate-700/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-darkBlue transition-all duration-200"
            >
              <FiGithub className="w-full h-full p-3" aria-hidden="true" />
            </a>
            <a
              href="https://www.linkedin.com/in/n8watkins/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View Nathan's LinkedIn profile"
              className="w-12 h-12 rounded-full hover:bg-blue-500/60 dark:hover:bg-slate-700/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-darkBlue transition-all duration-200"
            >
              <CiLinkedin className="w-full h-full p-2" aria-hidden="true" />
            </a>
            <a
              href="https://x.com/n8watkins"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View Nathan's X (Twitter) profile"
              className="w-12 h-12 rounded-full hover:bg-blue-500/60 dark:hover:bg-slate-700/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-darkBlue transition-all duration-200"
            >
              <FaXTwitter className="w-full h-full p-3" aria-hidden="true" />
            </a>
            <a
              href="https://twitch.tv/n8builds"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow Nathan on Twitch"
              className="w-12 h-12 rounded-full hover:bg-blue-500/60 dark:hover:bg-slate-700/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-darkBlue transition-all duration-200"
            >
              <FaTwitch className="w-full h-full p-3" aria-hidden="true" />
            </a>
            <a
              href="https://youtube.com/@n8builds"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow Nathan on YouTube"
              className="w-12 h-12 rounded-full hover:bg-blue-500/60 dark:hover:bg-slate-700/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-darkBlue transition-all duration-200"
            >
              <FaYoutube className="w-full h-full p-3" aria-hidden="true" />
            </a>
          </div>
        </motion.nav>
      </motion.div>
    </footer>
  )
}

export default Footer
