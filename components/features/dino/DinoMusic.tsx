'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { useHydrated } from '@/hooks/useHydrated'
import type { Music } from './music'

/**
 * The dino game's music toggle: a small button in the top right corner of the
 * game panel (an element with `data-dino-panel`) that plays "Desert Run"
 * (./music.ts) on a loop. Off by default.
 *
 * Nothing audio happens before a click: the first press creates the
 * AudioContext (inside the click, the only time browsers let sound start) and
 * loads the synth. The choice is remembered in this browser, but a visit never
 * starts the music by itself: remembered as on, the button shows it is ready
 * (a cyan dot) and the music starts with the visitor's next catch of the dino
 * or press of the button, whichever comes first.
 *
 * It fades out while the panel is off screen or the tab is hidden, and back in
 * when it returns. It never takes the game's clicks or keys: it only listens
 * (in the capture phase, without stopping anything) for a click on the dino.
 */

const KEY = 'n8-dino-music'

// The remembered choice: '1' on, '0' (or nothing) off.
const readOn = () => {
  try {
    return localStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}
const saveOn = (on: boolean) => {
  try {
    localStorage.setItem(KEY, on ? '1' : '0')
  } catch {
    // Storage blocked: the choice lasts this page view only.
  }
}
const noSubscribe = () => () => {}

export default function DinoMusic() {
  const button = useRef<HTMLButtonElement>(null)
  // Disabled until its handler exists, so an early press is never lost.
  const hydrated = useHydrated()
  const [on, setOn] = useState(false)
  // Remembered as on from an earlier visit (read after hydration).
  const remembered = useSyncExternalStore(noSubscribe, readOn, () => false)
  const ready = !on && remembered
  const engine = useRef<{
    ctx: AudioContext
    music: Music | null
    wanted: boolean
    inView: boolean
    sync: () => void
  } | null>(null)

  // Start in the visitor's click: the context is made (or woken) right here,
  // then the synth loads and plays.
  const start = () => {
    if (typeof AudioContext === 'undefined') return
    let e = engine.current
    if (!e) {
      const ctx = new AudioContext()
      const made: NonNullable<typeof engine.current> = {
        ctx,
        music: null,
        wanted: true,
        inView: true,
        sync: () => {
          if (!made.music) return
          if (made.wanted && made.inView && !document.hidden) made.music.play()
          else made.music.pause()
        },
      }
      e = engine.current = made
      void import('./music').then(({ createMusic }) => {
        if (engine.current !== made) return
        made.music = createMusic(ctx)
        made.sync()
      })
    }
    e.wanted = true
    // Woken inside the click, so it may make sound again.
    if (e.ctx.state === 'suspended') void e.ctx.resume().catch(() => {})
    // Turned back on: from the top of the loop.
    e.music?.play(true)
    saveOn(true)
    setOn(true)
  }

  const stop = () => {
    const e = engine.current
    if (e) {
      e.wanted = false
      e.sync()
    }
    saveOn(false)
    setOn(false)
  }

  // Remembered as on: the next catch of the dino starts it too.
  const startRef = useRef(start)
  useEffect(() => {
    startRef.current = start
  })
  useEffect(() => {
    const panel = button.current?.closest<HTMLElement>('[data-dino-panel]')
    if (!ready || !panel) return
    const onClick = (event: MouseEvent) => {
      if ((event.target as Element | null)?.closest?.('[data-dino]')) startRef.current()
    }
    panel.addEventListener('click', onClick, { capture: true, passive: true })
    return () => panel.removeEventListener('click', onClick, { capture: true })
  }, [ready])

  // Off screen or in a hidden tab: fade out; back: fade in again if it was on.
  useEffect(() => {
    const panel = button.current?.closest<HTMLElement>('[data-dino-panel]')
    if (!panel) return
    const observer = new IntersectionObserver((entries) => {
      const e = engine.current
      if (!e) return
      e.inView = entries.some((entry) => entry.isIntersecting)
      e.sync()
    })
    observer.observe(panel)
    const onVisibility = () => engine.current?.sync()
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      const e = engine.current
      engine.current = null
      if (e) {
        e.music?.dispose()
        if (!e.music) void e.ctx.close().catch(() => {})
      }
    }
  }, [])

  const state = on ? 'on' : ready ? 'ready' : 'off'
  return (
    <button
      ref={button}
      type="button"
      disabled={!hydrated}
      data-dino-music={state}
      aria-pressed={on}
      aria-label="Game music"
      title={on ? 'Music on: press to stop' : ready ? 'Music ready: press, or catch the dino' : 'Music off: press to play'}
      onClick={() => (on ? stop() : start())}
      className="group/music absolute top-2.5 right-2.5 z-20 flex size-[1.625rem] items-center justify-center rounded-full border border-white/10 bg-[#081427]/85 text-slate-400 backdrop-blur-sm before:absolute before:-inset-2 before:content-[''] hover:border-white/25 hover:text-slate-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 motion-safe:transition-colors data-[dino-music=on]:border-cyan-300/40 data-[dino-music=on]:text-cyan-200 data-[dino-music=ready]:text-slate-200"
    >
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
        {/* Off: struck through. */}
        <path d="M3 3l18 18" className="hidden group-data-[dino-music=off]/music:inline" />
      </svg>
      {/* Ready (remembered as on): a dot that says the next catch starts it. */}
      <span
        aria-hidden="true"
        className="absolute -top-0.5 -right-0.5 hidden size-2 rounded-full border border-[#081427] bg-cyan-300 group-data-[dino-music=ready]/music:block"
      />
    </button>
  )
}
