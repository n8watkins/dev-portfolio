import { FaXTwitter, FaTwitch, FaYoutube } from 'react-icons/fa6'
import { motion } from 'motion/react'
import Image from 'next/image'
import Link from 'next/link'
import { FiGithub, FiMail } from 'react-icons/fi'
import { CiLinkedin } from 'react-icons/ci'
import { fadeInVariants, defaultAnimationConfig } from '@/lib/animations'
import SectionHeading from '@/components/ui/SectionHeading'
import SiteDoors from '@/components/ui/SiteDoors'
import { projects } from '@/data/projects'
import { RESUME_VIEW_URL } from '@/lib/resume'
import CookieSettingsButton from '@/components/consent/CookieSettingsButton'

const EMAIL = 'contact@n8builds.dev'
const CONTACT_FORM = 'https://n8builds.dev/#contact-form'

const ICON_BUTTON =
  'inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-600 text-slate-200 transition-all duration-200 hover:border-sky-400/60 hover:text-sky-300 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-400 sm:h-11 sm:w-11'
const LINK = 'text-sm text-slate-400 transition-colors duration-200 hover:text-sky-300'

/**
 * The streaming links (Twitch, YouTube) stay hidden until streaming starts,
 * as on n8builds.dev; flip this then.
 */
const STREAMING = false

const socials = [
  { href: 'https://github.com/n8watkins', label: 'GitHub', Icon: FiGithub, pad: 'p-3' },
  {
    href: 'https://www.linkedin.com/in/n8watkins/',
    label: 'LinkedIn',
    Icon: CiLinkedin,
    pad: 'p-2',
  },
  { href: 'https://x.com/n8watkins', label: 'X', Icon: FaXTwitter, pad: 'p-3' },
  ...(STREAMING
    ? [
        { href: 'https://youtube.com/@n8builds', label: 'YouTube', Icon: FaYoutube, pad: 'p-3' },
        { href: 'https://twitch.tv/n8builds', label: 'Twitch', Icon: FaTwitch, pad: 'p-3' },
      ]
    : []),
]

/** The site map: this page's sections, the project pages, and the rest of me online. */
const sitemap = [
  {
    title: 'On this page',
    links: [
      { label: 'About', href: '/#about' },
      { label: 'Projects', href: '/#projects' },
      { label: 'Experience', href: '/#experience' },
      { label: 'My workshop', href: '/#appturnity' },
      { label: 'Contact', href: '/#contact' },
    ],
  },
  {
    title: 'Projects',
    links: projects.map((p) => ({ label: p.title, href: `/projects/${p.slug}` })),
  },
  {
    title: 'Elsewhere',
    links: [
      { label: 'Resume', href: RESUME_VIEW_URL, external: true },
      { label: 'n8builds.dev', href: 'https://n8builds.dev', external: true },
      { label: 'Build log', href: 'https://n8builds.dev/builds', external: true },
      { label: 'Appturnity', href: 'https://appturnity.com', external: true },
      { label: 'Source code', href: 'https://github.com/n8watkins/dev-portfolio', external: true },
    ],
  },
]

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
          Hiring a full-stack developer, or have a project in mind? Reach out!
        </SectionHeading>

        {/* One centred block, framed in the site's cyan-to-blue like the hero's
            cards: the address, LinkedIn and X, then the form on n8builds.dev. */}
        <motion.div
          variants={fadeInVariants}
          {...defaultAnimationConfig}
          className="mx-auto mt-8 mb-8 w-full rounded-3xl bg-linear-to-br from-cyan-400/40 via-blue-500/20 to-blue-600/40 p-px shadow-xl shadow-black/30"
        >
          <div className="relative overflow-hidden rounded-[23px] bg-[#0b1324] px-5 py-8 text-center sm:px-10 sm:py-10">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-24 left-1/2 h-48 w-md -translate-x-1/2 rounded-full bg-cyan-500/12 blur-3xl"
            />
            <div className="relative flex flex-col items-center gap-5">
              <div className="flex flex-wrap items-center justify-center gap-2.5">
                <a
                  href={`mailto:${EMAIL}`}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-linear-to-r from-cyan-500 to-blue-600 px-4 text-sm font-semibold text-white transition-all duration-200 hover:from-cyan-400 hover:to-blue-500 hover:shadow-lg hover:shadow-sky-500/30 sm:h-11 sm:px-5 sm:text-base"
                >
                  <FiMail className="h-4 w-4" aria-hidden="true" />
                  {EMAIL}
                </a>
                <a
                  href="https://www.linkedin.com/in/n8watkins/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn (new tab)"
                  title="LinkedIn"
                  className={ICON_BUTTON}
                >
                  <CiLinkedin className="h-6 w-6" aria-hidden="true" />
                </a>
                <a
                  href="https://x.com/n8watkins"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="X (new tab)"
                  title="X"
                  className={ICON_BUTTON}
                >
                  <FaXTwitter className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
              <div className="h-px w-full max-w-sm bg-linear-to-r from-transparent via-white/15 to-transparent" />
              <p className="text-sm text-slate-300 sm:text-base">
                Or message me through{' '}
                <a
                  href={CONTACT_FORM}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-sky-300 underline decoration-sky-300/40 underline-offset-4 transition-colors hover:text-sky-200 hover:decoration-sky-200"
                >
                  n8builds.dev
                  <span className="sr-only"> (its contact form, in a new tab)</span>
                </a>
                .
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* The site footer: the two other sites as the hero's cards, a site map, then the fine print. */}
      <motion.div {...defaultAnimationConfig} variants={fadeInVariants} className="mt-14 px-4">
        <div className="grid gap-10 border-t border-white/8 pt-10 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] lg:gap-12">
          <div className="flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-300">
              Where else I build
            </p>
            <SiteDoors />
          </div>
          <nav aria-label="Site map" className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3">
            {sitemap.map((col) => (
              <div key={col.title} className="flex flex-col gap-2.5">
                <p className="whitespace-nowrap text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
                  {col.title}
                </p>
                <ul className="flex flex-col gap-2">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      {'external' in l && l.external ? (
                        <a href={l.href} target="_blank" rel="noopener noreferrer" className={LINK}>
                          {l.label}
                          <span className="sr-only"> (opens in a new tab)</span>
                        </a>
                      ) : (
                        <Link href={l.href} className={LINK}>
                          {l.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-10 flex flex-col-reverse items-center justify-between gap-4 border-t border-white/6 pt-6 sm:flex-row">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <p className="text-sm text-slate-400">Copyright © 2026 Nathan Watkins</p>
            {/* Reopens the analytics consent banner (components/consent). */}
            <CookieSettingsButton className="cursor-pointer text-sm text-slate-400 transition-colors duration-200 hover:text-sky-300" />
          </div>
          <nav aria-label="Footer social media links" className="flex items-center gap-1">
            {socials.map(({ href, label, Icon, pad }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`View Nathan's ${label} profile`}
                className="h-11 w-11 rounded-full transition-all duration-200 hover:bg-slate-700/70 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-400"
              >
                <Icon className={`h-full w-full ${pad}`} aria-hidden="true" />
              </a>
            ))}
          </nav>
        </div>
      </motion.div>
    </footer>
  )
}

export default Footer
