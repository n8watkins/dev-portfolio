'use client'
import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { FiArrowRight } from 'react-icons/fi'
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

const Grid = () => {
  return (
    <section className="mb-10">
      {/* About intro - the copy beside the portrait, above the bento grid and aligned with it */}
      <div className="max-w-md sm:max-w-lg md:max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto px-4 pt-6 md:pt-2 pb-14">
        <SectionHeading eyebrow="Get to know me" title="About me" />
        {/* The copy and the portrait fade in together once you start scrolling
            (only the heading peeks in on the first screen); the portrait sits
            centred against the copy beside it. */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.5 }}
          className="mt-4 flex flex-col-reverse gap-8 md:flex-row md:items-center md:gap-12"
        >
          <div className="max-w-3xl space-y-4 text-pretty text-base leading-relaxed text-slate-300 md:flex-1 md:text-lg/7">
            <p>
              I&apos;m Nathan, a full-stack developer in Los Angeles, and I&apos;m all in on AI.
              Building things people actually find useful has always mattered most to me, and
              getting to do so much more of it with AI feels like a blessing.
            </p>
            <p>
              These days I consult on AI and build{' '}
              <Out href={TECH_FOR_PROS.url}>{TECH_FOR_PROS.name}</Out>, a platform for service
              businesses: pool, HVAC, landscaping and the like. It turns a few details about a
              business into a launch-ready website, then takes the follow-up off their plate: lead
              capture, reviews, reminders and missed-call text-back. Before that I spent three years
              building client apps at a consulting firm.
            </p>
            <p>
              In my free time I build in public on{' '}
              <Out href="https://n8builds.dev">n8builds.dev</Out>. That&apos;s where the tools I use
              daily live: Scribe, my local dictation app for Windows, and OpenPing, my uptime
              monitor, plus Solara and a few Chrome extensions, all free and open source. Next up:
              streaming the builds live.
            </p>
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
          <figure className="relative mx-auto w-48 shrink-0 sm:w-56 md:mx-0 md:w-64">
            <div className="absolute inset-0 rounded-3xl bg-linear-to-br from-cyan-500/25 to-blue-600/25 blur-xl scale-105" />
            <div className="relative aspect-4/5 overflow-hidden rounded-3xl ring-1 ring-white/10 shadow-xl shadow-black/40">
              <Image
                src="/hero/portrait-watercolor.jpg"
                alt="Watercolor portrait of Nathan"
                fill
                sizes="(max-width: 640px) 12rem, (max-width: 768px) 14rem, 16rem"
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
