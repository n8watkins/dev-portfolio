'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { FiArrowUpRight } from 'react-icons/fi'
import { workExperience } from '@/data/experience'
import SectionHeading from '@/components/ui/SectionHeading'
import {
  staggerContainerVariants,
  staggerItemVariants,
  defaultAnimationConfig,
} from '@/lib/animations'

const Experience = () => {
  return (
    <div className="relative pt-8 pb-20 xl:max-w-6xl 2xl:max-w-7xl m-auto select-none">
      <SectionHeading
        eyebrow="Experience"
        title="Where I've built"
        className="px-2 md:px-4 pt-6 pb-6"
      />

      <motion.div
        variants={staggerContainerVariants}
        {...defaultAnimationConfig}
        className="relative mt-4 px-2 md:px-4"
      >
        {/* Vertical timeline line */}
        <div className="absolute left-[9px] md:left-[11px] top-2 bottom-4 w-px bg-gradient-to-b from-sky-500 via-sky-400/40 to-transparent" />

        <div className="space-y-6">
          {workExperience.map((item, index) => {
            const showDivider =
              item.additional && workExperience[index - 1] && !workExperience[index - 1].additional

            return (
              <React.Fragment key={item.id}>
                {showDivider && (
                  <div className="relative pl-10 md:pl-12 pt-2">
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                      Additional Experience
                    </p>
                  </div>
                )}

                <motion.div
                  variants={staggerItemVariants}
                  className="group/exp relative pl-10 md:pl-12"
                >
                  {/* Timeline dot */}
                  <div className="absolute left-0 top-[14px] w-[19px] h-[19px] rounded-full bg-sky-500 border-[3px] border-slate-900 shadow-lg shadow-sky-500/40" />

                  {/* Card */}
                  {/* On hover, a glow wraps the card: a light blue around the text side
                      and, around the image side, the image's own colours (item.hoverGlow).
                      Blurred layers behind the card, so they show past its edges. */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 left-10 right-0 md:left-12 opacity-0 transition-opacity duration-500 group-hover/exp:opacity-100"
                  >
                    <div className="absolute -inset-y-2 -left-2 w-[60%] rounded-2xl bg-sky-400/[0.14] blur-xl" />
                    <div
                      className={`absolute -inset-y-2 -right-3 w-[48%] rounded-2xl blur-xl ${item.hoverGlow}`}
                    />
                  </div>
                  <div
                    className={`group relative overflow-hidden rounded-xl p-5 md:p-6 bg-slate-900 border border-white/5 shadow-[0_20px_25px_-5px_rgba(0,0,0,0.3)] hover:border-sky-500/30 transition-all duration-300`}
                  >
                    {/* Hover image reveal (desktop only) */}
                    {item.hoverImage && (
                      <div
                        className="absolute inset-y-0 right-0 w-[45%] opacity-0 group-hover:opacity-80 transition-opacity duration-500 pointer-events-none hidden md:block"
                        aria-hidden="true"
                      >
                        <Image
                          src={item.hoverImage}
                          alt=""
                          fill
                          sizes="40vw"
                          className="object-cover object-center [mask-image:linear-gradient(to_left,black_42%,transparent_98%)] scale-105 group-hover:scale-100 transition-transform duration-700"
                        />
                        {/* Fade the left edge into the page background so it doesn't hard-cut */}
                        <div className="absolute inset-0 bg-gradient-to-r from-darkBlue via-darkBlue/15 to-transparent" />
                        {/* Dimmed, so a bright page (Appturnity's) doesn't wash out the card */}
                        <div className="absolute inset-0 bg-darkBlue/45" />
                      </div>
                    )}

                    <div className="relative z-10">
                      {/* Period + location */}
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-2">
                        <span className="text-xs font-semibold tracking-wider uppercase text-sky-400 bg-sky-500/10 px-2.5 py-0.5 rounded-full border border-sky-500/20">
                          {item.period}
                        </span>
                        <span className="text-xs text-slate-400">{item.location}</span>
                      </div>

                      {/* Role */}
                      <h3 className="text-xl md:text-2xl font-bold text-slate-100 leading-snug">
                        {item.role}
                      </h3>

                      {/* Company */}
                      <p className="text-base font-semibold mt-0.5 mb-4">
                        {item.companyUrl ? (
                          <a
                            href={item.companyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sky-400 hover:text-sky-300 transition-colors"
                          >
                            {item.company}
                          </a>
                        ) : (
                          <span className="text-sky-400">{item.company}</span>
                        )}
                      </p>

                      {/* Bullets */}
                      <ul className="space-y-2.5">
                        {item.bullets.map((bullet, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-3 text-sm md:text-base text-slate-400 leading-relaxed"
                          >
                            <span className="mt-[9px] flex-shrink-0 w-[5px] h-[5px] rounded-full bg-sky-400/60" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Related links */}
                      {item.links && item.links.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {item.links.map((link) => (
                            <a
                              key={link.url}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 bg-sky-500/10 px-2.5 py-1 rounded-full border border-sky-500/20 hover:border-sky-500/40 transition-colors"
                            >
                              {link.label}
                              <FiArrowUpRight className="w-3 h-3" />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </React.Fragment>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}

export default Experience
