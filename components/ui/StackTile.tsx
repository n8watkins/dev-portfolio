'use client'

import React, { ReactElement, useContext } from 'react'
import { MarqueeCopyContext } from '@/components/magicui/marquee'
import { cn } from '@/lib/utils'

// A tech-stack tile for the marquees: icon + name, with the description
// revealed on hover, or on focus (keyboard, or a tap on touch screens, where
// Tailwind 4 doesn't apply hover: styles).
//
// The name and description are one block, centred in the tile by flexbox. At
// rest the description's row is collapsed (grid-template-rows: 0fr), so the
// name sits alone in the middle; revealing it opens the row to its natural
// height (1fr) while the name shrinks, and the block stays centred whatever
// the description's length.
export default function StackTile({
  name,
  icon,
  description,
  iconClassName,
}: {
  name: string
  icon?: string | ReactElement
  description: string
  iconClassName?: string
}) {
  // Duplicate marquee copies stay tappable but out of the tab order.
  const isCopy = useContext(MarqueeCopyContext)
  return (
    <figure
      tabIndex={isCopy ? -1 : 0}
      className={cn(
        'group/tile relative flex h-28 w-52 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl border px-2',
        'border-white/8 bg-white/4 transition-all duration-300 ease-in-out outline-none',
        'focus-visible:ring-2 focus-visible:ring-cyan-400',
        'hover:border-cyan-400/30 hover:bg-white/8 hover:shadow-lg hover:shadow-cyan-500/5',
        'focus:border-cyan-400/30 focus:bg-white/8 focus:shadow-lg focus:shadow-cyan-500/5'
      )}
    >
      <figcaption className="flex w-48 flex-col items-center font-medium text-white">
        <div className="flex items-center gap-2 text-xl transition-[font-size,line-height] duration-300 ease-in-out group-hover/tile:text-base group-focus/tile:text-base">
          <span
            className={cn(
              'flex size-7 shrink-0 items-center justify-center transition-[width,height] duration-300 ease-in-out *:size-full! group-hover/tile:size-5 group-focus/tile:size-5',
              iconClassName
            )}
          >
            {icon}
          </span>
          <span data-tile-name className="whitespace-nowrap">
            {name}
          </span>
        </div>
        <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-in-out group-hover/tile:grid-rows-[1fr] group-focus/tile:grid-rows-[1fr]">
          <div className="overflow-hidden">
            <p className="description pt-1 text-center text-sm leading-[1.125rem] text-[#9cadc5] opacity-0 transition-opacity duration-300 ease-in-out group-hover/tile:opacity-100 group-focus/tile:opacity-100">
              {description}
            </p>
          </div>
        </div>
      </figcaption>
    </figure>
  )
}
