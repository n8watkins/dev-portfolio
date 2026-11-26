'use client'

import { useEffect, useState, type RefObject } from 'react'

/** A box in px from the top left of the page's `main`. */
export interface Box {
  id: string
  top: number
  bottom: number
  left: number
  right: number
}

/** Where each part of the About story sits, so the background can keep clear of it. */
export interface StoryLayout {
  /** The page's height and width (main's box). */
  height: number
  width: number
  /** The viewport's height, for where the reading line falls. */
  vh: number
  /** Top of main in document coordinates. */
  top: number
  /** The intro, then each scene (by id: work, la, setup), then the ways on ("end"). */
  parts: Box[]
  /** The blocks of words (breadcrumb, intro, each scene's words, the ways on), to keep clear. */
  words: Box[]
  /** The portrait and each scene's photo. */
  photos: Box[]
}

/**
 * Measures the story inside `main`, and again whenever it resizes. Every box
 * is its layout box (offsets up to main), never its painted one: the scenes
 * rise in with a transform (useSceneReveal), and the background must keep
 * clear of where they rest, whatever moment it measures.
 * Layout is read only here, never per scroll frame.
 */
export function useStoryLayout(main: RefObject<HTMLElement | null>): StoryLayout | null {
  const [layout, setLayout] = useState<StoryLayout | null>(null)
  useEffect(() => {
    const el = main.current
    if (!el) return
    let frame = 0
    const measure = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const at = (node: Element | null | undefined, id: string): Box | null => {
          if (!(node instanceof HTMLElement) || !node.offsetWidth) return null
          let left = 0
          let top = 0
          for (
            let n: HTMLElement | null = node;
            n && n !== el;
            n = n.offsetParent as HTMLElement | null
          ) {
            left += n.offsetLeft
            top += n.offsetTop
          }
          return { id, left, top, right: left + node.offsetWidth, bottom: top + node.offsetHeight }
        }
        const present = (list: (Box | null)[]) => list.filter((p): p is Box => p !== null)
        const intro = el.querySelector('section[aria-labelledby="about-heading"]')
        const scenes = Array.from(el.querySelectorAll('section[aria-labelledby^="scene-"]'))
        const sceneId = (s: Element) => s.getAttribute('aria-labelledby')!.slice('scene-'.length)
        const ways = el.querySelector('nav[aria-label="Where to next"]')
        setLayout({
          height: el.offsetHeight,
          width: el.offsetWidth,
          vh: window.innerHeight,
          top: el.getBoundingClientRect().top + window.scrollY,
          parts: present([
            at(intro, 'intro'),
            ...scenes.map((s) => at(s, sceneId(s))),
            at(ways, 'end'),
          ]),
          words: present([
            at(el.querySelector('nav[aria-label="Breadcrumb"]'), 'crumbs'),
            at(intro?.children[0], 'intro'),
            ...scenes.map((s) => at(s.children[1], `${sceneId(s)}-words`)),
            at(ways, 'end'),
          ]),
          photos: present([
            at(intro?.children[1], 'portrait'),
            ...scenes.map((s) => at(s.children[0], `${sceneId(s)}-photo`)),
          ]),
        })
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
  }, [main])
  return layout
}

/** 0 at a, 1 at b, eased (smoothstep). */
export const smooth = (a: number, b: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)))
  return t * t * (3 - 2 * t)
}
