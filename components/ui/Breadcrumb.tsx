import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

/**
 * "Home / About me" at the top of a subpage (owner, 2026-11-24): Home links
 * back to the home page, the current page is plain text and marked
 * `aria-current="page"`. Server-rendered, no client code.
 */
export default function Breadcrumb({ current, className = '' }: { current: string; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex items-center gap-2 text-sm font-medium text-slate-400">
        <li>
          <Link
            href="/"
            className="rounded-md py-1 transition-colors hover:text-sky-300 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-400"
          >
            Home
          </Link>
        </li>
        <li aria-hidden="true" className="flex items-center text-slate-600">
          <ChevronRight className="h-4 w-4" />
        </li>
        <li aria-current="page" className="text-slate-200">
          {current}
        </li>
      </ol>
    </nav>
  )
}
