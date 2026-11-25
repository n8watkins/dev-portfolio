'use client'

import { useEffect, type RefObject } from 'react'

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'

/**
 * The scenes arrive as you scroll: each scene's photo, then its words, then
 * its stickers rise a little and fade in, once, as they come on screen. What
 * is already on screen when the page opens never hides, so nothing flashes.
 * Only opacity and transform change. Off under reduced motion (the page is
 * simply all there).
 */
export function useSceneReveal(main: RefObject<HTMLElement | null>, enabled: boolean) {
  useEffect(() => {
    const el = main.current
    if (!el || !enabled || typeof IntersectionObserver === 'undefined') return
    const groups: HTMLElement[][] = []
    for (const section of el.querySelectorAll<HTMLElement>('section[aria-labelledby^="scene-"]')) {
      const [photo, words] = Array.from(section.children) as HTMLElement[]
      const stickers = section.parentElement?.lastElementChild as HTMLElement | null
      groups.push([photo, words, ...(stickers && stickers !== section ? [stickers] : [])])
    }
    const ways = el.querySelector<HTMLElement>('nav[aria-label="Where to next"]')
    if (ways) groups.push([ways])

    const waiting = new Map<Element, HTMLElement[]>()
    const touched: HTMLElement[] = []
    const fold = window.innerHeight * 0.9
    for (const group of groups) {
      if (group[0].getBoundingClientRect().top < fold) continue
      group.forEach((node, i) => {
        node.style.opacity = '0'
        // The stickers only fade: their box may carry a parallax transform.
        if (i < 2) node.style.transform = 'translate3d(0, 28px, 0)'
        node.style.transition = `opacity 800ms ${EASE} ${i * 140}ms, transform 900ms ${EASE} ${i * 140}ms`
        touched.push(node)
      })
      waiting.set(group[0], group)
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const group = waiting.get(entry.target)
          if (!group) continue
          group.forEach((node, i) => {
            node.style.opacity = '1'
            if (i < 2) node.style.transform = ''
          })
          waiting.delete(entry.target)
          observer.unobserve(entry.target)
        }
      },
      { rootMargin: '0px 0px -12% 0px' }
    )
    waiting.forEach((_, target) => observer.observe(target))
    return () => {
      observer.disconnect()
      touched.forEach((node) => {
        node.style.opacity = ''
        node.style.transform = ''
        node.style.transition = ''
      })
    }
  }, [main, enabled])
}
