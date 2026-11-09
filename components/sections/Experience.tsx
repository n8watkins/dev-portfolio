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
  <div className="mt-4 flex flex-col gap-5 md:flex-row md:items-start md:gap-6">
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
 * company and years, with what I did folded under "What I did", and "Expand
 * all" to open every role in place. Only Tech for Pros links out; the other
 * companies are plain text, and no client sites are linked.
 */
const Experience = () => {
  const [open, setOpen] = useState<Set<number>>(() => new Set())
  const allOpen = open.size === workExperience.length
  const toggle = (id: number, isOpen: boolean) =>
    setOpen((prev) => {
      const next = new Set(prev)
      if (isOpen) next.add(id)
      else next.delete(id)
      return next.size === prev.size && [...next].every((x) => prev.has(x)) ? prev : next
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
                  <div className="relative overflow-hidden rounded-xl border border-white/5 bg-slate-900 p-4 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.3)] transition-colors duration-300 hover:border-sky-500/30 md:p-5">
                    <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="rounded-full border border-sky-500/20 bg-sky-500/10 px-2.5 py-0.5 text-xs font-semibold tracking-wider text-sky-400 uppercase">
                        {item.period}
                      </span>
                      <span className="text-xs text-slate-400">{item.location}</span>
                    </div>
                    <h3 className="text-xl leading-snug font-bold text-slate-100 md:text-2xl/8">
                      {item.role}
                    </h3>
                    <p className="mt-0.5 mb-3 text-base font-semibold text-sky-400">
                      {item.companyUrl ? (
                        <a
                          href={item.companyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 transition-colors hover:text-sky-300"
                        >
                          {item.company}
                          <FiExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                          <span className="sr-only"> (opens in a new tab)</span>
                        </a>
                      ) : (
                        item.company
                      )}
                    </p>
                    <details
                      open={open.has(item.id)}
                      onToggle={(e) => toggle(item.id, e.currentTarget.open)}
                      className="group/details"
                    >
                      <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 rounded-lg text-sm font-semibold text-slate-300 transition-colors hover:text-sky-300 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-400 [&::-webkit-details-marker]:hidden">
                        What I did
                        <FiChevronDown
                          className="h-4 w-4 transition-transform duration-200 group-open/details:rotate-180"
                          aria-hidden="true"
                        />
                      </summary>
                      <Details item={item} />
                    </details>
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
