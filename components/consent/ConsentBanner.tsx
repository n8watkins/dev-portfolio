'use client'

import { useEffect, useId, useRef } from 'react'
import { FiCheck } from 'react-icons/fi'
import { LuCookie } from 'react-icons/lu'
import { getConsent, type ConsentChoice } from '@/lib/consent'

/**
 * The analytics consent banner: a bar centred at the bottom of the screen
 * (text left, buttons right from sm up; stacked on phones). It never blocks
 * the page: no backdrop, no scroll lock, no focus trap. Accept is the larger,
 * brand-coloured button (the owner's choice, 2026-10-26); Decline is a
 * smaller secondary button beside it, still solid, readable (AA) and one
 * click away.
 */
export default function ConsentBanner({ fromSettings, onClose }: { fromSettings: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const bodyId = useId()
  const consent = getConsent()
  const current = consent?.state

  // Opened from "Cookie settings": move focus to the bar itself (not to
  // either button, so neither is favoured), and Escape closes it.
  useEffect(() => {
    if (!fromSettings) return
    ref.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [fromSettings, onClose])

  // Where the bar reaches the bottom-right corner (phones and narrower
  // laptops), the floating scroll-to-top button rises above it while it's
  // open (--consent-banner-h).
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const root = document.documentElement
    const update = () => {
      const rect = el.getBoundingClientRect()
      const reachesCorner = rect.right > window.innerWidth - 88
      root.style.setProperty('--consent-banner-h', reachesCorner ? `${window.innerHeight - rect.top}px` : '0px')
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    window.addEventListener('resize', update)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', update)
      root.style.removeProperty('--consent-banner-h')
    }
  }, [])

  const choose = (choice: ConsentChoice) => {
    getConsent()?.set(choice)
    onClose()
  }

  const focusRing = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300'

  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      aria-describedby={bodyId}
      tabIndex={-1}
      className="consent-in outline-none fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom,0px))] z-[60] mx-auto max-w-[62rem] rounded-2xl border border-cyan-400/25 bg-[#07101f]/95 p-5 text-slate-300 shadow-[0_22px_60px_-12px_rgba(0,0,0,0.85)] backdrop-blur-md sm:bottom-6 sm:flex sm:items-center sm:gap-8 sm:px-7 sm:py-6"
    >
      <div className="min-w-0 flex-1">
        <h2 id={titleId} className="flex items-center gap-2 text-[1.05rem] font-bold text-slate-50">
          <LuCookie aria-hidden="true" className="h-5 w-5 shrink-0 text-cyan-300" />
          Cookies
        </h2>
        <p id={bodyId} className="mt-1.5 text-[0.92rem] leading-relaxed text-slate-400">
          I use cookies to understand how people use the site so I can improve it. No ads. The site works the
          same either way.{' '}
          {/* This site has no privacy page of its own: n8builds.dev's covers both sites. */}
          <a
            href="https://n8builds.dev/privacy#cookies"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-300 underline underline-offset-2 hover:text-cyan-200"
          >
            Privacy<span className="sr-only"> (opens in a new tab)</span>
          </a>
        </p>
        {fromSettings && current && current !== 'pending' && (
          <p className="mt-1.5 font-mono text-[0.75rem] text-slate-400">
            Currently: {current === 'granted' ? 'accepted' : 'declined'}
            {consent?.gpc && ' (Global Privacy Control)'}
          </p>
        )}
      </div>
      {/* Accept is the inviting one (the owner's call); Decline stays a real,
          readable button right beside it. */}
      <div className="mt-4 flex shrink-0 items-center gap-3 sm:mt-0">
        <button
          type="button"
          className={`cursor-pointer rounded-xl border border-slate-500/70 bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-100 transition-colors hover:bg-slate-700 ${focusRing}`}
          onClick={() => choose('denied')}
        >
          Decline
        </button>
        <button
          type="button"
          className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-cyan-300/40 bg-gradient-to-r from-blue-600 to-cyan-700 px-7 py-3 text-base font-bold text-white shadow-lg shadow-cyan-950/60 transition-colors hover:from-blue-700 hover:to-cyan-800 sm:flex-none ${focusRing}`}
          onClick={() => choose('granted')}
        >
          <FiCheck aria-hidden="true" className="h-5 w-5" />
          Accept
        </button>
      </div>
    </div>
  )
}
