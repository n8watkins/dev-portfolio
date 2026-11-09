import type { Project } from '@/lib/types'

/**
 * Each project's own brand colour, as on n8builds.dev's Lab rows: its row's
 * glow (`rgb`, read by `.lab-row-wash` in globals.css), the screenshot's
 * outline, the feature checks and the main button. Taken from each app:
 * Net-Trailer's Netflix red and Portfolio Rank's gold (#fbbf24, its "Rank"). Every button pairing passes WCAG AA.
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
  'net-trailer': {
    rgb: '229 9 20',
    check: 'text-red-500',
    outline: 'border-red-500/25 group-hover:border-red-400/50',
    shadow: 'group-hover:shadow-[0_10px_30px_-16px_rgba(229,9,20,0.4)]',
    dot: 'bg-red-500',
    primary: 'bg-red-600 text-white hover:bg-red-700',
    subtitle: 'text-red-400',
  },
  'portfolio-rank': {
    rgb: '251 191 36',
    check: 'text-amber-400',
    outline: 'border-amber-400/25 group-hover:border-amber-300/50',
    shadow: 'group-hover:shadow-[0_10px_30px_-16px_rgba(251,191,36,0.4)]',
    dot: 'bg-amber-400',
    primary: 'bg-amber-400 text-slate-950 hover:bg-amber-300',
    subtitle: 'text-amber-300',
  },
}
