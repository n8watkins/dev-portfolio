'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { motion } from 'motion/react'
import { FiChevronDown, FiExternalLink } from 'react-icons/fi'
import { workExperience, type WorkExperienceItem } from '@/data/experience'
import SectionHeading from '@/components/ui/SectionHeading'
import { staggerItemVariants } from '@/lib/animations'

/** A site I built in the role: a small preview card, the whole card a link to it. */
const SiteCard = ({ site }: { site: NonNullable<WorkExperienceItem['sites']>[number] }) => (
  <a
    href={site.url}
    target="_blank"
    rel="noopener noreferrer"
    className="group/site flex flex-col overflow-hidden rounded-xl border border-white/10 bg-[#0a1322] shadow-md shadow-black/40 transition-colors duration-200 hover:border-sky-400/50 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-400"
  >
    <span className="relative block aspect-16/9 overflow-hidden">
      <Image
        src={site.shot}
        alt=""
        fill
        sizes="(max-width: 640px) 90vw, 14rem"
        // Top left: a 16:9 shot keeps its logo when the frame trims it.
        className="object-cover object-left-top transition-transform duration-500 group-hover/site:scale-[1.03]"
      />
    </span>
    <span className="flex items-center justify-between gap-2 px-3 py-2 text-sm font-semibold text-slate-200 transition-colors group-hover/site:text-sky-300">
      <span className="truncate">{site.label}</span>
      <FiExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span className="sr-only"> (opens in a new tab)</span>
    </span>
  </a>
)

/** A role's bullets, then the sites I built there as small preview cards. */
const Details = ({ item }: { item: WorkExperienceItem }) => (
  <div className="flex flex-col gap-5">
    <ul className="space-y-2.5">
      {item.bullets.map((bullet, i) => (
        <li
          key={i}
          className="flex items-start gap-3 text-sm leading-relaxed text-slate-400 md:text-base/6"
        >
          <span className="mt-[9px] h-[5px] w-[5px] shrink-0 rounded-full bg-sky-400/60" />
          <span>{bullet}</span>
        </li>
      ))}
    </ul>
    {item.sites && (
      <ul aria-label="Sites I built there" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {item.sites.map((site) => (
          <li key={site.url}>
            <SiteCard site={site} />
          </li>
        ))}
      </ul>
    )}
  </div>
)

/**
 * Experience as a compact timeline (owner, 2026-11-08): each role's title,
 * company and years; clicking anywhere on a role (or Enter or Space on it)
 * opens what I did in place, and "Expand all" opens every role. Only Tech for Pros links out
 * from its name; an open role shows the sites I built there as preview cards.
 */
