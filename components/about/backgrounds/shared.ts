'use client'

import { useEffect, useState, useSyncExternalStore, type RefObject } from 'react'

/**
 * Preview switch for the About page's scroll backgrounds (owner picks one):
 * `?bg=1`, `?bg=2` or `?bg=3`. No switch, or anything else, is today's page.
 * Read after hydration, so the server's HTML is always today's page.
 */
export type AboutBg = 0 | 1 | 2 | 3

const noop = () => () => {}

export function useAboutBg(): AboutBg {
  return useSyncExternalStore(
    noop,
    () => {
      const n = Number(new URLSearchParams(window.location.search).get('bg'))
      return n === 1 || n === 2 || n === 3 ? n : 0
    },
    () => 0
  )
}

/** Where each part of the story sits, in px from the top of `main`. */
export interface StoryLayout {
  /** The page's height and width (main's box). */
  height: number
  width: number
  /** The viewport's height, for where the reading line falls. */
  vh: number
  /** Top of main in document coordinates (scrollY at which main's top meets the screen's top). */
  top: number
  /** The intro, then each scene, then the ways on: top and bottom. */
  parts: Box[]
  /** The blocks of words (breadcrumb, intro, each scene's words, the ways on), to keep clear. */
  words: Box[]
  /** The portrait and each scene's photo (anything behind them is hidden). */
  photos: Box[]
}

export interface Box {
  id: string
  top: number
  bottom: number
  left: number
  right: number
}

/**
 * Measures the story's parts inside `main` (the intro section, each scene's
 * section and the "Where to next" nav), again on resize. Layout is read only
 * here, never per scroll frame.
 */
export function useStoryLayout(main: RefObject<HTMLElement | null>, enabled: boolean): StoryLayout | null {
  const [layout, setLayout] = useState<StoryLayout | null>(null)
  useEffect(() => {
    const el = main.current
    if (!el || !enabled) return
    let frame = 0
    const measure = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const box = el.getBoundingClientRect()
        const top = box.top + window.scrollY
        const at = (node: Element | null | undefined, id: string): Box | null => {
          if (!node) return null
          const r = node.getBoundingClientRect()
          return {
            id,
            top: r.top - box.top,
            bottom: r.bottom - box.top,
            left: r.left - box.left,
            right: r.right - box.left,
          }
        }
        const present = (list: (Box | null)[]) => list.filter((p): p is Box => p !== null)
        const intro = el.querySelector('section[aria-labelledby="about-heading"]')
        const scenes = Array.from(el.querySelectorAll('section[aria-labelledby^="scene-"]'))
        const ways = el.querySelector('nav[aria-label="Where to next"]')
        const parts = present([
          at(intro, 'intro'),
          ...scenes.map((s) => at(s, s.getAttribute('aria-labelledby')!.slice('scene-'.length))),
          at(ways, 'end'),
        ])
        const words = present([
          at(el.querySelector('nav[aria-label="Breadcrumb"]'), 'crumbs'),
          at(intro?.children[0], 'intro'),
          ...scenes.map((s) => at(s.children[1], `${s.getAttribute('aria-labelledby')}-words`)),
          at(ways, 'end'),
        ])
        const photos = present([
          at(intro?.children[1], 'portrait'),
          ...scenes.map((s) => at(s.children[0], `${s.getAttribute('aria-labelledby')}-photo`)),
        ])
        setLayout({ height: box.height, width: box.width, vh: window.innerHeight, top, parts, words, photos })
      })
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    window.addEventListener('resize', measure)
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [main, enabled])
  return enabled ? layout : null
}

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)
/** 0 at a, 1 at b, eased (smoothstep). */
export const smooth = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a))
  return t * t * (3 - 2 * t)
}
