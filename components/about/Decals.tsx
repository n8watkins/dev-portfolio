import React from 'react'
import {
  Briefcase,
  Code,
  Coffee,
  GraduationCap,
  Keyboard,
  Mic,
  Rocket,
  Sparkles,
  Sun,
  TreePalm,
  Waves,
  Zap,
} from 'lucide-react'
import type { AboutScene } from '@/data/about'

type Icon = React.ComponentType<{ className?: string; strokeWidth?: number }>

interface Decal {
  Icon: Icon
  /** Where it sits in the scene: absolute, so it never moves the layout. */
  at: string
  /** Its resting tilt. */
  tilt: number
  /** Seconds per drift, and the head start, so they never move in step. */
  dur: number
  delay: number
  /** Shown on phones too (the rest only from sm, where there is room). */
  phone?: boolean
}

/**
 * The stickers that drift around each About scene (owner, 2026-11-08): small
 * tilted badges in the site's sky blue, each picking up its scene (work, LA,
 * the setup). They drift slowly (`.decal` in globals.css), hold still under
 * reduced motion, and pause off screen inside a PauseOffscreen box. Absolute
 * and pointer-transparent, so they shift nothing and block nothing.
 */
const DECALS: Record<AboutScene['mood'] | 'intro', Decal[]> = {
  intro: [
    { Icon: Sparkles, at: '-top-3 right-4 md:right-[44%]', tilt: -10, dur: 11, delay: 0, phone: true },
    { Icon: Code, at: '-bottom-3 left-4 md:left-[36%]', tilt: 8, dur: 13, delay: -4 },
  ],
  work: [
    { Icon: Briefcase, at: '-top-4 left-4', tilt: -8, dur: 12, delay: -2, phone: true },
    { Icon: Zap, at: 'top-1/2 right-[52%]', tilt: 12, dur: 10, delay: -6 },
    { Icon: Coffee, at: '-bottom-4 left-[42%]', tilt: -6, dur: 14, delay: -1 },
  ],
  la: [
    { Icon: TreePalm, at: '-top-4 right-4', tilt: 9, dur: 13, delay: -3, phone: true },
    { Icon: Sun, at: 'top-1/3 left-[52%]', tilt: -12, dur: 11, delay: -7 },
    { Icon: GraduationCap, at: '-bottom-4 right-[42%]', tilt: 6, dur: 12, delay: 0 },
    { Icon: Waves, at: '-bottom-4 right-6', tilt: -4, dur: 15, delay: -5 },
  ],
  setup: [
    { Icon: Keyboard, at: '-top-4 left-4', tilt: -6, dur: 12, delay: -1, phone: true },
    { Icon: Mic, at: 'top-1/2 right-[52%]', tilt: 10, dur: 10, delay: -5 },
    { Icon: Rocket, at: '-bottom-4 left-[42%]', tilt: -12, dur: 13, delay: -8 },
  ],
}

export default function Decals({ mood }: { mood: keyof typeof DECALS }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-20">
      {DECALS[mood].map(({ Icon, at, tilt, dur, delay, phone }, i) => (
        <span
          key={i}
          className={`decal absolute ${at} ${phone ? 'flex' : 'hidden md:flex'} h-10 w-10 items-center justify-center rounded-2xl border-2 border-white/90 bg-sky-400 text-[#06223a] shadow-lg shadow-black/40 sm:h-11 sm:w-11`}
          style={
            {
              '--tilt': `${tilt}deg`,
              animationDuration: `${dur}s`,
              animationDelay: `${delay}s`,
            } as React.CSSProperties
          }
        >
          <Icon className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.25} />
        </span>
      ))}
    </div>
  )
}
