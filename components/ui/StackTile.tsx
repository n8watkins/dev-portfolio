'use client'

import React, { ReactElement, useContext } from 'react'
import { MarqueeCopyContext } from '@/components/magicui/marquee'
import { cn } from '@/lib/utils'

/** A tile's link, resolved for the site showing it (data/stack.tsx's stackLinkHref). */
export interface TileLink {
  /** The words in the description that become the link. */
  text: string
  href: string
  /** It leaves the site: it opens in a new tab. */
  external?: boolean
}

/**
 * A tile's description, with the project it names made a link (owner,
 * 2026-11-25). Also /stack's list on the portfolio. `focusable={false}` keeps
 * the link out of the tab order (a marquee's duplicate copies).
 */
export function StackDescription({
  description,
  link,
  focusable = true,
  className,
}: {
  description: string
  link?: TileLink
  focusable?: boolean
  className?: string
}) {
  const at = link ? description.indexOf(link.text) : -1
  if (!link || at < 0) return <>{description}</>
  return (
    <>
      {description.slice(0, at)}
      <a
        href={link.href}
        tabIndex={focusable ? undefined : -1}
        {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        className={cn(
          'rounded-sm font-semibold text-cyan-200 underline decoration-cyan-200/40 underline-offset-2 outline-none',
          'hover:decoration-cyan-200 focus-visible:bg-cyan-400/20 focus-visible:decoration-cyan-200',
          className
        )}
      >
        {link.text}
        {link.external && <span className="sr-only"> (opens in a new tab)</span>}
      </a>
      {description.slice(at + link.text.length)}
    </>
  )
}

// A tech-stack tile for the marquees: icon + name, with the description
// revealed on hover, or on focus (keyboard, or a tap on touch screens, where
// Tailwind 4 doesn't apply hover: styles).
//
// The name and description are one block, centred in the tile by flexbox. At
// rest the description's row is collapsed (grid-template-rows: 0fr), so the
// name sits alone in the middle; revealing it opens the row to its natural
// height (1fr) while the name shrinks, and the block stays centred whatever
// the description's length.
//
// A description that names a project links to it (`link`). The link is the
// tile's second tab stop: tabbing on from the tile reaches it, and the
// description stays open while focus is anywhere in the tile (focus-within).
// At rest the collapsed row has no height, so a tap can't hit the hidden link:
// the first tap opens the description, a second on the link follows it.
//
// Focusing (or tapping) a tile pauses its row (WCAG 2.2.2), which the dino
// game uses too. A mouse click on the tile does nothing: the marquee keeps it
// from focusing the tile, so only hovering pauses the row.
export default function StackTile({
  name,
  icon,
  description,
  link,
  iconClassName,
}: {
  name: string
  icon?: string | ReactElement
  description: string
  link?: TileLink
  iconClassName?: string
}) {
  // Duplicate marquee copies stay tappable but out of the tab order.
  const isCopy = useContext(MarqueeCopyContext)
  return (
    <figure
      tabIndex={isCopy ? -1 : 0}
      className={cn(
        'group/tile relative flex h-28 w-52 shrink-0 items-center justify-center overflow-hidden rounded-xl border px-2',
        'border-white/8 bg-white/4 transition-all duration-300 ease-in-out outline-none',
        'focus-visible:ring-2 focus-visible:ring-cyan-400',
        'hover:border-cyan-400/30 hover:bg-white/8 hover:shadow-lg hover:shadow-cyan-500/5',
        'focus-within:border-cyan-400/30 focus-within:bg-white/8 focus-within:shadow-lg focus-within:shadow-cyan-500/5'
      )}
    >
      <figcaption className="flex w-48 flex-col items-center font-medium text-white">
        <div className="flex items-center gap-2 text-xl transition-[font-size,line-height] duration-300 ease-in-out group-hover/tile:text-base group-focus-within/tile:text-base">
          {/* The name says it: the mark is for the eye only. (The AI kit renders its tiles on the
              server, outside the app's IconContext that hides react-icons from assistive tech.) */}
          <span
            aria-hidden="true"
            className={cn(
              'flex size-7 shrink-0 items-center justify-center transition-[width,height] duration-300 ease-in-out *:size-full! group-hover/tile:size-5 group-focus-within/tile:size-5',
              iconClassName
            )}
          >
            {icon}
          </span>
          <span data-tile-name className="whitespace-nowrap">
            {name}
          </span>
        </div>
        <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-in-out group-hover/tile:grid-rows-[1fr] group-focus-within/tile:grid-rows-[1fr]">
          <div className="overflow-hidden">
            <p className="description pt-1 text-center text-sm leading-[1.125rem] text-[#9cadc5] opacity-0 transition-opacity duration-300 ease-in-out group-hover/tile:opacity-100 group-focus-within/tile:opacity-100">
              <StackDescription description={description} link={link} focusable={!isCopy} />
            </p>
          </div>
        </div>
      </figcaption>
    </figure>
  )
}
