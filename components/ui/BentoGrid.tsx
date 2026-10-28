'use client'
import { cn } from '@/lib/utils'
import { motion } from 'motion/react'
import { staggerItemVariants } from '@/lib/animations'
import type { GridItemConfig } from '@/lib/types/gridItem'

const FADE_ONLY = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } },
} as const

export const BentoGrid = ({
  className,
  children,
}: {
  className?: string
  children?: React.ReactNode
}) => {
  return (
    <div
      className={cn(
        'grid grid-cols-2 auto-rows-[5rem] md:grid-cols-4 md:auto-rows-[9rem] lg:auto-rows-[8rem] xl:auto-rows-[5rem] gap-5 md:gap-6 lg:gap-7 max-w-md sm:max-w-lg md:max-w-3xl lg:max-w-4xl xl:max-w-5xl lg:m-auto mx-auto px-4',
        className
      )}
    >
      {children}
    </div>
  )
}

export const BentoGridItem = ({
  title,
  description,
  titleClassName,
  textContainerClassName,
  descriptionClass,
  textOrder,
  gridItemContainer,
  renderBackground,
  renderContent,
  renderForeground,
  entrance,
}: GridItemConfig) => {
  return (
    <motion.div
      variants={entrance === 'fade' ? FADE_ONLY : staggerItemVariants}
      className={cn(
        'group flex w-full h-full rounded-3xl relative dark:border-white/[0.2] transition-colors duration-300 dark:hover:border-sky-300/40  bg-gradient-to-br from-blue-400 via-blue-500 to-blue-400 border dark:from-[#0c4a6e] dark:via-[#0f172a] dark:to-[#0f172a] overflow-hidden  select-none',
        gridItemContainer
      )}
    >
      {/* Background layer - data-driven */}
      {renderBackground?.()}

      {/* Content layer - data-driven */}
      <div className={`absolute z-[500]   ${textContainerClassName}`}>
        {renderContent?.()}

        <div className={` ${textOrder}  `}>
          {title && <div className={` ${titleClassName} `}>{title}</div>}
          {description && <div className={` ${descriptionClass}`}>{description}</div>}
        </div>
      </div>

      {/* Foreground layer - data-driven */}
      {renderForeground?.()}
    </motion.div>
  )
}
