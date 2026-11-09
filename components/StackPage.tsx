'use client'

import React from 'react'
import { FloatingNav } from '@/components/layout/FloatingNav'
import Footer from '@/components/layout/Footer'
import TechStack from '@/components/features/TechStack'
import { subpageNavItems } from '@/data/navigation'
import { stackLayers } from '@/data/stackLayers'

/**
 * /stack (owner, 2026-11-08): the dino game as a proper play area ("I
 * constantly try to improve my tech stack"), then the whole stack by layer,
 * each tool with a line on why I use it.
 */
export default function StackPage() {
  return (
    <>
      <FloatingNav navItems={subpageNavItems} />
      <main
        id="main-content"
        tabIndex={-1}
        className="relative w-full overflow-hidden bg-darkBlue text-slate-200 focus:outline-hidden"
      >
        <div className="mx-auto max-w-md px-4 pt-28 sm:max-w-xl md:max-w-3xl md:pt-36 lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl">
          <p className="text-xs font-semibold tracking-[0.2em] text-sky-400 uppercase">Stack</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-50 sm:text-5xl">
            What I build with
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-400 md:text-lg/7">
            The AI I build with and the stack I ship on, layer by layer. Hover or tap a tile in the
            game to see what it is for, and catch the dino if you can.
          </p>

          {/* The play area: full width and tall enough on a phone for the dino
              to run along the rows and jump between them. */}
          <section
            aria-label="My tech stack, with the dino game"
            className="relative mt-8 -mx-4 h-[30rem] overflow-hidden border-y border-white/10 sm:mx-0 sm:h-[32rem] sm:rounded-3xl sm:border md:h-[34rem]"
          >
            <TechStack />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 h-28 bg-linear-to-t from-[#0d304c] via-[#0d304c]/90 to-[#0d304c]/0 px-5 pt-10 sm:px-8">
              <p className="text-sm font-bold text-slate-200 sm:text-base">I constantly try to improve</p>
              <p className="text-2xl font-bold text-white lg:text-3xl">My tech stack</p>
            </div>
          </section>

          <div className="mt-16 mb-24 flex flex-col gap-12 md:mt-20">
            {stackLayers.map((layer) => (
              <section key={layer.id} aria-labelledby={`layer-${layer.id}`}>
                <h2
                  id={`layer-${layer.id}`}
                  className="text-2xl font-bold tracking-tight text-slate-50"
                >
                  {layer.title}
                </h2>
                <p className="mt-1 text-sm text-slate-400">{layer.blurb}</p>
                <ul data-stack-layer className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {layer.items.map((tech) => (
                    <li
                      key={tech.name}
                      className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/3 p-4"
                    >
                      <span aria-hidden="true" className="mt-0.5 flex size-6 shrink-0 *:size-full!">
                        {tech.icon}
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-100">{tech.name}</p>
                        <p className="mt-0.5 text-sm leading-snug text-slate-400">
                          {tech.description}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
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
