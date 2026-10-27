'use client'
import React from 'react'
import Marquee from '@/components/magicui/marquee'
import StackTile from '@/components/ui/StackTile'
import DinoEasterEgg from '@/components/features/dino/DinoEasterEgg'
import { tech_libraries, tech_tools } from '@/data/techStack'

/**
 * The "My tech stack" bento card's marquee, with the dino easter egg.
 *
 * This is the portfolio's copy of n8builds-web's AI kit
 * (components/features/AITechStack.tsx there): the same structure, and the
 * marquee, tile and dino are byte-identical copies of n8builds-web's files
 * (see "Kept in sync with n8builds-web" in docs/HANDOFF.md and
 * `npm run check:sync`). Only this wrapper differs: the content (the tech
 * stack instead of the AI kit), the bento card's colours, and the rows sitting
 * low in the card (above its title) with headroom for the dino. The tiles are
 * a little shorter here (h-24, not the shared h-28), so
 * the card leaves about twice the room above them: the catch game's
 * scoreboards sit in a band there that the dino never enters. Nothing in the
 * panel can be selected or tap-highlighted.
 *
 * While the rows move, the tiles sit well apart (2.5rem across) so the gaps
 * read clearly wider than the dino that hops and falls through them. Under
 * reduced motion there is no dino and the tiles wrap into a grid the card scrolls.
 */
export function TechStack() {
  return (
    <div
      data-dino-panel
      className="absolute inset-0 flex w-full flex-col items-center justify-end overflow-hidden rounded-3xl bg-gradient-to-br from-[#0d304c] to-[#0d304c] pb-[4.5rem] select-none [-webkit-tap-highlight-color:transparent] sm:pb-[6rem] motion-safe:gap-5 motion-reduce:justify-start motion-reduce:overflow-y-auto motion-safe:[&_figure]:h-24"
    >
      <Marquee
        label="Libraries and frameworks"
        reverse
        pauseOnHover
        data-marquee-row
        className="[--duration:45s] motion-safe:[--gap:2.5rem]"
      >
        {tech_libraries.map((tech) => (
          <StackTile
            key={tech.name}
            name={tech.name}
            icon={tech.icon}
            description={tech.description}
            still
          />
        ))}
      </Marquee>
      <Marquee
        label="Tools and services"
        pauseOnHover
        data-marquee-row
        className="[--duration:45s] motion-safe:[--gap:2.5rem]"
      >
        {tech_tools.map((tech) => (
          <StackTile
            key={tech.name}
            name={tech.name}
            icon={tech.icon}
            description={tech.description}
            still
          />
        ))}
      </Marquee>
      <DinoEasterEgg />
      <div className="pointer-events-none absolute left-0 h-full w-1/4 bg-gradient-to-r from-[#0d304c] to-transparent motion-reduce:hidden" />
      <div className="pointer-events-none absolute right-0 h-full w-1/4 bg-gradient-to-l from-[#0d304c] to-transparent motion-reduce:hidden" />
    </div>
  )
}

export default TechStack
