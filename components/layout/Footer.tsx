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

/**
 * The streaming links (Twitch, YouTube) stay hidden until streaming starts,
 * as on n8builds.dev; flip this then.
 */
const STREAMING = false

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

      <div className="px-4 pt-6 md:pt-20">
        <SectionHeading
          eyebrow="Contact"
          title={
            <>
              Let&apos;s build something <span className="text-sky-400">together</span>
            </>
          }
        >
          Hiring a full-stack developer, or have a project in mind? Reach me directly, or send a
          message through the form on n8builds.dev.
        </SectionHeading>

        {/* One centred block, framed in the site's cyan-to-blue like the hero's
            cards: the direct connections, then the form for a longer message. */}
        <motion.div
          variants={fadeInVariants}
          {...defaultAnimationConfig}
          className="mx-auto mt-8 mb-8 w-full rounded-3xl bg-gradient-to-br from-cyan-400/40 via-blue-500/20 to-blue-600/40 p-px shadow-xl shadow-black/30"
        >
          <div className="relative overflow-hidden rounded-[23px] bg-[#0b1324] px-5 py-8 text-center sm:px-10 sm:py-10">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-24 left-1/2 h-48 w-[28rem] -translate-x-1/2 rounded-full bg-cyan-500/[0.12] blur-3xl"
            />
            <div className="relative flex flex-col items-center gap-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">
                Reach me directly
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
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
                className="text-sm text-slate-400 transition-colors duration-200 hover:text-sky-400"
              >
                {EMAIL}
              </a>
              <div className="my-1 h-px w-full max-w-sm bg-gradient-to-r from-transparent via-white/15 to-transparent" />
              <p className="text-sm text-slate-300">
                <span className="font-semibold text-slate-100">Have a longer message?</span> Send it
                through the form on n8builds.dev.
              </p>
              <a
                href="https://n8builds.dev/#contact"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open the contact form on n8builds.dev (new tab)"
                className={`${BUTTON} ${OUTLINE} border-sky-400/40 text-sky-200`}
              >
                Open the contact form
                <FiArrowUpRight className="w-4 h-4" aria-hidden="true" />
              </a>
            </div>
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
            {STREAMING && (
              <>
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
              </>
            )}
          </div>
        </motion.nav>
      </motion.div>
    </footer>
  )
}

export default Footer
