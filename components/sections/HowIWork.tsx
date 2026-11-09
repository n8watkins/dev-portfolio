import React from 'react'
import { FiCpu, FiCheckCircle, FiGithub } from 'react-icons/fi'

/**
 * How I work, in three short tiles: each a claim the sites themselves back up
 * (the apps on this page, the CI on every pull request, the open repos).
 */
const POINTS = [
  {
    Icon: FiCpu,
    title: 'AI in the product and the workflow',
    body: 'Assistants that talk, research and remember, and recommenders that learn your taste, in the apps I build; AI pair-programming in how I ship them.',
  },
  {
    Icon: FiCheckCircle,
    title: 'Tested like a product',
    body: 'Every pull request runs lint, types, a production build and browser tests on five browsers before it deploys.',
  },
  {
    Icon: FiGithub,
    title: 'Built in public',
    body: 'My side projects are open source on n8builds.dev, each with the story of how I made it. This site too.',
  },
]

export default function HowIWork({ className = '' }: { className?: string }) {
  return (
    <ul className={`grid gap-4 sm:grid-cols-3 ${className}`}>
      {POINTS.map(({ Icon, title, body }) => (
        <li
          key={title}
          className="rounded-2xl border border-white/10 bg-linear-to-br from-[#0c4a6e]/40 via-darkBlue to-darkBlue p-5"
        >
          <Icon className="h-6 w-6 text-sky-400" aria-hidden="true" />
          <p className="mt-3 text-base font-bold text-slate-100">{title}</p>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{body}</p>
        </li>
      ))}
    </ul>
  )
}
