import React, { useState, useRef } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Link } from 'react-scroll'

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
        )}>
        <Link
          to="home"
          smooth={true}
          duration={300}
          className="flex items-center cursor-pointer pl-2 sm:pl-3 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
          aria-label="Scroll to top">
          <span className="relative w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 rounded-lg lg:rounded-xl overflow-hidden">
            <Image
              src="/tab/n8-icon.png"
              fill
              sizes="40px"
              className="object-cover"
              alt="n8builds"
            />
          </span>
        </Link>
        <div ref={navRef} className="flex items-center relative px-1 sm:px-2">
          {navItems.map((item, idx) => (
            <div
              key={`nav-${item.name}-${idx}`}
              className={cn(
                'relative dark:text-neutral-50 items-center flex space-x-0 font-semibold dark:font-normal text-black dark:hover:text-neutral-300 hover:text-slate-800 cursor-pointer px-2 sm:px-4 lg:px-5 py-0.5 sm:py-1 lg:py-2 z-10 select-none'
              )}
              onMouseEnter={() => setActiveIndex(idx)}
              onMouseLeave={() => setActiveIndex(null)}>
              <Link
                to={item.link}
                activeClass="active"
                spy={true}
                smooth={true}
                offset={-80}
                duration={300}
                className="flex items-center rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                aria-label={`Navigate to ${item.name} section`}>
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
