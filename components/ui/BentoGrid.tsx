'use client'
import { useCallback, useRef } from 'react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { staggerItemVariants } from '@/lib/animations'
import type { GridItemConfig } from '@/lib/types/gridItem'

/**
 * Cursor-following glow shared by every bento card - a single blurred radial
 * div eased toward the cursor with rAF (runs only while hovered), matching
 * the look of the heavier BackgroundGradientAnimation on the email card.
 */
const useCursorGlow = () => {
  const glowRef = useRef<HTMLDivElement>(null)
  const frame = useRef<number | null>(null)
  const cur = useRef({ x: 0, y: 0 })
  const tgt = useRef({ x: 0, y: 0 })

  const step = useCallback(() => {
    cur.current.x += (tgt.current.x - cur.current.x) / 8
    cur.current.y += (tgt.current.y - cur.current.y) / 8
    if (glowRef.current) {
      glowRef.current.style.transform = `translate(${Math.round(cur.current.x)}px, ${Math.round(
        cur.current.y
      )}px)`
    }
    frame.current = requestAnimationFrame(step)
  }, [])

  const onMouseEnter = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const rect = event.currentTarget.getBoundingClientRect()
      cur.current = tgt.current = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      }
      if (frame.current === null) frame.current = requestAnimationFrame(step)
    },
    [step]
  )

  const onMouseMove = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    tgt.current = { x: event.clientX - rect.left, y: event.clientY - rect.top }
  }, [])

  const onMouseLeave = useCallback(() => {
    if (frame.current !== null) {
      cancelAnimationFrame(frame.current)
      frame.current = null
    }
  }, [])

  return { glowRef, onMouseEnter, onMouseMove, onMouseLeave }
}

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
        'grid grid-cols-2 auto-rows-[5rem] md:grid-cols-4 md:auto-rows-[9rem] lg:auto-rows-[8rem] xl:auto-rows-[5rem] gap-5 md:gap-7 lg:gap-8 max-w-md sm:max-w-lg md:max-w-3xl lg:max-w-4xl xl:max-w-5xl lg:m-auto mx-auto px-4 pt-40 lg:pt-0',
        className
      )}>
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
}: GridItemConfig) => {
  const { glowRef, onMouseEnter, onMouseMove, onMouseLeave } = useCursorGlow()

  return (
    <motion.div
      variants={staggerItemVariants}
      onMouseEnter={onMouseEnter}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className={cn(
        'flex w-full h-full rounded-3xl relative group  dark:border-white/[0.2]  bg-gradient-to-br from-blue-400 via-blue-500 to-blue-400 border dark:from-[#0c4a6e] dark:via-[#0f172a] dark:to-[#0f172a] overflow-hidden  select-none',
        gridItemContainer
      )}>
      {/* Background layer - data-driven */}
      {renderBackground?.()}

      {/* Cursor-following glow - above backgrounds, below content.
          Fixed pixel size (not % of the card) so the glow looks identical on
          every bento item regardless of its dimensions. The element is centered
          on its own origin via negative margins, then translate() drops that
          center onto the cursor. */}
      <div
        ref={glowRef}
        className="absolute left-0 top-0 h-[16rem] w-[16rem] -ml-[8rem] -mt-[8rem] rounded-full z-[400] pointer-events-none opacity-0 group-hover:opacity-60 transition-opacity duration-300 [background:radial-gradient(circle,_rgba(56,189,248,0.8)_0,_rgba(56,189,248,0)_60%)] [mix-blend-mode:hard-light]"
      />

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
