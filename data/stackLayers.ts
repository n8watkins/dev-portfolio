import { ai_agents, ai_tools, dev_stack, type AIStackItem } from './stack'

/**
 * The stack grouped by layer, for /stack. The tiles and their one-line reasons
 * come from data/stack.tsx (shared byte for byte with n8builds-web, so it is
 * not edited here); this file only sorts them into layers by name.
 */
const all = [...ai_agents, ...ai_tools, ...dev_stack]
const pick = (names: string[]): AIStackItem[] =>
  names.map((name) => {
    const item = all.find((t) => t.name === name)
    if (!item) throw new Error(`data/stackLayers.ts: no tile named "${name}" in data/stack.tsx`)
    return item
  })

export interface StackLayer {
  id: string
  title: string
  blurb: string
  items: AIStackItem[]
}

export const stackLayers: StackLayer[] = [
  {
    id: 'ai',
    title: 'AI agents and models',
    blurb: 'Who I build with, and the models inside what I build.',
    items: ai_agents,
  },
  {
    id: 'local-ai',
    title: 'Local AI',
    blurb: 'Models that run on your own machine.',
    items: ai_tools,
  },
  {
    id: 'frontend',
    title: 'Frontend',
    blurb: 'The web apps themselves.',
    items: pick(['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'ShadCN', 'Zod', 'Vite']),
  },
  {
    id: 'data',
    title: 'Data',
    blurb: 'Where the data lives, and how it is queried.',
    items: pick(['PostgreSQL', 'Turso', 'Drizzle', 'Firebase', 'Sanity', 'Upstash']),
  },
  {
    id: 'cloud',
    title: 'Hosting and cloud',
    blurb: 'Where it runs.',
    items: pick(['Vercel', 'Cloudflare', 'AWS', 'Google Cloud']),
  },
  {
    id: 'auth',
    title: 'Sign-in',
    blurb: 'Accounts, done properly.',
    items: pick(['Clerk', 'NextAuth']),
  },
  {
    id: 'quality',
    title: 'Quality and shipping',
    blurb: 'How it stays working.',
    items: pick(['Playwright', 'GitHub Actions', 'ESLint', 'Prettier', 'Git', 'Sentry', 'Google Analytics']),
  },
  {
    id: 'design',
    title: 'Design',
    blurb: 'Before the code, when it needs it.',
    items: pick(['Figma']),
  },
]

/** The home page's compact row: a dozen of the tools I reach for most. */
export const stackHighlights: AIStackItem[] = pick([
  'Claude Code',
  'Gemini',
  'Next.js',
  'React',
  'TypeScript',
  'Tailwind CSS',
  'PostgreSQL',
  'Turso',
  'Drizzle',
  'Cloudflare',
  'Vercel',
  'Playwright',
])

/** How many tiles data/stack.tsx has: every one sits in exactly one layer (tests/stack.spec.ts). */
export const stackTileCount = all.length
