import Link from 'next/link'
import { FiArrowRight } from 'react-icons/fi'
import { TechStack } from '@/components/features/TechStack'
import type { GridItemConfig } from '@/lib/types/gridItem'

/**
 * Grid Item 3: "My tech stack" - Animated technology showcase
 *
 * VISUAL STRATEGY:
 * - TechStack component in foreground with infinite scroll animation
 * - Gradient overlay at bottom for text readability
 * - Title and description at bottom with hover effect
 */
export const gridItem3: GridItemConfig = {
  id: 3,
  title: 'My tech stack',
  description: 'I constantly try to improve',
  gridItemContainer:
    'col-span-2 row-span-4 md:col-span-2 md:row-span-3 lg:col-span-2 lg:row-span-3 xl:col-span-7 xl:row-span-4',

  imgClassName: '',
  img: '',

  // The title's gradient overlaps the bottom row of tiles; it lets the pointer
  // through, so those tiles can still be hovered or tapped (pausing their row).
  textContainerClassName:
    'pointer-events-none absolute bottom-0 pt-10 h-32 w-full bg-linear-to-t rounded-b-3xl from-blue-500 via-blue-500 to-blue-500/0 dark:from-[#0d304c] dark:via-[#0d304c]/90 dark:to-[#0d304c]/0 z-30 text-slate-200 dark:text-white  ',

  textOrder: 'flex flex-col-reverse xs:pl-10 1sm:pl-5 group-hover:translate-x-2 duration-200',

  titleClassName: ' font-sans font-bold text-2xl lg:text-4xl items-center  select-none ',

  descriptionClass: 'relative text-base w-[50%]  font-bold nowrap whitespace-nowrap select-none ',

  buttonContainer: '',
  buttonClass: '',

  // The dino measures the rows once it loads; a scaling entrance would skew that.
  entrance: 'fade',
  // The card's own link to /stack (owner, 2026-11-08): every tool by layer, and
  // the dino with more room. It sits in the title band's right corner, above
  // the band (which lets the pointer through to the tiles).
  renderForeground: () => (
    <>
      <TechStack />
      <Link
        href="/stack"
        className="absolute right-4 bottom-4 z-[600] inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-[#0d304c]/80 px-3 py-1.5 text-sm font-semibold text-slate-100 backdrop-blur-xs transition-colors hover:border-sky-300/60 hover:text-sky-200 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-400 sm:right-5 sm:bottom-5"
      >
        See my stack
        <FiArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </>
  ),
}
