'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { FiArrowUpRight, FiGithub } from 'react-icons/fi'
import { FaTwitch, FaYoutube, FaXTwitter } from 'react-icons/fa6'
import { staggerContainerVariants, staggerItemVariants, defaultAnimationConfig } from '@/lib/animations'

const followLinks = [
  {
    label: 'Twitch',
    href: 'https://twitch.tv/n8builds',
    icon: <FaTwitch className="w-full h-full p-3" aria-hidden="true" />,
  },
  {
    label: 'YouTube',
    href: 'https://youtube.com/@n8builds',
    icon: <FaYoutube className="w-full h-full p-3" aria-hidden="true" />,
  },
  {
    label: 'X (Twitter)',
    href: 'https://x.com/n8watkins',
    icon: <FaXTwitter className="w-full h-full p-3" aria-hidden="true" />,
  },
  {
    label: 'GitHub',
    href: 'https://github.com/n8watkins',
    icon: <FiGithub className="w-full h-full p-3" aria-hidden="true" />,
  },
]

/**
 * Brand / "digital card" section: Appturnity (consulting) and n8builds.dev
 * (build-in-public log) - the two places this site funnels visitors.
 */
const AppturnityCard = () => {
  return (
    <div className="relative pb-10 px-4 xl:max-w-6xl 2xl:max-w-7xl m-auto select-none">
      <motion.div
        variants={staggerContainerVariants}
        {...defaultAnimationConfig}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">

        {/* Appturnity - consulting */}
        <motion.div
          variants={staggerItemVariants}
          className="group rounded-xl overflow-hidden bg-slate-900/30 border border-white/5 shadow-xl shadow-black/30 hover:bg-white/10 hover:border-white/40 hover:shadow-2xl hover:shadow-white/20 transition-all duration-300 flex flex-col">
          <a
            href="https://appturnity.com/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Visit Appturnity"
            className="relative block aspect-[16/8] overflow-hidden">
            <Image
              src="/brand/appturnity-site.webp"
              alt="The Appturnity website"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-top group-hover:scale-[1.02] transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
          </a>
          <div className="p-6 md:p-8 flex flex-col flex-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-sky-400 mb-2">
              Consulting
            </p>
            <div className="flex items-center gap-3">
              {/* Appturnity brand mark - "A" monogram (swap for the real logo when available) */}
              <span
                aria-hidden="true"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#3b8bff] to-[#1d6fe0] text-xl font-bold text-white shadow-lg shadow-blue-500/30 group-hover:from-[#4f97ff] group-hover:to-[#2a78f0] transition-colors duration-300">
                A
              </span>
              <h3 className="text-2xl md:text-3xl font-bold text-slate-100">Appturnity</h3>
            </div>
            <p className="text-sm md:text-base text-slate-400 leading-relaxed mt-3 mb-6 flex-1">
              My consulting company - custom apps and AI automation for small businesses,
              from healthcare to property management to HVAC. The current obsession is{' '}
              <span className="text-slate-200 font-semibold">SiteForge</span>: an engine
              that audits local businesses and auto-builds each one a polished,
              ready-to-launch website, then turns that into an ongoing care plan.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="https://appturnity.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-700 text-sm text-slate-300 hover:text-sky-400 hover:border-sky-400/60 transition-colors duration-200">
                appturnity.com
                <FiArrowUpRight className="w-4 h-4" aria-hidden="true" />
              </a>
              <a
                href="mailto:nathancwatkins23@gmail.com?subject=Consulting%20inquiry"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-sky-500/15 border border-sky-500/30 text-sm text-sky-300 hover:bg-sky-500/25 hover:border-sky-400/60 cursor-pointer transition-colors duration-200">
                Need something built?
              </a>
            </div>
          </div>
        </motion.div>

        {/* n8builds.dev - build in public */}
        <motion.div
          variants={staggerItemVariants}
          className="group rounded-xl overflow-hidden bg-slate-900/30 border border-white/5 shadow-xl shadow-black/30 hover:border-sky-400/20 hover:shadow-2xl hover:shadow-sky-500/25 transition-all duration-300 flex flex-col">
          <a
            href="https://n8builds.dev"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Visit n8builds.dev"
            className="relative block aspect-[16/8] overflow-hidden bg-[#050812]">
            {/* Brand visual - cyan-to-blue wordmark on deep navy */}
            <div className="absolute inset-0 bg-grid-white/[0.04]" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <span className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600 group-hover:from-cyan-300 group-hover:to-blue-500 transition-colors duration-300">
                n8builds.dev
              </span>
              <span className="text-xs uppercase tracking-[0.3em] text-slate-400">
                Build log
              </span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent pointer-events-none" />
          </a>
          <div className="p-6 md:p-8 flex flex-col flex-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-sky-400 mb-2">
              Follow the work
            </p>
            <div className="flex items-center gap-3">
              {/* n8builds brand icon */}
              <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl">
                <Image
                  src="/tab/n8-icon.png"
                  alt=""
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              </span>
              <h3 className="text-2xl md:text-3xl font-bold text-slate-100">n8builds.dev</h3>
            </div>
            <p className="text-sm md:text-base text-slate-400 leading-relaxed mt-3 mb-6 flex-1">
              My build log. I&apos;m making a whole lot of things at once - AI products,
              automations, dev tools - and shipping them in public. Sometimes I&apos;m live
              while I do it: catch the streams on Twitch and YouTube.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <a
                href="https://n8builds.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-700 text-sm text-slate-300 hover:text-sky-400 hover:border-sky-400/60 transition-colors duration-200 mr-1">
                n8builds.dev
                <FiArrowUpRight className="w-4 h-4" aria-hidden="true" />
              </a>
              {followLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Follow Nathan on ${social.label}`}
                  className="w-11 h-11 rounded-full text-slate-300 hover:text-sky-400 hover:bg-slate-700/70 transition-colors duration-200">
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default AppturnityCard
