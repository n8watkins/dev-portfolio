import Image from 'next/image'
import { N8BUILDS, TECH_FOR_PROS } from '@/lib/sites'

/**
 * A site's mark as a small rounded tile, the same size and shape for both
 * sites: n8builds.dev's n8 comes on its own dark tile; Tech for Pros' worker
 * (drawn for a light page, on a transparent background) sits on a light tile,
 * rising from its bottom edge. Size it with a width and height class.
 * Decorative: the link it sits in names the site.
 */
export default function SiteIcon({
  site,
  className = 'h-9 w-9',
  rounded = 'rounded-lg',
}: {
  site: 'n8builds' | 'techforpros'
  className?: string
  rounded?: string
}) {
  if (site === 'n8builds') {
    return (
      <Image
        src={N8BUILDS.icon}
        alt=""
        width={72}
        height={72}
        className={`shrink-0 object-contain ${rounded} ${className}`}
      />
    )
  }
  return (
    <span
      aria-hidden="true"
      className={`relative block shrink-0 overflow-hidden bg-linear-to-b from-white to-sky-100 ring-1 ring-inset ring-white/60 ${rounded} ${className}`}
    >
      <Image
        src={TECH_FOR_PROS.icon}
        alt=""
        width={72}
        height={72}
        className="absolute inset-x-[8%] bottom-0 h-[88%] w-[84%] object-contain object-bottom"
      />
    </span>
  )
}
