import React, { useCallback, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { FiArrowUpRight } from 'react-icons/fi'
import { fadeInUpVariants, staggerContainerSlowVariants, defaultAnimationConfig } from '@/lib/animations'
import { projects } from '@/data/projects'
import { Project, IconCycleState } from '@/lib/types'
import { trackProjectEvent } from '@/lib/analytics'
import ProjectCard from './ProjectCard'
import { getInitialIconCycleState, createStateHandlerMap } from './utils'

const BLURB =
  'Generative AI is changing what software can be - and how it gets built. These are the projects where I explore that shift hands-on.'

const Projects: React.FC = () => {
  const router = useRouter()
  const [iconCycleStates, setIconCycleStates] = useState<Record<number, IconCycleState>>({})

  const getOnStateChange = useCallback(
    (projectId: number) =>
      (newState: IconCycleState | ((prevState: IconCycleState) => IconCycleState)) => {
        setIconCycleStates((prevStates) => ({
          ...prevStates,
          [projectId]:
            typeof newState === 'function'
              ? newState(prevStates[projectId] || getInitialIconCycleState(projectId, projects))
              : newState,
        }))
      },
    []
  )

  const handleProjectClick = (project: Project) => {
    trackProjectEvent('view', project.title)
    router.push(`/projects/${project.slug}`)
  }

  const onStateChangeMap = useMemo(
    () => createStateHandlerMap(projects, getOnStateChange),
    [getOnStateChange]
  )


  const handleIconClick = (project: Project) => {
    trackProjectEvent('icon_click', project.title)
    router.push(`/projects/${project.slug}`)
  }

  return (
    <div className="flex flex-col my-20 items-center justify-center gap-5 w-full text-slate-200 mb-16 ">
      <div className="w-full px-2 md:px-4 text-left">
        <motion.h2
          variants={fadeInUpVariants}
          {...defaultAnimationConfig}
          className="text-5xl font-bold pt-14 md:pt-16 pb-4 text-slate-800 dark:text-slate-200 select-none">
          Building for the <span className="text-sky-400 lg:inline">AI-native web</span>
        </motion.h2>

        {/* Blurb streams in word-by-word like LLM token generation */}
        <motion.p
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.035 } },
          }}
          className="max-w-3xl mb-8 text-base md:text-lg text-slate-600 dark:text-slate-400 select-none">
          {BLURB.split(' ').map((word, i) => (
            <motion.span
              key={i}
              variants={{
                hidden: { opacity: 0 },
                visible: { opacity: 1, transition: { duration: 0.12 } },
              }}>
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
      </div>

      <motion.div
        variants={staggerContainerSlowVariants}
        {...defaultAnimationConfig}
        // The card grid is tall; trigger the stagger as soon as it starts entering
        // the viewport (not at 30% of the whole grid, which a tall grid may never hit).
        viewport={{ once: true, amount: 0.05 }}
        className="grid grid-cols-1 gap-14 lg:gap-20 w-full px-2 md:px-4">
      {projects.map((project: Project, index: number) => (
        <ProjectCard
          key={project.id}
          project={project}
          index={index}
          onProjectClick={handleProjectClick}
          onIconClick={handleIconClick}
          iconCycleState={iconCycleStates[project.id] || getInitialIconCycleState(project.id, projects)}
          onIconCycleStateChange={onStateChangeMap[project.id]}
        />
      ))}
      </motion.div>

      {/* Redirect - the rest of the build log lives on n8builds.dev */}
      <motion.div
        variants={fadeInUpVariants}
        {...defaultAnimationConfig}
        className="flex flex-col items-center gap-4 w-full px-2 md:px-4 pt-14 text-center select-none">
        <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
          These are a few of them. I&apos;m shipping new AI-native builds in public - see
          the rest of what I&apos;m making at{' '}
          <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
            n8builds.dev
          </span>
          .
        </p>
        <a
          href="https://n8builds.dev"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="See more builds at n8builds.dev"
          className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-base font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 hover:shadow-lg hover:shadow-sky-500/40 transition-all duration-300">
          See more builds at n8builds.dev
          <FiArrowUpRight
            className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300"
            aria-hidden="true"
          />
        </a>
      </motion.div>
    </div>
  )
}

export default Projects