const Experience = () => {
  const [open, setOpen] = useState<Set<number>>(() => new Set())
  const allOpen = open.size === workExperience.length
  const toggle = (id: number) =>
    setOpen((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  return (
    <div className="relative m-auto pt-0 pb-12 select-none md:pt-8 md:pb-20 xl:max-w-6xl 2xl:max-w-7xl">
      <div className="flex items-end justify-between gap-4 px-2 pt-6 pb-6 md:px-4">
        <SectionHeading eyebrow="Experience" title="Where I've built" />
        <button
          type="button"
          onClick={() => setOpen(allOpen ? new Set() : new Set(workExperience.map((w) => w.id)))}
          aria-expanded={allOpen}
          className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl border border-white/12 bg-white/4 px-3 py-2 text-sm font-semibold text-slate-200 transition-colors hover:border-sky-400/50 hover:bg-white/8 hover:text-sky-200 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-400"
        >
          {allOpen ? 'Collapse all' : 'Expand all'}
          <FiChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${allOpen ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </button>
      </div>

      <div className="relative mt-2 px-2 md:px-4">
        {/* Vertical timeline line */}
        <div className="absolute top-2 bottom-4 left-[9px] w-px bg-linear-to-b from-sky-500 via-sky-400/40 to-transparent md:left-[11px]" />

        <div className="space-y-4">
          {workExperience.map((item, index) => {
            const showDivider =
              item.additional && workExperience[index - 1] && !workExperience[index - 1].additional
            const isOpen = open.has(item.id)
            const image = item.image
            return (
              <React.Fragment key={item.id}>
                {showDivider && (
                  <div className="relative pt-2 pl-10 md:pl-12">
                    <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase">
                      Additional Experience
                    </p>
                  </div>
                )}
                <motion.div
                  variants={staggerItemVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2 }}
                  className="group/exp relative pl-10 md:pl-12"
                >
                  <div className="absolute top-[14px] left-0 h-[19px] w-[19px] rounded-full border-[3px] border-slate-900 bg-sky-500 shadow-lg shadow-sky-500/40" />
                  {/* The whole role header is one button (stretched over it): click
                      or press Enter or Space anywhere on it to open what I did.
                      Tech for Pros' link sits above that layer, so it still opens
                      the site. */}
                  <div
                    className={`group/card relative overflow-hidden rounded-xl border bg-slate-900 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.3)] transition-colors duration-200 has-[[data-role-toggle]:hover]:border-sky-400/40 has-[[data-role-toggle]:hover]:bg-slate-800/80 has-[[data-role-toggle]:focus-visible]:ring-2 has-[[data-role-toggle]:focus-visible]:ring-sky-400 ${isOpen ? 'border-sky-500/30' : 'border-white/5'}`}
                  >
                    {/* The role's own picture on the right (desktop), faded into the row:
                        a glimpse on hover, and it stays, a little quieter, while the role
                        is open (owner, round 4 of 2026-11-09), across the whole card. */}
                    {image && (
                      <div
                        aria-hidden="true"
                        className={`pointer-events-none absolute inset-y-0 right-0 hidden w-[26%] overflow-hidden mask-[linear-gradient(to_left,black_45%,transparent)] transition-opacity duration-500 md:block ${isOpen ? 'opacity-50' : 'opacity-0 group-has-[[data-role-toggle]:hover]/card:opacity-80'}`}
                        data-role-image
                      >
                        <Image
                          src={image.src}
                          alt=""
                          fill
                          sizes="22vw"
                          className="object-cover object-left-top transition-transform duration-700 group-has-[[data-role-toggle]:hover]/card:scale-105"
                        />
                        <div className="absolute inset-0 bg-darkBlue/40" />
                      </div>
                    )}
                    <div className="group/role relative p-4 md:p-5">
                      <button
                        type="button"
                        data-role-toggle
                        onClick={() => toggle(item.id)}
                        aria-expanded={isOpen}
                        aria-controls={`role-${item.id}`}
                        className="absolute inset-0 z-10 cursor-pointer rounded-xl focus:outline-hidden"
                      >
                        <span className="sr-only">
                          {item.role}, {item.company}: {isOpen ? 'hide' : 'show'} what I did
                        </span>
                      </button>
                      <div className={`relative ${image ? 'md:max-w-[72%]' : ''}`}>
                        <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="rounded-full border border-sky-500/20 bg-sky-500/10 px-2.5 py-0.5 text-xs font-semibold tracking-wider text-sky-400 uppercase">
                            {item.period}
                          </span>
                          <span className="text-xs text-slate-400">{item.location}</span>
                        </div>
                        <h3 className="text-xl leading-snug font-bold text-slate-100 md:text-2xl/8">
                          {item.role}
                        </h3>
                        <p className="mt-0.5 text-base font-semibold text-sky-400">
                          {item.companyUrl ? (
                            <a
                              href={item.companyUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="relative z-20 inline-flex items-center gap-1.5 rounded transition-colors hover:text-sky-300 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-400"
                            >
                              {item.company}
                              <FiExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                              <span className="sr-only"> (opens in a new tab)</span>
                            </a>
                          ) : (
                            item.company
                          )}
                        </p>
                        {/* "What I did", on the left as before */}
                        <span
                          aria-hidden="true"
                          className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-300 transition-colors group-has-[[data-role-toggle]:hover]/role:text-sky-300"
                        >
                          What I did
                          <FiChevronDown
                            className={`h-4 w-4 transition-transform duration-300 motion-reduce:transition-none ${isOpen ? 'rotate-180' : ''}`}
                          />
                        </span>
                      </div>
                    </div>
                    {/* Opens smoothly: its row eases from 0fr to 1fr while it fades in
                        (instant under reduced motion); closed, it is hidden and inert. */}
                    <div
                      id={`role-${item.id}`}
                      inert={!isOpen}
                      className={`grid transition-[grid-template-rows,opacity,visibility] duration-[350ms] ease-out motion-reduce:transition-none ${isOpen ? 'visible grid-rows-[1fr] opacity-100' : 'invisible grid-rows-[0fr] opacity-0'}`}
                    >
                      <div className="min-h-0 overflow-hidden">
                        <div
                          className={`relative px-4 pb-5 md:px-5 ${image ? 'md:max-w-[74%]' : ''}`}
                        >
                          <Details item={item} />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </React.Fragment>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Experience
