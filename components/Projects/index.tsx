import React from 'react'
import { motion } from 'framer-motion'
import { fadeInUpVariants, defaultAnimationConfig } from '@/lib/animations'
import { projects } from '@/data/projects'
import { accents } from '@/lib/accents'
import ProjectCard from './ProjectCard'
import BuildsTeaser from './BuildsTeaser'
import { DemoSleepNote } from './StatusPill'
import SectionHeading from '@/components/ui/SectionHeading'

const BLURB =
  'Generative AI is changing what software can be - and how it gets built. These are the projects where I explore that shift hands-on.'

const Projects: React.FC = () => {
  return (
    <div className="flex flex-col my-20 items-center justify-center gap-5 w-full text-slate-200 mb-16">
      <SectionHeading
        eyebrow="Selected projects"
        title={
          <>
            Building for the <span className="text-sky-400">AI-native web</span>
          </>
        }
        className="px-2 md:px-4 pt-14 md:pt-16 mb-4"
      >
        {/* Blurb streams in word-by-word like LLM token generation */}
        <motion.p
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.035 } },
          }}
          className="select-none"
        >
          {BLURB.split(' ').map((word, i) => (
            <motion.span
              key={i}
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { duration: 0.12 } },
              }}
            >
              {word}{' '}
            </motion.span>
          ))}
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            className="inline-block w-[0.55em] h-[1.1em] align-text-bottom bg-sky-400 rounded-[2px]"
            aria-hidden="true"
          />
        </motion.p>
        <DemoSleepNote className="mt-4" />
      </SectionHeading>

      {/* Each row sits in a full-bleed wash of its project's colour, glowing
          in from the page edge on its screenshot's side (`.lab-row-wash`). */}
      <div className="flex w-full flex-col">
        {projects.map((project, index) => (
          <motion.div
            key={project.id}
            variants={fadeInUpVariants}
            {...defaultAnimationConfig}
            viewport={{ once: true, amount: 0.15 }}
            className="relative py-8 md:py-10"
          >
            <div
              aria-hidden="true"
              className="lab-row-wash pointer-events-none absolute inset-y-0 left-1/2 w-screen -translate-x-1/2"
              style={
                {
                  '--lab-from': accents[project.accent].rgb,
                  '--lab-x': index % 2 === 1 ? '100%' : '0%',
                } as React.CSSProperties
              }
            />
            <div className="relative px-2 md:px-4">
              <ProjectCard project={project} index={index} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* The n8builds.dev teaser: the rest of what I build, one build at a time */}
      <motion.div
        variants={fadeInUpVariants}
        {...defaultAnimationConfig}
        className="w-full px-2 md:px-4 pt-10 select-none"
      >
        <BuildsTeaser />
      </motion.div>
    </div>
  )
}

export default Projects
