import { FaXTwitter, FaTwitch, FaYoutube } from 'react-icons/fa6'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { FiGithub, FiArrowUpRight, FiMail } from 'react-icons/fi'
import { CiLinkedin } from 'react-icons/ci'
import { fadeInUpVariants, fadeInVariants, staggerContainerVariants, staggerItemVariants, defaultAnimationConfig } from '@/lib/animations'

const Footer = () => {
  return (
    <footer className="xl:max-w-5xl  pt-0 pb-12 ">
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
          className="text-center mb-12">
          <h2 className="text-5xl font-bold py-14 text-slate-800 dark:text-slate-200 select-none lg:max-w-[45vw] mb-6">
            Let&apos;s build something <span className="text-sky-400">amazing together!</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto px-5 leading-tight text-lg md:text-xl">
            Got a project in mind? Let&apos;s chat! 💬
          </p>
        </motion.div>

        {/* Slim contact card - this site routes; inbound contact lives on n8builds.dev */}
        <motion.div
          variants={fadeInVariants}
          {...defaultAnimationConfig}
          className="w-full max-w-2xl mx-auto mb-8 px-4">
          <div className="bg-white/5 dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl p-8 border border-white/10 shadow-xl flex flex-col items-center gap-6">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href="https://n8builds.dev"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Get in touch via my main site, n8builds.dev"
                className="group flex items-center gap-2 px-5 py-2.5 rounded-full border border-sky-400/40 text-base font-semibold text-slate-800 dark:text-slate-200 hover:text-white hover:border-transparent hover:bg-gradient-to-r hover:from-cyan-400 hover:to-blue-600 hover:shadow-lg hover:shadow-sky-500/40 transition-all duration-300"
              >
                Get in touch - n8builds.dev
                <FiArrowUpRight
                  className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300"
                  aria-hidden="true"
                />
              </a>
              <a
                href="https://appturnity.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Consulting inquiries via Appturnity"
                className="group flex items-center gap-2 px-5 py-2.5 rounded-full border border-slate-400 dark:border-slate-600 text-base font-semibold text-slate-800 dark:text-slate-200 hover:bg-white hover:text-slate-900 dark:hover:text-slate-900 hover:border-white hover:shadow-lg hover:shadow-slate-100/20 transition-all duration-300"
              >
                Consulting -{' '}
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
            </div>
            <a
              href="mailto:nathancwatkins23@gmail.com"
              className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-sky-500 dark:hover:text-sky-400 transition-colors duration-200"
            >
              <FiMail className="w-4 h-4" aria-hidden="true" />
              nathancwatkins23@gmail.com
            </a>
          </div>
        </motion.div>
      </div>
      <motion.div
        variants={staggerContainerVariants}
        {...defaultAnimationConfig}
        className="flex mt-8 lg:flex-row flex-col-reverse justify-center xl:justify-between items-center gap-8 lg:mx-10">
        <motion.p
          variants={staggerItemVariants}
          className="lg:text-base text-sm lg:font-normal font-light">
          Copyright © 2026 Nathan Watkins
        </motion.p>

        <motion.nav
          variants={staggerItemVariants}
          aria-label="Footer social media links"
          className="flex items-center justify-center pb-4 gap-3 z-50">
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
          <span className="w-px h-6 bg-slate-300 dark:bg-slate-700" aria-hidden="true" />
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
        </motion.nav>
      </motion.div>
    </footer>
  )
}

export default Footer
