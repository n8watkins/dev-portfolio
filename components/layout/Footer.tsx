import { FaXTwitter, FaTwitch, FaYoutube } from 'react-icons/fa6'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { FiGithub, FiArrowUpRight, FiMail } from 'react-icons/fi'
import { CiLinkedin } from 'react-icons/ci'
import {
  fadeInUpVariants,
  fadeInVariants,
  staggerContainerVariants,
  staggerItemVariants,
  defaultAnimationConfig,
} from '@/lib/animations'

const EMAIL = 'contact@n8builds.dev'

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

      <div className="flex flex-col items-center">
        {/* Header */}
        <motion.div
          variants={fadeInUpVariants}
          {...defaultAnimationConfig}
          className="text-center mb-12"
        >
          <h2 className="text-5xl font-bold py-14 text-slate-800 dark:text-slate-200 select-none lg:max-w-[45vw] mb-6">
            Let&apos;s build something <span className="text-sky-400">amazing together!</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto px-5 leading-snug text-lg md:text-xl">
            Hiring for an AI full-stack role, or have a project in mind? Email is the fastest way to
            reach me.
          </p>
        </motion.div>

        {/* Hiring contact first (email, LinkedIn); consulting and the workshop site after. */}
        <motion.div
          variants={fadeInVariants}
          {...defaultAnimationConfig}
          className="w-full max-w-2xl mx-auto mb-8 px-4"
        >
          <div className="bg-white/5 dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl px-6 py-8 sm:p-8 border border-white/10 shadow-xl flex flex-col items-center gap-5">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href={`mailto:${EMAIL}`}
                className="group flex items-center gap-2 px-5 py-2.5 rounded-full border border-transparent text-base font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 hover:shadow-lg hover:shadow-sky-500/40 transition-all duration-300"
              >
                <FiMail className="w-4 h-4" aria-hidden="true" />
                Email me
              </a>
              <a
                href="https://www.linkedin.com/in/n8watkins/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Connect on LinkedIn (new tab)"
                className="group flex items-center gap-2 px-5 py-2.5 rounded-full border border-slate-400 dark:border-slate-600 text-base font-semibold text-slate-800 dark:text-slate-200 hover:border-sky-400/60 hover:text-sky-300 transition-all duration-300"
              >
                <CiLinkedin className="w-5 h-5" aria-hidden="true" />
                LinkedIn
              </a>
            </div>
            <a
              href={`mailto:${EMAIL}`}
              className="text-sm text-slate-600 dark:text-slate-400 hover:text-sky-500 dark:hover:text-sky-400 transition-colors duration-200 break-all"
            >
              {EMAIL}
            </a>
            <p className="text-sm text-slate-500 text-center leading-relaxed">
              Need a site or an AI workflow for your business?{' '}
              <a
                href="https://appturnity.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 font-medium text-slate-300 hover:text-sky-400 transition-colors"
              >
                Appturnity
                <FiArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
            </p>
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
