'use client'
import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { FiArrowRight } from 'react-icons/fi'
import { Globe, Gauge, GitBranch } from 'lucide-react'
import { motion } from 'motion/react'
import { BentoGrid, BentoGridItem } from '@/components/ui/BentoGrid'
import { gridItems } from '@/data/grid'
import { staggerContainerVariants, defaultAnimationConfig } from '@/lib/animations'
import SectionHeading from '@/components/ui/SectionHeading'
import { TECH_FOR_PROS } from '@/lib/sites'

const LINK =
  'font-semibold text-sky-400 underline decoration-sky-400/40 underline-offset-4 hover:text-sky-300 hover:decoration-sky-300 transition-colors duration-200'

/** A link out, in the About copy. */
const Out = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className={LINK}>
    {children}
  </a>
)

/** Proof numbers under the intro, as chips; they say what the paragraph beside them does not. */
const FACTS = [
  { icon: Globe, text: '75+ client sites shipped end to end' },
  { icon: Gauge, text: 'Lighthouse 90+ on client sites' },
  { icon: GitBranch, text: '30+ open source projects' },
]

const Grid = () => {
  return (
    <section className="mb-10">
      {/* About intro - the copy beside the portrait, above the bento grid and aligned with it */}
      <div className="max-w-md sm:max-w-lg md:max-w-3xl lg:max-w-4xl xl:max-w-6xl 2xl:max-w-7xl mx-auto px-4 pt-6 md:pt-2 pb-14">
        {/* One compact block: the heading, the copy, the facts and the button in
            one column, the portrait close beside it. It fades in as soon as its
            top edge is on screen, so no empty gap shows before you scroll. */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.05 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col-reverse gap-8 md:flex-row md:items-center md:justify-start md:gap-12"
        >
          <div className="max-w-3xl md:flex-1">
            <SectionHeading eyebrow="Get to know me" title="About me" />
            <div className="mt-4 space-y-5 text-pretty text-base leading-relaxed text-slate-300 md:text-lg/7">
              {/* A short intro (owner, 2026-11-08); the full story is on /about. */}
              <p>
                I&apos;m Nathan, a full-stack developer in Los Angeles, and I&apos;m all in on AI.
                These days I build <Out href={TECH_FOR_PROS.url}>{TECH_FOR_PROS.name}</Out>, a
                platform for service businesses, and consult on AI; before that I spent three years
                building client apps at a consulting firm.
              </p>
              <ul aria-label="Quick facts" className="flex flex-wrap gap-2">
                {FACTS.map(({ icon: Icon, text }) => (
                  <li
                    key={text}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/4 px-3 py-1.5 text-sm text-slate-200"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-sky-400" aria-hidden="true" />
                    {text}
                  </li>
                ))}
              </ul>
              <Link
                href="/about"
                className="group inline-flex items-center gap-2 rounded-xl border border-white/12 bg-white/4 px-4 py-2.5 text-sm font-semibold text-slate-100 transition-colors hover:border-sky-400/50 hover:bg-white/8 hover:text-sky-200 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-400 md:text-base"
              >
                More about me
                <FiArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>
            </div>
          </div>
          <figure className="relative mx-auto w-36 shrink-0 sm:w-40 md:mx-0 md:w-44 lg:w-48">
            <div className="absolute inset-0 rounded-3xl bg-linear-to-br from-cyan-500/25 to-blue-600/25 blur-xl scale-105" />
            <div className="relative aspect-4/5 overflow-hidden rounded-3xl ring-1 ring-white/10 shadow-xl shadow-black/40">
              <Image
                src="/hero/portrait-watercolor.jpg"
                alt="Watercolor portrait of Nathan"
                fill
                sizes="(max-width: 640px) 9rem, (max-width: 768px) 10rem, 12rem"
                className="object-cover object-top"
              />
            </div>
          </figure>
        </motion.div>
      </div>

      <motion.div variants={staggerContainerVariants} {...defaultAnimationConfig}>
        <BentoGrid>
          {gridItems.map((item) => (
            <BentoGridItem key={item.id} {...item} />
          ))}
        </BentoGrid>
      </motion.div>
    </section>
  )
}

export default Grid
