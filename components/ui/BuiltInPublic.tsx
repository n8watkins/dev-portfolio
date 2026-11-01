import SiteIcon from '@/components/ui/SiteIcon'
import { N8BUILDS } from '@/lib/sites'

/**
 * The footers' sign-off, "Built in public at n8builds.dev" with its n8 mark,
 * as a quiet pill: where this site (and everything else I make) is built.
 */
export default function BuiltInPublic({ className = '' }: { className?: string }) {
  return (
    <a
      href={N8BUILDS.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/3 py-1 pr-3.5 pl-1 text-xs text-slate-400 transition-colors duration-200 hover:border-sky-400/30 hover:bg-white/6 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-400 ${className}`}
    >
      <SiteIcon site="n8builds" className="h-5 w-5" rounded="rounded-full" />
      <span>
        Built in public at{' '}
        <span className="font-semibold text-slate-200 transition-colors duration-200 group-hover:text-sky-300">
          {N8BUILDS.name}
        </span>
      </span>
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  )
}
