'use client'

import Link from 'next/link'
import { FloatingNav } from '@/components/layout/FloatingNav'
import Footer from '@/components/layout/Footer'
import { BentoGrid, BentoGridItem } from '@/components/ui/BentoGrid'
import BoldMap from '@/components/ui/BoldMap/BoldMap'
import type { Visitor } from '@/components/ui/BoldMap/geo'
import { formatMiles, NEAR_LA_MILES } from '@/components/ui/BoldMap/text'
import { relocateCard } from '@/data/grid/items/gridItem2'
import { subpageNavItems } from '@/data/navigation'

/** Places to try the line from, as `?from=`. */
const TRY = ['Seattle', 'Denver', 'Austin', 'Chicago', 'Miami', 'New York', 'Los Angeles', 'London']

function describe(visitor: Visitor | null, source: 'query' | 'request') {
  const from = source === 'query' ? 'From ?from=' : 'From your connection (Cloudflare)'
  if (!visitor) {
    return source === 'query'
      ? `${from}: outside the lower 48 or not a known place, so no line to you.`
      : `${from}: nothing known here (no Cloudflare data on a local server, or a visitor outside the lower 48), so no line to you.`
  }
  const near = visitor.near ? `near ${visitor.near}` : `at ${visitor.at[1]}, ${visitor.at[0]}`
  if (visitor.kind === 'here')
    return `${from}: ${near}, in the Los Angeles area (within ${NEAR_LA_MILES} miles), so no line: the Los Angeles chip greets you.`
  return `${from}: ${near}, ${formatMiles(visitor.mi)} miles from Los Angeles.`
}

/**
 * /lab/map: a test bed for the home page's bold map (owner, 2026-11-24; on the
 * home page since 2026-11-25). It takes the visitor from `?from=` (or the
 * request), so the line to the visitor can be seen on a local server, which has
 * no Cloudflare location. The card at its home size, then larger.
 * Hidden: not in the nav or the sitemap, and noindex.
 */
export default function MapLab({
  visitor,
  source,
}: {
  visitor: Visitor | null
  source: 'query' | 'request'
}) {
  const card = relocateCard(() => <BoldMap visitor={visitor} />)
  return (
    <>
      <FloatingNav navItems={subpageNavItems} />
      <main
        id="main-content"
        tabIndex={-1}
        className="relative w-full overflow-hidden bg-darkBlue text-slate-200 focus:outline-hidden"
      >
        <div className="mx-auto max-w-md px-4 pt-28 sm:max-w-lg md:max-w-3xl md:pt-36 lg:max-w-4xl xl:max-w-6xl 2xl:max-w-7xl">
          <p className="text-xs font-semibold tracking-[0.2em] text-sky-400 uppercase">Lab</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-50 sm:text-5xl">
            The bold map
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-400 md:text-lg/7">
            The home page&rsquo;s &ldquo;Ready to relocate&rdquo; map, with the line to you from any
            place you pick. Point at the map (or rest a finger on it) to see a place and its
            distance from Los Angeles.
          </p>
          <p data-visitor-source className="mt-4 max-w-2xl text-sm text-slate-300">
            {describe(visitor, source)}
          </p>
          <p className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-400">
            <span>Try it from:</span>
            {TRY.map((place) => (
              <Link
                key={place}
                href={`/lab/map?from=${encodeURIComponent(place)}`}
                className="rounded-full border border-white/15 px-2.5 py-1 text-slate-200 hover:border-sky-300/50 hover:text-white"
              >
                {place}
              </Link>
            ))}
            <Link
              href="/lab/map?from=40.7,-74"
              className="rounded-full border border-white/15 px-2.5 py-1 font-mono text-slate-200 hover:border-sky-300/50 hover:text-white"
            >
              40.7,-74
            </Link>
            <Link
              href="/lab/map"
              className="rounded-full border border-white/15 px-2.5 py-1 text-slate-200 hover:border-sky-300/50 hover:text-white"
            >
              Your connection
            </Link>
          </p>
        </div>

        <section aria-labelledby="card-size" className="mt-12">
          <h2
            id="card-size"
            className="mx-auto mb-4 max-w-md px-4 text-xl font-bold text-slate-50 sm:max-w-lg md:max-w-3xl lg:max-w-4xl xl:max-w-6xl 2xl:max-w-7xl"
          >
            At the home card&rsquo;s size
          </h2>
          {/* The home page's grid and the card's own place in it, so the map is
              exactly the size it is on the home page. */}
          <BentoGrid>
            <BentoGridItem {...card} />
          </BentoGrid>
        </section>

        <section
          aria-labelledby="larger"
          className="mx-auto mt-16 mb-24 max-w-md px-4 sm:max-w-lg md:max-w-3xl lg:max-w-4xl xl:max-w-6xl 2xl:max-w-7xl"
        >
          <h2 id="larger" className="mb-4 text-xl font-bold text-slate-50">
            Larger
          </h2>
          <div className="h-[28rem] md:h-[34rem] xl:h-[42rem]">
            <BentoGridItem {...card} gridItemContainer="@container" />
          </div>
          <p className="mt-6 max-w-2xl text-sm text-slate-400">
            The line to you uses the approximate city Cloudflare works out from your connection,
            rounded to about 35 miles. It is not stored.
          </p>
        </section>
      </main>
      <Footer />
    </>
  )
}
