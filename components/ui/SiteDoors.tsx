import React from 'react'
import Image from 'next/image'
import { FiArrowUpRight } from 'react-icons/fi'

/**
 * The two sites this one leads to, each in its own brand: n8builds.dev's
 * cyan-to-blue and its N8 mark, Appturnity's white-to-light-blue and its A.
 * A gradient hairline frames each card, and a soft glow in the brand's colour
 * always surrounds it; on hover (or keyboard focus) the brand's colour washes
 * in, the glow brightens, the mark grows a touch and the arrow nudges out.
 * CSS only. In the hero, and again in the footer.
 *
 * The two cards are the same height (the grid stretches them) and each one's
 * tag sits at its foot, so the tags line up whatever the pitch's length.
 */
const doors = [
  {
    href: 'https://n8builds.dev',
    eyebrow: 'I build in public',
    name: 'n8builds.dev',
    icon: '/tab/n8-icon.png',
    pitch: 'Try my free tools, then fork one and make it your own.',
    detail: '7 builds · all open source',
    frame:
      'from-cyan-400/50 via-blue-500/30 to-blue-600/50 group-hover:from-cyan-300 group-hover:to-blue-500',
    wash: 'from-cyan-500/25 via-blue-600/10',
    eyebrowText: 'from-cyan-300 to-blue-400',
    dot: 'bg-emerald-400',
    glow: 'shadow-[0_0_28px_-6px_rgba(34,211,238,0.35)] hover:shadow-[0_0_36px_-4px_rgba(34,211,238,0.5)]',
  },
  {
    href: 'https://appturnity.com',
    eyebrow: 'My company',
    name: 'Appturnity',
    icon: '/brands/appturnity.png',
    pitch: "Run a service business? We'll do your website and automate the busywork.",
    detail: 'Free websites and AI automations',
    frame:
      'from-white/40 via-sky-300/25 to-[#1066f4]/50 group-hover:from-white/80 group-hover:to-[#1066f4]',
    wash: 'from-sky-300/20 via-[#1066f4]/15',
    eyebrowText: 'from-white to-sky-300',
    dot: 'bg-[#1066f4]',
    glow: 'shadow-[0_0_28px_-6px_rgba(16,102,244,0.45)] hover:shadow-[0_0_36px_-4px_rgba(16,102,244,0.6)]',
  },
]

export default function SiteDoors({
  className = '',
  style,
}: {
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <div className={`grid grid-cols-1 gap-3.5 sm:grid-cols-2 ${className}`} style={style}>
      {doors.map((door) => (
        <a
          key={door.href}
          href={door.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`group relative block rounded-2xl bg-gradient-to-br p-px text-left transition-all duration-300 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${door.frame} ${door.glow}`}
        >
          <span className="relative flex h-full flex-col overflow-hidden rounded-[15px] bg-[#0b1324] p-4">
            {/* The brand's colour, washing in from the top left on hover */}
            <span
              aria-hidden="true"
              className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${door.wash} to-transparent opacity-30 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100`}
            />
            <span className="relative flex items-center gap-3">
              <Image
                src={door.icon}
                alt=""
                width={36}
                height={36}
                className="h-9 w-9 shrink-0 rounded-lg object-contain transition-transform duration-300 group-hover:scale-110"
              />
              <span className="min-w-0 flex-1">
                <span
                  className={`block bg-gradient-to-r ${door.eyebrowText} bg-clip-text text-[0.65rem] font-bold uppercase tracking-[0.14em] text-transparent`}
                >
                  {door.eyebrow}
                </span>
                <span className="block text-base font-bold text-slate-50">{door.name}</span>
              </span>
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-300 transition-all duration-300 group-hover:border-white/30 group-hover:bg-white/10 group-hover:text-white">
                <FiArrowUpRight
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  aria-hidden="true"
                />
              </span>
            </span>
            <span className="relative mt-2.5 block flex-1 text-pretty text-sm leading-snug text-slate-300">
              {door.pitch}
            </span>
            <span className="relative mt-3 inline-flex w-fit items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-xs font-medium text-slate-300">
              <span className={`h-1.5 w-1.5 rounded-full ${door.dot}`} aria-hidden="true" />
              {door.detail}
            </span>
          </span>
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      ))}
    </div>
  )
}
