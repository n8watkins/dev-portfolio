import Image from 'next/image'
import { FiArrowUpRight } from 'react-icons/fi'
import { trackProjectEvent } from '@/lib/analytics'

/**
 * More builds, each linking to its page on n8builds.dev, where every build
 * lives. Scribe, TL;DW and Portfolio Rank are in the "Building in public"
 * card, so they aren't repeated here.
 */
const BUILDS = [
  {
    name: 'TubeVault',
    tagline: 'Local-first YouTube archiver',
    kind: 'Chrome extension',
    icon: '/builds/tubevault.png',
    href: 'https://n8builds.dev/builds/tubevault',
  },
  {
    name: 'Piper TTS',
    tagline: 'Fully local read-aloud for Chrome',
    kind: 'Chrome extension',
    icon: '/builds/piper-tts.png',
    href: 'https://n8builds.dev/builds/piper-tts',
  },
  {
    name: 'OpenPing',
    tagline: 'Self-hosted uptime monitoring and status pages on Cloudflare',
    kind: 'Web app',
    icon: '/builds/openping.svg',
    href: 'https://n8builds.dev/builds/openping',
  },
]

export default function MoreBuilds() {
  return (
    <ul className="grid w-full max-w-4xl gap-3 sm:grid-cols-3" aria-label="More builds on n8builds.dev">
      {BUILDS.map((build) => (
        <li key={build.name}>
          <a
            href={build.href}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackProjectEvent('more_builds_click', build.name, { url: build.href })}
            className="group flex h-full items-start gap-3 rounded-2xl border border-white/10 bg-slate-900/50 p-4 text-left transition-colors hover:border-sky-400/40 hover:bg-slate-800/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400">
            <Image src={build.icon} alt="" width={40} height={40} unoptimized={build.icon.endsWith('.svg')} className="h-10 w-10 flex-shrink-0 rounded-xl" />
            <span className="min-w-0">
              <span className="flex items-center gap-1 font-semibold text-slate-100 group-hover:text-sky-300">
                {build.name}
                <FiArrowUpRight className="h-4 w-4 opacity-60" aria-hidden="true" />
                <span className="sr-only"> on n8builds.dev (opens in a new tab)</span>
              </span>
              <span className="mt-0.5 block text-xs font-semibold uppercase tracking-wider text-sky-400/80">{build.kind}</span>
              <span className="mt-1.5 block text-sm leading-snug text-slate-400">{build.tagline}</span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  )
}
