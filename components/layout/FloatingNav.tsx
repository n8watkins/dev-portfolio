import React, { useState } from 'react'
import { motion } from 'motion/react'
import { Link } from 'react-scroll'
import CornerLinks from './CornerLinks'

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
  // The hovered item's box, measured on hover so render never reads the DOM.
  const [hovered, setHovered] = useState<{ left: number; width: number } | null>(null)

  return (
    <>
      <CornerLinks />
      <motion.div
        key="floating-nav-wrapper"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        role="navigation"
        aria-label="Main navigation"
        className={cn(
          'flex max-w-fit fixed top-2 1lg:top-4  xl:top-6 inset-x-0 mx-auto border dark:border-white/20 rounded-2xl bg-linear-to-r from-sky-200 to-blue-300 dark:from-gray-900 dark:to-blue-950 shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),5px_0px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] py-0.5 sm:py-1 lg:py-2 lg:px-1 items-center justify-center z-9999',
          className
        )}
      >
        <div className="flex items-center relative px-1 sm:px-2 lg:px-1">
          {navItems.map((item, idx) => (
            <div
              key={`nav-${item.name}-${idx}`}
              className={cn(
                'relative dark:text-neutral-50 items-center flex space-x-0 font-semibold dark:font-normal text-black dark:hover:text-neutral-300 hover:text-slate-800 cursor-pointer px-2 sm:px-4 lg:px-6 py-0.5 sm:py-1 lg:py-2.5 z-10 select-none'
              )}
              onMouseEnter={(e) =>
                setHovered({ left: e.currentTarget.offsetLeft, width: e.currentTarget.offsetWidth })
              }
              onMouseLeave={() => setHovered(null)}
            >
              <Link
                to={item.link}
                activeClass="active"
                spy={true}
                smooth={true}
                offset={-80}
                duration={300}
                className="flex items-center rounded focus:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-400"
                aria-label={`Navigate to ${item.name} section`}
              >
                <span className="text-xs sm:text-sm lg:text-base">{item.name}</span>
              </Link>
            </div>
          ))}
          <motion.div
            className="absolute top-0 bottom-0 rounded-full bg-white/20 dark:bg-white/10 backdrop-blur-xs"
            initial={false}
            animate={
              hovered
                ? {
                    left: hovered.left,
                    width: hovered.width,
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
