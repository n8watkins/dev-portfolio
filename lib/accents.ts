import type { Project } from '@/lib/types'

/**
 * Each project's own brand colour, as on n8builds.dev's Lab rows: its row's
 * glow (`rgb`, read by `.lab-row-wash` in globals.css), the screenshot's
 * outline, the feature checks and the main button. Taken from each app:
 * Echo's teal orb, Scout's violet-to-fuchsia icon, GeminiGPT's blue and
 * Net-Trailer's Netflix red. Every button pairing passes WCAG AA.
 */
export const accents: Record<
  Project['accent'],
  {
    rgb: string
    check: string
    outline: string
    /** The screenshot's glow on hover, in the project's colour. */
    shadow: string
    /** The active screenshot dot. */
    dot: string
    primary: string
    subtitle: string
  }
> = {
  echo: {
    rgb: '45 212 191',
    check: 'text-teal-400',
    outline: 'border-teal-400/25 group-hover:border-teal-300/50',
    shadow: 'group-hover:shadow-[0_18px_50px_-18px_rgba(45,212,191,0.55)]',
    dot: 'bg-teal-300',
    primary: 'bg-teal-400 text-slate-950 hover:bg-teal-300',
    subtitle: 'text-teal-300',
  },
  scout: {
    rgb: '192 132 252',
    check: 'text-fuchsia-400',
    outline: 'border-fuchsia-400/25 group-hover:border-fuchsia-300/50',
    shadow: 'group-hover:shadow-[0_18px_50px_-18px_rgba(192,132,252,0.55)]',
    dot: 'bg-fuchsia-400',
    primary:
      'bg-gradient-to-r from-violet-600 to-fuchsia-700 text-white hover:from-violet-700 hover:to-fuchsia-800',
    subtitle: 'text-fuchsia-300',
  },
  geminigpt: {
    rgb: '59 130 246',
    check: 'text-blue-400',
    outline: 'border-blue-400/25 group-hover:border-blue-300/50',
    shadow: 'group-hover:shadow-[0_18px_50px_-18px_rgba(59,130,246,0.6)]',
    dot: 'bg-blue-500',
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    subtitle: 'text-blue-300',
  },
  'net-trailer': {
    rgb: '229 9 20',
    check: 'text-red-500',
    outline: 'border-red-500/25 group-hover:border-red-400/50',
    shadow: 'group-hover:shadow-[0_18px_50px_-18px_rgba(229,9,20,0.55)]',
    dot: 'bg-red-500',
    primary: 'bg-red-600 text-white hover:bg-red-700',
    subtitle: 'text-red-400',
  },
}
