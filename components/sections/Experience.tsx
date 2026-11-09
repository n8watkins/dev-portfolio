'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { motion } from 'motion/react'
import { FiChevronDown, FiExternalLink } from 'react-icons/fi'
import { workExperience, type WorkExperienceItem } from '@/data/experience'
import SectionHeading from '@/components/ui/SectionHeading'
import { staggerItemVariants } from '@/lib/animations'

/** A role's bullets, and small screenshots of the work when it has them. */
const Details = ({ item }: { item: WorkExperienceItem }) => (
  <div className="flex flex-col gap-5 md:flex-row md:items-start md:gap-6">
    <ul className="flex-1 space-y-2.5">
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
    {item.visuals && (
      <div className="grid grid-cols-2 gap-2.5 md:w-52 md:shrink-0 md:grid-cols-1">
        {item.visuals.map((v) => (
          <div
            key={v.src}
            className="relative aspect-16/10 overflow-hidden rounded-lg border border-white/10 bg-[#0a1322] shadow-md shadow-black/40"
          >
            <Image
              src={v.src}
              alt={v.alt}
              fill
              sizes="(max-width: 768px) 45vw, 13rem"
              // Top left: a 16:9 shot keeps its logo when the frame trims it.
              className="object-cover object-left-top"
            />
          </div>
        ))}
      </div>
    )}
  </div>
)

/**
 * Experience as a compact timeline (owner, 2026-11-08): each role's title,
 * company and years; clicking anywhere on a role (or Enter or Space on it)
 * opens what I did in place, and "Expand all" opens every role. Only Tech for Pros links out; the other
 * companies are plain text, and no client sites are linked.
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
            const preview = item.visuals?.[0]
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
                    className={`relative overflow-hidden rounded-xl border bg-slate-900 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.3)] transition-colors duration-200 has-[[data-role-toggle]:hover]:border-sky-400/40 has-[[data-role-toggle]:hover]:bg-slate-800/80 has-[[data-role-toggle]:focus-visible]:ring-2 has-[[data-role-toggle]:focus-visible]:ring-sky-400 ${isOpen ? 'border-sky-500/30' : 'border-white/5'}`}
                  >
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
                      {/* On hover (desktop), a glimpse of the work fades in from the
                          right, as before but smaller; it steps aside once the role is
                          open and its screenshots show below. */}
                      {preview && (
                        <div
                          aria-hidden="true"
                          className={`pointer-events-none absolute inset-y-0 right-0 hidden w-[24%] overflow-hidden mask-[linear-gradient(to_left,black_45%,transparent)] opacity-0 transition-opacity duration-500 md:block ${isOpen ? '' : 'group-has-[[data-role-toggle]:hover]/role:opacity-80'}`}
                        >
                          <Image
                            src={preview.src}
                            alt=""
                            fill
                            sizes="20vw"
                            className="object-cover object-left-top transition-transform duration-700 group-has-[[data-role-toggle]:hover]/role:scale-105"
                          />
                          <div className="absolute inset-0 bg-darkBlue/40" />
                        </div>
                      )}
                      <div className={`relative ${preview ? 'md:max-w-[72%]' : ''}`}>
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
                        <div className="px-4 pb-5 md:px-5">
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
