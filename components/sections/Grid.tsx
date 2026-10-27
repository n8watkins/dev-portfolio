'use client'
import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { BentoGrid, BentoGridItem } from '@/components/ui/BentoGrid'
import { gridItems } from '@/data/grid'
import { staggerContainerVariants, defaultAnimationConfig } from '@/lib/animations'
import SectionHeading from '@/components/ui/SectionHeading'

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
      <div className="max-w-md sm:max-w-lg md:max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto px-4 pt-10 md:pt-24 pb-14">
        <div className="flex flex-col-reverse md:flex-row md:items-start gap-8 md:gap-12">
          <SectionHeading eyebrow="Get to know me" title="About me" className="md:flex-1">
            <div className="space-y-4 text-slate-300">
              <p>
                I&apos;m Nathan, a full-stack developer in Los Angeles who builds with AI. My
                favorite part of building is the moment a rough idea turns into something you can
                actually use.
              </p>
              <p>
                I co-founded <Out href="https://appturnity.com">Appturnity</Out>: we build pool,
                HVAC, landscaping and other local service businesses a modern website and launch it
                for free.
              </p>
              <p>
                The rest I build in public on <Out href="https://n8builds.dev">n8builds.dev</Out>.
                Its Lab has the tools I use every day, Scribe (local dictation for Windows) and
                OpenPing (uptime monitoring that watches the demos on this page), plus Solara,
                Portfolio Rank and a few Chrome extensions. All of them are free and open source.
              </p>
            </div>
          </SectionHeading>
          <motion.figure
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5 }}
            className="relative mx-auto md:mx-0 w-48 sm:w-56 md:w-64 shrink-0 md:mt-10"
          >
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-500/25 to-blue-600/25 blur-xl scale-105" />
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl ring-1 ring-white/10 shadow-xl shadow-black/40">
              <Image
                src="/hero/portrait-watercolor.jpg"
                alt="Watercolor portrait of Nathan"
                fill
                sizes="(max-width: 640px) 12rem, (max-width: 768px) 14rem, 16rem"
                className="object-cover object-top"
              />
            </div>
          </motion.figure>
        </div>
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
