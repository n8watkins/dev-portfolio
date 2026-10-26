import React, { useState, useRef } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Link } from 'react-scroll'
import { FiFileText } from 'react-icons/fi'
import { RESUME_VIEW_URL } from '@/lib/resume'
import { trackResumeEvent } from '@/lib/analytics'

const cn = (...classes: (string | boolean | undefined | null)[]): string =>
  classes.filter(Boolean).join(' ')

type NavItem = {
  name: string
  link: string
  icon?: React.ReactElement
}

export const FloatingNav = ({
  navItems,
  className,
}: {
  navItems: NavItem[]
  className?: string
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const navRef = useRef<HTMLDivElement>(null)

  const getItemPosition = (index: number) => {
    if (navRef.current) {
      const navItem = navRef.current.children[index] as HTMLElement
      return {
        left: navItem.offsetLeft,
        width: navItem.offsetWidth,
      }
    }
    return { left: 0, width: 0 }
  }

  return (
    <>
      <div className="fixed top-0 w-full h-16 lg:h-24 bg-gradient-to-t from-blue-400/0 via-blue-400/90 to-blue-400 dark:from-darkBlue/0 dark:via-darkBlue/90 dark:to-darkBlue z-[9999] select-none" />
      {/* Top left: the n8builds wordmark, to n8builds.dev. Top right: the resume.
          From sm up; on a phone the hero carries both. */}
      <a
        href="https://n8builds.dev"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="n8builds.dev (opens in a new tab)"
        className="group fixed left-4 top-2 1lg:top-4 xl:top-6 z-[9999] hidden sm:flex items-center gap-2.5 rounded-xl py-1 pr-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
      >
        <span className="relative h-9 w-9 lg:h-10 lg:w-10 overflow-hidden rounded-xl ring-1 ring-white/10 transition-all duration-200 group-hover:ring-white/25">
          <Image src="/tab/n8-icon.png" fill sizes="40px" className="object-cover" alt="" />
        </span>
        <span className="font-bold tracking-tight text-slate-100 text-[0.95rem] lg:text-lg group-hover:text-sky-300 transition-colors">
          n8builds
        </span>
      </a>
      <a
        href={RESUME_VIEW_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackResumeEvent('view')}
        className="fixed right-4 top-2 1lg:top-4 xl:top-6 z-[9999] hidden sm:inline-flex items-center gap-2 rounded-xl border border-sky-400/40 bg-sky-500/10 px-3.5 py-2 lg:px-4 lg:py-2.5 text-sm lg:text-[0.95rem] font-semibold text-sky-100 backdrop-blur-sm transition-colors duration-200 hover:border-sky-300/70 hover:bg-sky-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
      >
        <FiFileText className="h-4 w-4" aria-hidden="true" />
        Resume<span className="sr-only"> (opens in a new tab)</span>
      </a>
      <motion.div
        key="floating-nav-wrapper"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        role="navigation"
        aria-label="Main navigation"
        className={cn(
          'flex max-w-fit fixed top-2 1lg:top-4  xl:top-6 inset-x-0 mx-auto border dark:border-white/[0.2] rounded-2xl bg-gradient-to-r from-sky-200 to-blue-300 dark:from-gray-900 dark:to-blue-950 shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),5px_0px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] py-0.5 sm:py-1 lg:py-1.5 lg:px-1 items-center justify-center z-[9999]',
          className
        )}
      >
        <div ref={navRef} className="flex items-center relative px-1 sm:px-2 lg:px-1">
          {navItems.map((item, idx) => (
            <div
              key={`nav-${item.name}-${idx}`}
              className={cn(
                'relative dark:text-neutral-50 items-center flex space-x-0 font-semibold dark:font-normal text-black dark:hover:text-neutral-300 hover:text-slate-800 cursor-pointer px-2 sm:px-4 lg:px-5 py-0.5 sm:py-1 lg:py-2 z-10 select-none'
              )}
              onMouseEnter={() => setActiveIndex(idx)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <Link
                to={item.link}
                activeClass="active"
                spy={true}
                smooth={true}
                offset={-80}
                duration={300}
                className="flex items-center rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                aria-label={`Navigate to ${item.name} section`}
              >
                <span className="text-xs sm:text-sm lg:text-[0.95rem]">{item.name}</span>
              </Link>
            </div>
          ))}
          <motion.div
            className="absolute top-0 bottom-0 rounded-full bg-white/20 dark:bg-white/10 backdrop-blur-sm"
            initial={false}
            animate={
              activeIndex !== null
                ? {
                    left: getItemPosition(activeIndex).left,
                    width: getItemPosition(activeIndex).width,
                    opacity: 1,
                  }
                : { opacity: 0 }
            }
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          />
        </div>
      </motion.div>
    </>
  )
}
