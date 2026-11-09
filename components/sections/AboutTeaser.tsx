'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'motion/react'
import { FiArrowRight } from 'react-icons/fi'
import SectionHeading from '@/components/ui/SectionHeading'
import { TECH_FOR_PROS } from '@/lib/sites'

/**
 * The home page's About: who I am in two sentences and a portrait, then
 * "More about me" to the About page, where the full story lives (variant B).
 */
export default function AboutTeaser() {
  return (
    <div className="mx-auto max-w-md px-4 pt-6 pb-6 sm:max-w-lg md:max-w-3xl md:pt-2 lg:max-w-4xl xl:max-w-5xl">
      <SectionHeading eyebrow="Get to know me" title="About me" />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.5 }}
        className="mt-5 flex flex-col-reverse gap-6 sm:flex-row sm:items-center sm:gap-8"
      >
        <div className="flex-1">
          <p className="max-w-3xl text-pretty text-base leading-relaxed text-slate-300 md:text-lg/7">
            I&apos;m Nathan, a full-stack developer in Los Angeles, and I&apos;m all in on AI. These
            days I build{' '}
            <a
              href={TECH_FOR_PROS.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-sky-400 underline decoration-sky-400/40 underline-offset-4 transition-colors duration-200 hover:text-sky-300 hover:decoration-sky-300"
            >
              {TECH_FOR_PROS.name}
            </a>
            , a platform for service businesses, and consult on AI;
            before that I spent three years building client apps at a consulting firm.
          </p>
          <Link
            href="/about"
            className="group mt-5 inline-flex items-center gap-2 rounded-xl border border-white/12 bg-white/4 px-4 py-2.5 text-sm font-semibold text-slate-100 transition-colors hover:border-sky-400/50 hover:bg-white/8 hover:text-sky-200 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-400"
          >
            More about me
            <FiArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>
        </div>
        <figure className="relative h-28 w-28 shrink-0 sm:h-36 sm:w-36">
          <div className="absolute inset-0 scale-105 rounded-full bg-linear-to-br from-cyan-500/25 to-blue-600/25 blur-xl" />
          <div className="relative h-full w-full overflow-hidden rounded-full ring-1 ring-white/10 shadow-xl shadow-black/40">
            <Image
              src="/hero/portrait-watercolor.jpg"
              alt="Watercolor portrait of Nathan"
              fill
              sizes="9rem"
              className="object-cover object-top"
            />
          </div>
        </figure>
      </motion.div>
    </div>
  )
}
