'use client'

import React from 'react'
import Image from 'next/image'
import { Briefcase, Monitor, TreePalm } from 'lucide-react'
import { FloatingNav } from '@/components/layout/FloatingNav'
import Footer from '@/components/layout/Footer'
import PauseOffscreen from '@/components/ui/PauseOffscreen'
import Decals from '@/components/about/Decals'
import { subpageNavItems } from '@/data/navigation'
import { aboutPortrait, aboutScenes, type AboutPhoto, type AboutScene } from '@/data/about'
import { TECH_FOR_PROS } from '@/lib/sites'

const LINK =
  'font-semibold text-sky-400 underline decoration-sky-400/40 underline-offset-4 hover:text-sky-300 hover:decoration-sky-300 transition-colors duration-200'

/** A link out, in the About copy. */
const Out = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className={LINK}>
    {children}
  </a>
)

/** Each scene's story. Kept here, beside the links it needs; its photo is in data/about.tsx. */
const BODIES: Record<string, React.ReactNode> = {
  work: (
    <>
      <p>
        These days I consult on AI and build <Out href={TECH_FOR_PROS.url}>{TECH_FOR_PROS.name}</Out>,
        a platform for service businesses: pool, HVAC, landscaping and the like. It turns a few
        details about a business into a launch-ready website, then takes the follow-up off their
        plate: lead capture, reviews, reminders and missed-call text-back.
      </p>
      <p>Before that I spent three years building client apps at a consulting firm.</p>
    </>
  ),
  la: (
    <>
      <p>
        I live in Los Angeles, and I&apos;m ready to relocate for the right role.
      </p>
      <p>
        Part of my week I teach JavaScript, Python and app development at The Coder School in Santa
        Monica: how to debug, and how to use AI coding tools responsibly.
      </p>
    </>
  ),
  setup: (
    <>
      <p>
        In my free time I build in public on <Out href="https://n8builds.dev">n8builds.dev</Out>.
        That&apos;s where the tools I use daily live: Scribe, my local dictation app for Windows,
        and OpenPing, my uptime monitor, plus Solara and a few Chrome extensions, all free and open
        source.
      </p>
      <p>Next up: streaming the builds live.</p>
    </>
  ),
}

const MOOD_ICON = { work: Briefcase, la: TreePalm, setup: Monitor }

/**
 * A scene's photo, or until it arrives a placeholder in the same 4:3 frame:
 * the scene's icon on a soft sky wash. Swapping in the photo changes nothing
 * around it (set `src` in data/about.tsx).
 */
function ScenePhoto({ photo, mood }: { photo: AboutPhoto; mood: AboutScene['mood'] }) {
  const Icon = MOOD_ICON[mood]
  return (
    <div className="relative aspect-4/3 overflow-hidden rounded-3xl ring-1 ring-white/10 shadow-xl shadow-black/40">
      {photo.src ? (
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          sizes="(max-width: 768px) 100vw, 32rem"
          className="object-cover"
        />
      ) : (
        <div
          data-photo-placeholder={mood}
          role="img"
          aria-label={`${photo.alt} (photo to come)`}
          className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[radial-gradient(circle_at_30%_20%,rgba(56,189,248,0.22),transparent_60%),linear-gradient(135deg,#0c4a6e_0%,#0b1324_70%)]"
        >
          <div className="absolute inset-3 rounded-[1.25rem] border border-dashed border-sky-300/25" />
          <Icon className="h-12 w-12 text-sky-300/80" strokeWidth={1.5} aria-hidden="true" />
          <p className="text-xs font-semibold tracking-[0.18em] text-sky-200/70 uppercase">
            Photo to come
          </p>
        </div>
      )}
    </div>
  )
}

/**
 * The About page, only about me (owner, 2026-11-08): one portrait and the
 * opening, then the story in a few photo scenes (at work, in LA, the setup),
 * with stickers drifting around them. The work itself (projects, experience,
 * stack) lives on the home page and its detail pages.
 */
export default function AboutPage() {
  return (
    <>
      <FloatingNav navItems={subpageNavItems} />
      <main
        id="main-content"
        tabIndex={-1}
        className="relative w-full overflow-hidden bg-darkBlue text-slate-200 focus:outline-hidden"
      >
        <div className="mx-auto max-w-md px-4 pt-28 sm:max-w-xl md:max-w-3xl md:pt-36 lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl">
          <PauseOffscreen className="relative">
            <section
              aria-labelledby="about-heading"
              className="relative flex flex-col-reverse gap-10 md:flex-row md:items-center md:gap-14"
            >
              <div className="md:flex-1">
                <p className="text-xs font-semibold tracking-[0.2em] text-sky-400 uppercase">
                  Get to know me
                </p>
                <h1
                  id="about-heading"
                  className="mt-3 text-4xl font-bold tracking-tight text-slate-50 sm:text-5xl"
                >
                  About me
                </h1>
                <p className="mt-6 max-w-2xl text-lg leading-relaxed text-pretty text-slate-300 md:text-xl/8">
                  I&apos;m Nathan, a full-stack developer in Los Angeles, and I&apos;m all in on AI.
                  Building things people actually find useful has always mattered most to me, and
                  getting to do so much more of it with AI feels like a blessing.
                </p>
              </div>
              <figure className="relative mx-auto w-56 shrink-0 sm:w-64 md:mx-0 md:w-72 lg:w-80">
                <div className="absolute inset-0 scale-105 rounded-3xl bg-linear-to-br from-cyan-500/25 to-blue-600/25 blur-xl" />
                <div className="relative aspect-4/5 overflow-hidden rounded-3xl ring-1 ring-white/10 shadow-xl shadow-black/40">
                  <Image
                    src={aboutPortrait.src}
                    alt={aboutPortrait.alt}
                    fill
                    priority
                    sizes="(max-width: 640px) 14rem, (max-width: 768px) 16rem, 20rem"
                    className="object-cover object-top"
                  />
                </div>
              </figure>
            </section>
            <Decals mood="intro" />
          </PauseOffscreen>

          <div className="mt-24 mb-24 flex flex-col gap-24 md:mt-32 md:gap-32">
            {aboutScenes.map((scene, i) => (
              <PauseOffscreen key={scene.id} className="relative">
                <section
                  aria-labelledby={`scene-${scene.id}`}
                  className={`relative flex flex-col gap-8 md:items-center md:gap-14 ${i % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row'}`}
                >
                  <div className="w-full md:w-1/2 md:shrink-0">
                    <ScenePhoto photo={scene.photo} mood={scene.mood} />
                  </div>
                  <div className="md:flex-1">
                    <p className="text-xs font-semibold tracking-[0.2em] text-sky-400 uppercase">
                      {scene.eyebrow}
                    </p>
                    <h2
                      id={`scene-${scene.id}`}
                      className="mt-3 text-3xl font-bold tracking-tight text-slate-50 sm:text-4xl"
                    >
                      {scene.title}
                    </h2>
                    <div className="mt-5 space-y-4 text-lg leading-relaxed text-pretty text-slate-300 md:text-lg/8">
                      {BODIES[scene.id]}
                    </div>
                  </div>
                </section>
                <Decals mood={scene.mood} />
              </PauseOffscreen>
            ))}
          </div>
        </div>
        <div className="mx-auto max-w-md sm:max-w-xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl">
          <Footer />
        </div>
      </main>
    </>
  )
}
