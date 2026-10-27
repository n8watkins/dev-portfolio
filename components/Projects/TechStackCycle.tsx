'use client'
import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import Image from 'next/image'

import { techNameMapping } from '@/data/projects'
import { Technologies, TechNameMappingInterface } from '@/lib/types'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

interface TechStackCycleProps {
  technologies: Technologies
}

interface FlatIcon {
  icon: string
  category: keyof Technologies
  partIndex: number
}

const CYCLE_INTERVAL = 3000

const getTechName = (icon: string): string =>
  (techNameMapping as TechNameMappingInterface)[icon] || icon

const TechStackCycle: React.FC<TechStackCycleProps> = ({ technologies }) => {
  const categories = useMemo(
    () => Object.keys(technologies) as (keyof Technologies)[],
    [technologies]
  )

  const allIcons = useMemo<FlatIcon[]>(
    () =>
      categories.flatMap((category) =>
        technologies[category].descriptionParts.flatMap((part, partIndex) =>
          part.icons.map((tech) => ({ icon: tech.icon, category, partIndex }))
        )
      ),
    [technologies, categories]
  )

  const [activeIndex, setActiveIndex] = useState(0)
  const [hoveredIcons, setHoveredIcons] = useState<string[]>([])
  const pausedRef = useRef(false)
  const reduceMotion = usePrefersReducedMotion()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const active = allIcons[activeIndex] ?? allIcons[0]
  const currentCategory = active.category
  const highlightedPart = active.partIndex

  // Cycle only while on screen: inside a closed Details dialog it would
  // re-render every few seconds for no one.
  const root = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = root.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const startCycle = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (reduceMotion || !visible) return
    intervalRef.current = setInterval(() => {
      if (!pausedRef.current) {
        setActiveIndex((prev) => (prev + 1) % allIcons.length)
      }
    }, CYCLE_INTERVAL)
  }, [allIcons.length, reduceMotion, visible])

  useEffect(() => {
    startCycle()
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [startCycle])

  const pause = useCallback(() => {
    pausedRef.current = true
  }, [])

  const resume = useCallback(() => {
    pausedRef.current = false
    setHoveredIcons([])
    startCycle()
  }, [startCycle])

  const jumpTo = useCallback(
    (predicate: (tech: FlatIcon) => boolean) => {
      const index = allIcons.findIndex(predicate)
      if (index !== -1) setActiveIndex(index)
    },
    [allIcons]
  )

  const handleCategoryClick = useCallback(
    (category: keyof Technologies) => {
      jumpTo((tech) => tech.category === category)
      setHoveredIcons([])
      startCycle()
    },
    [jumpTo, startCycle]
  )

  const handleIconHover = useCallback(
    (icon: string) => {
      pause()
      setHoveredIcons([icon])
      jumpTo((tech) => tech.icon === icon && tech.category === currentCategory)
    },
    [pause, jumpTo, currentCategory]
  )

  const handlePartHover = useCallback(
    (partIndex: number) => {
      pause()
      const icons = technologies[currentCategory].descriptionParts[partIndex].icons.map(
        (tech) => tech.icon
      )
      setHoveredIcons(icons)
      jumpTo((tech) => tech.category === currentCategory && tech.partIndex === partIndex)
    },
    [pause, technologies, currentCategory, jumpTo]
  )

  const categoryIcons = allIcons.filter((tech) => tech.category === currentCategory)

  const isActive = (tech: FlatIcon) =>
    hoveredIcons.includes(tech.icon) || allIcons.indexOf(tech) === activeIndex

  return (
    <div ref={root} className="flex flex-col gap-4 select-none">
      {/* Category tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryClick(category)}
            className={`text-sm font-semibold px-3.5 py-1.5 rounded-full border transition-all duration-200 ${
              category === currentCategory
                ? 'bg-blue-500/15 border-blue-400/40 text-blue-300'
                : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/8 hover:text-slate-300'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Description bullets */}
      {/* The list slides in from the right when the category changes (a
          keyed CSS entrance, `slide-in` in app/globals.css; the animations
          here are CSS, so the Lab's Details dialogs don't load motion). Clip
          it sideways so the slide can't widen the page. */}
      <div className="min-h-26 overflow-x-clip">
        <ul key={currentCategory} className="slide-in flex flex-col gap-1">
          {technologies[currentCategory].descriptionParts.map((part, index) => (
            <li
              key={index}
              onMouseEnter={() => handlePartHover(index)}
              onMouseLeave={resume}
              className={`flex items-start gap-2.5 text-[0.95rem] leading-relaxed text-[#9cadc5] cursor-pointer rounded-lg px-2.5 py-1.5 w-fit max-w-[calc(100%-0.5rem)] transition-[translate,opacity] duration-200 ${
                index === highlightedPart ? 'translate-x-1.5 bg-blue-500/10 text-slate-200 opacity-100' : 'opacity-65'
              }`}
            >
              {/* A dot centred on the first line of text. */}
              <span aria-hidden="true" className="mt-[0.7em] h-1.5 w-1.5 shrink-0 -translate-y-1/2 rounded-full bg-blue-400" />
              <span>{part.text}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Icon dock: each tech's icon centred over its name. The active one
          lights up in place (no lift), so icons and names stay aligned. */}
      <ul className="flex flex-wrap items-start gap-x-2 gap-y-3 pt-1">
        {categoryIcons.map((tech) => {
          const on = isActive(tech)
          return (
            <li
              key={`${currentCategory}-${tech.icon}`}
              onMouseEnter={() => handleIconHover(tech.icon)}
              onMouseLeave={resume}
              className="flex w-20 cursor-pointer flex-col items-center gap-1.5 text-center"
            >
              <span
                className={`relative flex h-12 w-12 items-center justify-center rounded-full border bg-[#0a1428] p-2.5 transition-[border-color,box-shadow] duration-200 motion-reduce:transition-none ${
                  on ? 'border-blue-400 shadow-[0_0_0_3px_rgba(96,165,250,0.18)]' : 'border-white/15'
                }`}
              >
                <span className="relative h-full w-full">
                  <Image src={`/projectIcons/${tech.icon}`} alt="" fill sizes="48px" style={{ objectFit: 'contain' }} />
                </span>
              </span>
              <span className={`text-xs font-semibold leading-tight transition-colors duration-200 ${on ? 'text-blue-200' : 'text-slate-400'}`}>
                {getTechName(tech.icon)}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default TechStackCycle
