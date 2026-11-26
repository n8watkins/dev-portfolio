'use client'

import { useEffect } from 'react'

/**
 * Links to a project's card on the home page (`/#project-<slug>`, from the tech
 * stack's tiles: data/stack.tsx's stackLinkHref): owner, 2026-11-25, "scroll us
 * down to the projects".
 *
 * On the home page a click on one scrolls smoothly to the card (a jump under
 * reduced motion), puts the address's hash on it so it can be shared, gives
 * the card a short highlight so the eye lands on it, and moves focus to it, so
 * the next Tab goes into the card. From another page the link loads the home
 * page with the hash, and the card is landed on the same way once the lazy
 * Projects section has rendered it.
 *
 * When it has landed, the anchor carries `data-landed` (and
 * `data-project-highlight` for a moment, styled in app/globals.css), which the tests wait for instead of measuring mid-scroll.
 */

const PREFIX = '#project-'
/** Below the fixed nav (the page's scroll-padding-top is 80px), with some air. */
export const PROJECT_LANDING_OFFSET = 96
const HIGHLIGHT_MS = 2000
/** How long to wait for the lazy Projects section, and for the scroll to settle. */
const PATIENCE_MS = 5000

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

let cancelLanding: (() => void) | null = null

/** Scroll to the card, wait for the scroll to settle (re-aiming if the page moved under it), then mark it landed. */
function land(el: HTMLElement) {
  cancelLanding?.()
  let frame = 0
  let timer = 0
  cancelLanding = () => {
    cancelAnimationFrame(frame)
    clearTimeout(timer)
  }
  for (const other of document.querySelectorAll('[data-project-anchor][data-landed]')) other.removeAttribute('data-landed')
  const target = () => Math.max(0, el.getBoundingClientRect().top + window.scrollY - PROJECT_LANDING_OFFSET)
  window.scrollTo({ top: target(), behavior: reducedMotion() ? 'instant' : 'smooth' })
  const started = performance.now()
  let last = Number.NaN
  let still = 0
  let corrections = 0
  const settle = () => {
    still = Math.abs(window.scrollY - last) < 0.5 ? still + 1 : 0
    last = window.scrollY
    const late = performance.now() - started > PATIENCE_MS
    if (still < 6 && !late) {
      frame = requestAnimationFrame(settle)
      return
    }
    // Late content (images, the reveal of the sections above) can move the
    // card while the page scrolls: aim again, at once, a few times at most.
    const reachable = document.documentElement.scrollHeight - window.innerHeight >= target() - 1
    if (Math.abs(window.scrollY - target()) > 4 && reachable && corrections < 3 && !late) {
      corrections++
      still = 0
      window.scrollTo({ top: target(), behavior: 'instant' })
      frame = requestAnimationFrame(settle)
      return
    }
    el.focus({ preventScroll: true })
    el.setAttribute('data-landed', '')
    el.setAttribute('data-project-highlight', '')
    timer = window.setTimeout(() => el.removeAttribute('data-project-highlight'), HIGHLIGHT_MS)
    cancelLanding = null
  }
  frame = requestAnimationFrame(settle)
}

/** Land on the card the hash names, once the lazy Projects section has rendered it. */
function landOnHash(hash: string) {
  if (!hash.startsWith(PREFIX)) return () => {}
  const id = decodeURIComponent(hash.slice(1))
  const started = performance.now()
  let frame = 0
  const find = () => {
    const el = document.getElementById(id)
    if (el && el.offsetHeight > 100) return land(el)
    if (performance.now() - started < PATIENCE_MS) frame = requestAnimationFrame(find)
  }
  find()
  return () => cancelAnimationFrame(frame)
}

/** The home page's handling of `/#project-<slug>` links (app/page.tsx). */
export function useProjectAnchors() {
  useEffect(() => {
    const stop = landOnHash(window.location.hash)
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const link = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null
      if (!link || link.target === '_blank') return
      const url = new URL(link.href)
      if (url.origin !== window.location.origin || url.pathname !== '/' || !url.hash.startsWith(PREFIX)) return
      const el = document.getElementById(decodeURIComponent(url.hash.slice(1)))
      if (!el) return
      e.preventDefault()
      // Shareable: the address names the card. A fresh entry, so Back returns to where the link was.
      if (window.location.hash !== url.hash) window.history.pushState(window.history.state, '', url.hash)
      land(el)
    }
    // Back and Forward between cards, or a hash typed into the address.
    const onHashChange = () => landOnHash(window.location.hash)
    document.addEventListener('click', onClick)
    window.addEventListener('hashchange', onHashChange)
    return () => {
      stop()
      cancelLanding?.()
      document.removeEventListener('click', onClick)
      window.removeEventListener('hashchange', onHashChange)
    }
  }, [])
}
