'use client'
import React from 'react'
import Image from 'next/image'
import { motion } from 'motion/react'
import { TECH_FOR_PROS } from '@/lib/sites'

const LINK =
  'font-semibold text-sky-400 underline decoration-sky-400/40 underline-offset-4 hover:text-sky-300 hover:decoration-sky-300 transition-colors duration-200'

/** A link out, in the About copy. */
const Out = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className={LINK}>
    {children}
  </a>
)

const PHOTOS = [
  { src: '/hero/portrait.jpg', alt: 'Photo of Nathan Watkins' },
  { src: '/hero/portrait-watercolor.jpg', alt: 'Watercolor portrait of Nathan' },
]

/**
 * The About page's story: the full copy beside two portraits (the photo and
 * its watercolor). The home page shows a short teaser instead (AboutTeaser).
 */
export default function AboutStory() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col-reverse gap-10 md:flex-row md:items-start md:gap-14"
    >
      <div className="max-w-3xl space-y-5 text-pretty text-lg leading-relaxed text-slate-300 md:flex-1 md:text-xl/8">
          <p>
            I&apos;m Nathan, a full-stack developer in Los Angeles, and I&apos;m all in on AI.
            Building things people actually find useful has always mattered most to me, and
            getting to do so much more of it with AI feels like a blessing.
          </p>
          <p>
            These days I consult on AI and build{' '}
            <Out href={TECH_FOR_PROS.url}>{TECH_FOR_PROS.name}</Out>, a platform for service
            businesses: pool, HVAC, landscaping and the like. It turns a few details about a
            business into a launch-ready website, then takes the follow-up off their plate: lead
            capture, reviews, reminders and missed-call text-back. Before that I spent three years
            building client apps at a consulting firm.
          </p>
          <p>
            In my free time I build in public on{' '}
            <Out href="https://n8builds.dev">n8builds.dev</Out>. That&apos;s where the tools I use
            daily live: Scribe, my local dictation app for Windows, and OpenPing, my uptime
            monitor, plus Solara and a few Chrome extensions, all free and open source. Next up:
            streaming the builds live.
          </p>
        </div>
      <div className="grid w-full max-w-sm grid-cols-2 gap-4 self-center md:w-80 md:max-w-none md:shrink-0 md:grid-cols-1 lg:w-88">
        {PHOTOS.map((photo, i) => (
          <figure key={photo.src} className={i === 1 ? 'md:ml-12 md:-mt-6' : 'md:mr-12'}>
            <div className="relative aspect-4/5 overflow-hidden rounded-3xl ring-1 ring-white/10 shadow-xl shadow-black/40">
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(max-width: 768px) 45vw, 18rem"
                priority={i === 0}
                className="object-cover object-top"
              />
            </div>
          </figure>
        ))}
      </div>
    </motion.div>
  )
}
