import React from 'react'
import { FiArrowUpRight } from 'react-icons/fi'

interface LinkButtonProps {
  text: string
  href: string
  className?: string
}

/**
 * External-link counterpart to ScrollButton - same animated conic-gradient
 * styling, but navigates to an external URL in a new tab instead of
 * smooth-scrolling to a section.
 */
const LinkButton: React.FC<LinkButtonProps> = ({ text, href, className }) => {
  return (
    <div className={` flex items-center justify-center`}>
      <a href={href} target="_blank" rel="noopener noreferrer" className="inline-block">
        <button
          aria-label={`Open ${href}`}
          className={`h-12 ${className} relative group inline-flex overflow-hidden rounded-md p-px focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 transform transition-transform duration-300 hover:scale-105`}>
          <span className="absolute inset-[-1000%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
          <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-md text-darkBlue dark:text-white font-semibold bg-linear-to-br  from-blue-400 via-sky-300 to-blue-400 dark:from-darkBlue dark:via-blue-950 dark:to-darkBlue px-5 py-2 text-base  backdrop-blur-3xl gap-3">
            <span className="group-hover:translate-y-20 text-center transition duration-300">
              <span>{text}</span>
            </span>
            <div className="-translate-y-20 group-hover:translate-y-0 flex items-center justify-center absolute inset-0 transition duration-500 text-white z-20">
              <FiArrowUpRight
                className="text-sky-700 dark:text-white w-5 h-5"
                aria-hidden="true"
              />
            </div>
          </span>
        </button>
      </a>
    </div>
  )
}

export default LinkButton
