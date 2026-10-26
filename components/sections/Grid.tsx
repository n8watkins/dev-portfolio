'use client'
import React from 'react'
import { motion } from 'framer-motion'
import { BentoGrid, BentoGridItem } from '@/components/ui/BentoGrid'
import { gridItems } from '@/data/grid'
import { staggerContainerVariants, defaultAnimationConfig } from '@/lib/animations'
import SectionHeading from '@/components/ui/SectionHeading'

const Grid = () => {
  return (
    <section className="mb-10">
      {/* About intro - prose above the bento grid, aligned with it */}
      <div className="max-w-md sm:max-w-lg md:max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto px-4 pt-36 md:pt-48 pb-14">
        <SectionHeading eyebrow="Get to know me" title="About me">
          <div className="text-slate-300">
            <p>
              I&apos;m Nathan - a full-stack developer in Los Angeles, a little obsessed with what
              generative AI makes possible. My favorite part of building is the moment a rough idea
              turns into something you can actually use.
            </p>
            <p className="mt-4">
              When I&apos;m not doing client work through{' '}
              <a
                href="https://appturnity.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-sky-500 dark:text-sky-400 underline decoration-sky-400/40 underline-offset-4 hover:text-sky-300 hover:decoration-sky-300 transition-colors duration-200"
              >
                Appturnity
              </a>
              , I&apos;m the kind of person who builds tools to scratch my own itches - a faster way
              to dictate, a way to skip to the point of a long video, whatever&apos;s bugging me
              that week. You can see a lot of them on{' '}
              <a
                href="https://n8builds.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 underline decoration-cyan-400/40 underline-offset-4 hover:from-cyan-300 hover:to-blue-300 hover:decoration-cyan-300 transition-colors duration-200"
              >
                n8builds.dev
              </a>
              , where I ship in public.
            </p>
            <p className="mt-4">
              I like small, sharp projects, learning in public, and taking things apart to see how
              they work.
            </p>
          </div>
        </SectionHeading>
      </div>

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
