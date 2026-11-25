'use client'

import React, { useEffect, useRef } from 'react'
import { motion, useMotionValueEvent, useScroll, useTransform } from 'motion/react'
import { smooth, type StoryLayout } from './shared'

interface Field {
  /** Where it rests on screen, as a share of the viewport (its centre). */
  x: number
  y: number
  /** Its colour (r,g,b) and its strength at the centre. */
  rgb: string
  alpha: number
  /** Its size, as a share of the screen's longer side. */
  size: number
  /** Which way it drifts sideways while its part is on screen. */
  dir: 1 | -1
}

/**
 * The fields of each part of the story, in the site's palette: sky for the
 * intro, blue at work, cyan in LA, indigo and blue for the setup, sky again at
 * the end. The main field sits on the photo's side, so it haloes the photo
 * and only its soft edge reaches the words.
 */
const FIELDS: Record<string, Field[]> = {
  intro: [
    { x: 0.82, y: 0.3, rgb: '56,189,248', alpha: 0.16, size: 0.75, dir: -1 },
    { x: 0.1, y: 0.75, rgb: '37,99,235', alpha: 0.12, size: 0.6, dir: 1 },
  ],
  work: [
    { x: 0.12, y: 0.4, rgb: '59,130,246', alpha: 0.17, size: 0.8, dir: 1 },
    { x: 0.9, y: 0.8, rgb: '14,165,233', alpha: 0.1, size: 0.55, dir: -1 },
  ],
  la: [
    { x: 0.88, y: 0.4, rgb: '34,211,238', alpha: 0.15, size: 0.8, dir: -1 },
    { x: 0.15, y: 0.85, rgb: '45,212,191', alpha: 0.08, size: 0.55, dir: 1 },
  ],
  setup: [
    { x: 0.12, y: 0.45, rgb: '99,102,241', alpha: 0.16, size: 0.8, dir: 1 },
    { x: 0.85, y: 0.2, rgb: '59,130,246', alpha: 0.1, size: 0.55, dir: -1 },
  ],
  end: [{ x: 0.5, y: 0.6, rgb: '56,189,248', alpha: 0.11, size: 0.85, dir: 1 }],
}

/**
 * Option 2: soft colour fields behind the story, fixed to the screen. Each
 * part of the story has its own one or two fields; as you scroll they drift
 * slowly (slower than the page, so they read as far behind it) and cross-fade
 * into the next part's. Only opacity and transform change, once per scroll
 * frame. Reduced motion: the intro's fields rest where they are.
 */
export default function ColorFields({ layout, reduce }: { layout: StoryLayout; reduce: boolean }) {
  const { scrollY } = useScroll()
  const nodes = useRef<(HTMLDivElement | null)[]>([])
  const list = layout.parts.flatMap((part) =>
    (FIELDS[part.id] ?? []).map((field) => ({ ...field, part }))
  )

  const paint = (scroll: number) => {
    const focus = scroll - layout.top + layout.vh * 0.5
    list.forEach(({ part, alpha, dir }, i) => {
      const node = nodes.current[i]
      if (!node) return
      if (reduce) {
        node.style.opacity = part.id === 'intro' ? String(alpha / 0.2) : '0'
        node.style.transform = 'none'
        return
      }
      const centre = (part.top + part.bottom) / 2
      const reach = (part.bottom - part.top) / 2 + layout.vh * 0.75
      const off = centre - focus
      node.style.opacity = (smooth(reach, reach * 0.35, Math.abs(off)) * (alpha / 0.2)).toFixed(3)
      // Slower than the page: a field rides a quarter of the way along, and leans sideways a little.
      node.style.transform = `translate3d(${(dir * off * 0.06).toFixed(1)}px, ${(off * 0.25).toFixed(1)}px, 0)`
    })
  }
  useEffect(() => paint(scrollY.get()))
  useMotionValueEvent(scrollY, 'change', paint)

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
      {list.map(({ x, y, rgb, size, part }, i) => (
        <div
          key={`${part.id}-${i}`}
          ref={(el) => {
            nodes.current[i] = el
          }}
          className="absolute rounded-full"
          style={{
            left: `calc(${x * 100}% - ${size * 50}vmax)`,
            top: `calc(${y * 100}% - ${size * 50}vmax)`,
            width: `${size * 100}vmax`,
            height: `${size * 100}vmax`,
            // Full strength is 0.2 alpha; each field's own strength is its opacity.
            background: `radial-gradient(circle, rgba(${rgb},0.34) 0%, rgba(${rgb},0.16) 30%, rgba(${rgb},0.05) 50%, transparent 68%)`,
            opacity: 0,
            willChange: 'opacity, transform',
          }}
        />
      ))}
    </div>
  )
}

/**
 * The stickers of one scene, on a slow parallax: they ride a little ahead of
 * the page as it scrolls by (40px over the scene's pass), so they float above
 * the photos. Absolute, so it shifts nothing.
 */
export function ParallaxStickers({ children, reduce }: { children: React.ReactNode; reduce: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [36, -36])
  return (
    <motion.div ref={ref} style={{ y }} className="pointer-events-none absolute inset-0 z-20">
      {children}
    </motion.div>
  )
}
