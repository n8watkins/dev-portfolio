'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { BentoGrid, BentoGridItem } from '@/components/ui/BentoGrid'
import { gridItems } from '@/data/grid'
import { fadeInUpVariants, staggerContainerVariants, defaultAnimationConfig } from '@/lib/animations'

const Grid = () => {
  return (
    <section className="mb-10">
      {/* About intro - prose above the bento grid */}
      <motion.div
        variants={fadeInUpVariants}
        {...defaultAnimationConfig}
        className="max-w-3xl mx-auto text-center px-4 pt-36 md:pt-48 pb-14 select-none">
        <p className="text-xs font-semibold uppercase tracking-widest text-sky-400 mb-3">
          Get to know me
        </p>
        <h2 className="text-4xl sm:text-5xl font-bold text-slate-800 dark:text-slate-100 mb-6 select-none">
          About me
        </h2>
        <p className="text-lg md:text-xl text-slate-700 dark:text-slate-300 leading-relaxed">
          I&apos;m Nathan - a full-stack developer in Los Angeles, a little obsessed with what
          generative AI makes possible. My favorite part of building is the moment a rough idea
          turns into something you can actually use.
        </p>
        <p className="text-lg md:text-xl text-slate-700 dark:text-slate-300 leading-relaxed mt-5">
          When I&apos;m not doing client work through{' '}
          <a
            href="https://appturnity.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-sky-500 dark:text-sky-400 underline decoration-sky-400/40 underline-offset-4 hover:text-sky-300 hover:decoration-sky-300 transition-colors duration-200">
            Appturnity
          </a>
          , I&apos;m the kind of person who builds tools to scratch my own itches - a faster way to
          dictate, a way to skip to the point of a long video, whatever&apos;s bugging me that week. You
          can see a lot of them on{' '}
          <a
            href="https://n8builds.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 underline decoration-cyan-400/40 underline-offset-4 hover:from-cyan-300 hover:to-blue-300 hover:decoration-cyan-300 transition-colors duration-200">
            n8builds.dev
          </a>
          , where I ship in public.
        </p>
        <p className="text-lg md:text-xl text-slate-700 dark:text-slate-300 leading-relaxed mt-5">
          I like small, sharp projects, learning in public, and taking things apart to see how they
          work.
        </p>
      </motion.div>

      <motion.div variants={staggerContainerVariants} {...defaultAnimationConfig}>
        <BentoGrid className=" ">
          {gridItems.map((item) => (
            <BentoGridItem key={item.id} {...item} />
          ))}
        </BentoGrid>
      </motion.div>
    </section>
  )
}

export default Grid
