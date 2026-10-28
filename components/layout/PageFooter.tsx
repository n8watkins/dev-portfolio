import { FiArrowUpRight, FiGithub, FiMail } from 'react-icons/fi'
import { CiLinkedin } from 'react-icons/ci'
import { FaXTwitter } from 'react-icons/fa6'

const EMAIL = 'contact@n8builds.dev'

const ICON =
  'flex h-10 w-10 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-white/8 hover:text-slate-100'

/**
 * A compact footer for the project pages: who this is, a way to get in touch,
 * and the two other sites, so a page doesn't just stop after the stack.
 */
export default function PageFooter() {
  return (
    <footer className="border-t border-white/10 bg-darkBlue">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between xl:max-w-6xl 2xl:max-w-7xl">
        <div>
          <p className="text-lg font-bold text-slate-100">Nathan Watkins</p>
          <p className="text-sm text-slate-400">Full-stack developer in Los Angeles. Open to full-time roles.</p>
          <a
            href={`mailto:${EMAIL}`}
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-linear-to-r from-cyan-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:from-cyan-400 hover:to-blue-500"
          >
            <FiMail className="h-4 w-4" aria-hidden="true" />
            {EMAIL}
          </a>
        </div>
        <nav aria-label="Elsewhere" className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {[
            { href: 'https://n8builds.dev', label: 'n8builds.dev' },
            { href: 'https://appturnity.com', label: 'Appturnity' },
          ].map((l) => (
            <a
              key={l.href}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-slate-300 transition-colors hover:text-sky-300"
            >
              {l.label}
              <FiArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          ))}
          <span className="h-6 w-px bg-white/10" aria-hidden="true" />
          <a href="https://github.com/n8watkins" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className={ICON}>
            <FiGithub className="h-5 w-5" aria-hidden="true" />
          </a>
          <a href="https://www.linkedin.com/in/n8watkins/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className={ICON}>
            <CiLinkedin className="h-6 w-6" aria-hidden="true" />
          </a>
          <a href="https://x.com/n8watkins" target="_blank" rel="noopener noreferrer" aria-label="X" className={ICON}>
            <FaXTwitter className="h-4 w-4" aria-hidden="true" />
          </a>
        </nav>
      </div>
      <p className="pb-8 text-center text-xs text-slate-500">Copyright © 2026 Nathan Watkins</p>
    </footer>
  )
}
