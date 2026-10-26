'use client'

import { useEffect, useId, useRef } from 'react'
import { FiBarChart2 } from 'react-icons/fi'
import { getConsent, type ConsentChoice } from '@/lib/consent'

/**
 * The analytics consent banner: a compact bar centred at the bottom of the
 * screen (text left, buttons right from sm up; stacked on phones). It never
 * blocks the page: no backdrop, no scroll lock, no focus trap. Accept wears
 * the brand colour and Decline is a solid neutral button of the same size,
 * font and weight beside it, so declining is as easy as accepting.
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

  const button =
    'flex-1 cursor-pointer rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 sm:min-w-[7.5rem] sm:flex-none'

  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      aria-describedby={bodyId}
      tabIndex={-1}
      className="consent-in outline-none fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom,0px))] z-[60] mx-auto max-w-[52rem] rounded-2xl border border-cyan-400/20 bg-[#07101f]/95 p-4 text-slate-300 shadow-[0_18px_50px_-12px_rgba(0,0,0,0.8)] backdrop-blur-md sm:bottom-5 sm:flex sm:items-center sm:gap-6 sm:px-5"
    >
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <span
          aria-hidden="true"
          className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-cyan-400/25 bg-cyan-400/10 text-cyan-300"
        >
          <FiBarChart2 className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <h2 id={titleId} className="text-[0.95rem] font-bold text-slate-50">
            Cookies
          </h2>
          <p id={bodyId} className="mt-0.5 text-[0.85rem] leading-relaxed text-slate-400">
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
            <p className="mt-1 font-mono text-[0.72rem] text-slate-400">
              Currently: {current === 'granted' ? 'accepted' : 'declined'}
              {consent?.gpc && ' (Global Privacy Control)'}
            </p>
          )}
        </div>
      </div>
      <div className="mt-3.5 flex shrink-0 gap-2.5 sm:mt-0">
        <button
          type="button"
          className={`${button} border border-slate-500/60 bg-slate-700 hover:bg-slate-600`}
          onClick={() => choose('denied')}
        >
          Decline
        </button>
        <button
          type="button"
          className={`${button} border border-cyan-400/30 bg-gradient-to-r from-blue-600 to-cyan-700 hover:from-blue-700 hover:to-cyan-800`}
          onClick={() => choose('granted')}
        >
          Accept
        </button>
      </div>
    </div>
  )
}
