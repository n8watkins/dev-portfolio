import React from 'react'
import { cn } from '@/lib/utils'
import Marquee, { MarqueeCopyContext } from '@/components/magicui/marquee'
import DinoEasterEgg from '@/components/features/dino/DinoEasterEgg'
import { tech_libraries, tech_tools } from '@/data/techStack'
import { ReactElement, useContext } from 'react'

/**
 * A tech tile, after n8builds.dev's AI kit tiles (components/ui/StackTile.tsx
 * there): the brand mark and name centred, the description revealed on hover
 * or focus (a tap on touch screens). The name and description are one block,
 * centred by flexbox; at rest the description's row is collapsed (0fr), so the
 * name sits alone in the middle, and revealing it opens the row while the name
 * shrinks, the block staying centred whatever the description's length.
 */
const StackContainer = ({
  name,
  icon,
  description,
}: {
  name: string
  icon?: string | ReactElement
  description: string
}) => {
  // Duplicate marquee copies stay tappable but out of the tab order.
  const isCopy = useContext(MarqueeCopyContext)
  return (
    <figure
      tabIndex={isCopy ? -1 : 0}
      className={cn(
        'group/tile relative flex h-24 sm:h-28 w-52 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl border px-2',
        'border-white/[0.08] bg-white/[0.04] transition-all duration-300 ease-in-out outline-none',
        'focus-visible:ring-2 focus-visible:ring-cyan-400',
        'hover:border-cyan-400/30 hover:bg-white/[0.08] hover:shadow-lg hover:shadow-cyan-500/5',
        'focus:border-cyan-400/30 focus:bg-white/[0.08] focus:shadow-lg focus:shadow-cyan-500/5'
      )}
    >
      <figcaption className="flex w-48 flex-col items-center font-medium text-white">
        <div className="flex items-center gap-2 text-xl transition-[font-size,line-height] duration-300 ease-in-out group-hover/tile:text-base group-focus/tile:text-base">
          <span className="flex size-7 shrink-0 items-center justify-center transition-[width,height] duration-300 ease-in-out [&>*]:!h-full [&>*]:!w-full group-hover/tile:size-5 group-focus/tile:size-5">
            {icon}
          </span>
          <span className="whitespace-nowrap">{name}</span>
        </div>
        <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-in-out group-hover/tile:grid-rows-[1fr] group-focus/tile:grid-rows-[1fr]">
          <div className="overflow-hidden">
            <p className="pt-1 text-center text-sm leading-[1.125rem] text-[#9cadc5] opacity-0 transition-opacity duration-300 ease-in-out group-hover/tile:opacity-100 group-focus/tile:opacity-100">
              {description}
            </p>
          </div>
        </div>
      </figcaption>
    </figure>
  )
}

export function TechStack() {
  return (
    <div
      // The dino walks the rows (components/features/dino, from n8builds.dev's
      // AI kit). While they move, the tiles sit well apart (2.5rem) so the gaps
      // read clearly wider than the dino that hops and falls through them.
      // The rows sit low in the card, so the first row has headroom for the
      // dino walking on top of it.
      data-dino-panel
      className="absolute inset-0 flex w-full flex-col items-center justify-end pb-[6.5rem] motion-safe:gap-2 overflow-hidden rounded-3xl border-none bg-gradient-to-br from-blue-400 via-blue-500 to-blue-400 border dark:from-[#0d304c] dark:to-[#0d304c]"
    >
      <Marquee
        label="Libraries and frameworks"
        reverse
        pauseOnHover
        wrap={false}
        data-marquee-row
        className="[--duration:45s] motion-safe:[--gap:2.5rem]"
      >
        {tech_libraries.map((tech) => (
          <StackContainer
            key={tech.name}
            name={tech.name}
            icon={tech.icon}
            description={tech.description}
          />
        ))}
      </Marquee>
      <Marquee
        label="Tools and services"
        pauseOnHover
        wrap={false}
        data-marquee-row
        className="[--duration:45s] motion-safe:[--gap:2.5rem]"
      >
        {tech_tools.map((tech) => (
          <StackContainer
            key={tech.name}
            name={tech.name}
            icon={tech.icon}
            description={tech.description}
          />
        ))}
      </Marquee>
      <DinoEasterEgg />
      <div className="pointer-events-none absolute left-0 w-1/3 h-full bg-gradient-to-r from-blue-500 to-transparent dark:from-[#0d304c] dark:to-transparent"></div>
      <div className="pointer-events-none absolute right-0 w-1/3 h-full bg-gradient-to-l from-blue-500 to-transparent dark:from-[#0d304c] dark:to-transparent"></div>
    </div>
  )
}
