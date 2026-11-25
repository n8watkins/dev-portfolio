// The AI kit and stack I build with: the tiles of n8builds.dev's homepage
// marquee (three rows) and the portfolio's tech stack card (two rows).
//
// Shared with the portfolio (portfolio.n8builds.dev): this file is a
// byte-identical copy there, checked by its `npm run check:sync`. Keep it free
// of site-specific wording ("this blog", "this site") and of imports either
// repo lacks; edit it here, then copy it over.
import type { CSSProperties, ReactElement } from 'react'
import Image from 'next/image'
import {
  SiAnthropic,
  SiClaude,
  SiClerk,
  SiCloudflare,
  SiCursor,
  SiDrizzle,
  SiEslint,
  SiFigma,
  SiFirebase,
  SiGit,
  SiGithubactions,
  SiGoogleanalytics,
  SiGooglecloud,
  SiGooglegemini,
  SiHuggingface,
  SiNextdotjs,
  SiPostgresql,
  SiPrettier,
  SiReact,
  SiSanity,
  SiSentry,
  SiShadcnui,
  SiTailwindcss,
  SiTurso,
  SiTypescript,
  SiUpstash,
  SiVercel,
  SiVite,
  SiZod,
} from 'react-icons/si'
// Simple Icons dropped the OpenAI and AWS marks; Bootstrap Icons and Font Awesome have them.
import { BsOpenai } from 'react-icons/bs'
import { FaAws } from 'react-icons/fa6'

export interface AIStackItem {
  name: string
  icon: ReactElement
  /**
   * How I use it, in my own words (owner, 2026-11-25: what I use it for, not
   * what it is). Short: it shows on the tile's hover in three lines at most.
   */
  description: string
  /** The project the description names, linked (see StackLink). */
  link?: StackLink
}

/**
 * A project a tile's description names, made a link (owner, 2026-11-25: "check
 * out my VoiceDock extension that uses it"). `text` is the words in the
 * description that become the link, exactly as written there. Where it goes
 * depends on the site showing the tile (stackLinkHref): a project on the
 * portfolio opens its page there, a build its page on n8builds.dev.
 */
export interface StackLink {
  text: string
  /** Its page on n8builds.dev: /builds/<build>. */
  build?: string
  /** Its page on the portfolio: /projects/<project>. */
  project?: string
  /** Any other page, as a full URL (a blog, say). */
  href?: string
}

export type StackSite = 'n8builds' | 'portfolio'

const SITE_ORIGIN: Record<StackSite, string> = {
  n8builds: 'https://n8builds.dev',
  portfolio: 'https://portfolio.n8builds.dev',
}

/**
 * Where a tile's link goes on `site`: the project's page on that site when it
 * has one there, else its page on the other site. `external` says it leaves
 * the site (it then opens in a new tab).
 */
export function stackLinkHref(link: StackLink, site: StackSite): { href: string; external: boolean } {
  const pages: [StackSite, string | undefined][] = [
    ['n8builds', link.build && `/builds/${link.build}`],
    ['portfolio', link.project && `/projects/${link.project}`],
  ]
  const own = pages.find(([where, path]) => where === site && path)
  if (own) return { href: own[1]!, external: false }
  const other = pages.find(([, path]) => path)
  if (other) return { href: SITE_ORIGIN[other[0]] + other[1], external: true }
  const url = link.href ?? ''
  if (url.startsWith(SITE_ORIGIN[site] + '/')) return { href: url.slice(SITE_ORIGIN[site].length), external: false }
  return { href: url, external: true }
}

// The projects the tiles link to.
const SCRIBE = { build: 'scribe' }
const VOICEDOCK = { build: 'voicedock' }
const OPENPING = { build: 'openping' }
const SOLARA = { build: 'solara' }
const TLDW = { build: 'tldw' }
const PORTFOLIO_RANK = { build: 'portfolio-rank', project: 'portfolio-rank' }
const NET_TRAILERS = { project: 'net-trailers' }
const WREN = { project: 'wren' }

const ICON = 'w-7 h-7'

interface MarkProps {
  className?: string
  style?: CSSProperties
}

/**
 * whisper.cpp has no icon of its own (its README banner is a wordmark), so the
 * tile uses the mark of ggml-org, the project that makes it: the pixel "GG"
 * badge from its GitHub avatar, the letters cut out of the badge.
 */
export function GgmlMark({ className, style }: MarkProps) {
  const holes = [
    // First G
    [13, 14, 11, 3],
    [13, 17, 2, 11],
    [13, 28, 11, 2],
    [21, 17, 3, 4],
    [21, 22, 3, 6],
    [18, 22, 3, 3],
    // Second G
    [26, 19, 11, 3],
    [26, 22, 3, 11],
    [26, 33, 11, 3],
    [34, 22, 3, 4],
    [34, 28, 3, 5],
    [32, 28, 2, 2],
  ]
  const badge = 'M10 10h30v3h2v24h-2v3H10v-3H7V13h3z'
  const d = badge + holes.map(([x, y, w, h]) => `M${x} ${y}h${w}v${h}h-${w}z`).join('')
  return (
    <svg viewBox="7 10 35 30" aria-hidden="true" className={className} style={style}>
      <path d={d} fill="currentColor" fillRule="evenodd" shapeRendering="crispEdges" />
    </svg>
  )
}

/**
 * Piper's mark (from its README logo): the "P" of PIPER wearing a jester's
 * cap, its three points tipped with bells.
 */
export function PiperMark({ className, style }: MarkProps) {
  return (
    <svg viewBox="0 0 48 52" aria-hidden="true" className={className} style={style}>
      <g fill="currentColor">
        {/* The P, its top-left corner cut on the slant of the cap's brim. */}
        <path
          fillRule="evenodd"
          d="M17 29 32 20h2c6.5 0 11 4.5 11 10.5S40.5 41 34 41h-9v10h-8zm8-1v6h8c2 0 3.5-1.3 3.5-3S35 28 33 28z"
        />
        {/* The cap: three points over a brim that dips into the P's corner. */}
        <path d="M3.5 22.5C6 17 9 15.5 12 15c0-5 .5-8.5 2-12 2.5 4 4.5 7.5 6.5 10 2.5-3.5 5.5-6 10-7.5-1.5 3.5-1 7.5.5 11.5L16 26l-5-5c-3-.5-5.5 0-7.5 1.5z" />
        <circle cx="14" cy="2.8" r="2.6" />
        <circle cx="31" cy="5.2" r="2.6" />
        <circle cx="3.2" cy="23" r="2.6" />
      </g>
    </svg>
  )
}

/**
 * Pi, the coding-agent harness, has no mark of its own: its name's letter.
 */
function PiMark({ className, style }: MarkProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} style={style}>
      <path d="M3 6.5h18v3H16v8.5c0 .8.4 1.2 1.2 1.2H19V22h-2.6C14.2 22 13 20.8 13 18.6V9.5h-3V15c0 4-1.3 7-4.6 7H4.5v-2.8h.6C6.6 19.2 7 17.6 7 15V9.5H3z" fill="currentColor" />
    </svg>
  )
}

// Colours: the brands' own, lifted where a dark mark would vanish on the dark
// tiles (Cursor, OpenAI and ggml are black-and-white marks: light here).
const LIGHT = '#e6edf6'

/**
 * A marquee row's loop time, so every row moves at the same pace (~22px/s)
 * however many tiles it has: a tile is 13rem wide plus the 2.5rem gap the
 * moving rows use, about 248px, so 11.3s per tile. Pass it as the row's
 * `--duration`.
 */
export const rowDuration = (tiles: number) => `${Math.round(tiles * 11.3)}s`

// Row 1 - agents & models (the heavy lifters)
export const ai_agents: AIStackItem[] = [
  { name: 'Claude Code', icon: <SiClaude className={ICON} style={{ color: '#D97757' }} />, description: 'Where I build everything now, one pull request at a time.' },
  { name: 'Claude Opus 5.5', icon: <SiAnthropic className={ICON} style={{ color: '#F0EEE6' }} />, description: 'The model behind Claude Code when I build.' },
  { name: 'ChatGPT', icon: <BsOpenai className={ICON} style={{ color: LIGHT }} />, description: 'Where I plan a build first, often out loud in voice mode.' },
  { name: 'Codex', icon: <BsOpenai className={ICON} style={{ color: LIGHT }} />, description: 'My second opinion when a bug fights back.' },
  { name: 'Pi', icon: <PiMark className={ICON} style={{ color: LIGHT }} />, description: 'A minimal agent harness that runs any model.' },
  { name: 'Cursor', icon: <SiCursor className={ICON} style={{ color: LIGHT }} />, description: 'Inline, context-aware edits when my hands are on the keys.' },
  { name: 'OpenAI', icon: <BsOpenai className={ICON} style={{ color: LIGHT }} />, description: "Draws the icons in an icon tool I'm still building." },
  {
    name: 'Gemini',
    icon: <SiGooglegemini className={ICON} style={{ color: '#4285F4' }} />,
    description: 'The AI in my apps: Wren, NetTrailers, Portfolio Rank and TL;DW.',
    link: { text: 'Wren', ...WREN },
  },
]

// Row 2 - local-first & tooling (whisper.cpp powers Scribe, Piper and Kokoro power the VoiceDock extension)
export const ai_tools: AIStackItem[] = [
  {
    name: 'whisper.cpp',
    icon: <GgmlMark className={ICON} style={{ color: LIGHT }} />,
    description: 'Local speech to text. Scribe runs on it, and I dictate with it all day.',
    link: { text: 'Scribe', ...SCRIBE },
  },
  {
    name: 'Piper',
    icon: <PiperMark className={ICON} style={{ color: LIGHT }} />,
    description: 'Local text to speech. My VoiceDock extension reads pages aloud with it.',
    link: { text: 'VoiceDock', ...VOICEDOCK },
  },
  {
    name: 'Hugging Face',
    icon: <SiHuggingface className={ICON} style={{ color: '#FFD21E' }} />,
    description: 'Where Scribe and VoiceDock download their models and voices.',
    link: { text: 'Scribe', ...SCRIBE },
  },
]

// Row 3 (the portfolio's second row) - the stack I ship with, roughly
// frameworks, then data, infra and tooling. Purple marks (Clerk, ESLint, Vite)
// show light or in another of their brand colours: the sites use no purple.
export const dev_stack: AIStackItem[] = [
  { name: 'Next.js', icon: <SiNextdotjs className={ICON} style={{ color: LIGHT }} />, description: 'Every web app I make starts here.' },
  { name: 'React', icon: <SiReact className={ICON} style={{ color: '#61DAFB' }} />, description: 'My UI, in web apps and Chrome extensions alike.' },
  { name: 'TypeScript', icon: <SiTypescript className={ICON} style={{ color: '#3178C6' }} />, description: 'Strict mode everywhere.' },
  { name: 'Tailwind CSS', icon: <SiTailwindcss className={ICON} style={{ color: '#06B6D4' }} />, description: 'How I style every project I ship.' },
  {
    name: 'Zod',
    icon: <SiZod className={ICON} style={{ color: '#3E67B1' }} />,
    description: "Checks every form and API input. OpenPing's API runs on it.",
    link: { text: 'OpenPing', ...OPENPING },
  },
  { name: 'ShadCN', icon: <SiShadcnui className={ICON} style={{ color: LIGHT }} />, description: 'Accessible components I own and restyle.' },
  {
    name: 'Vite',
    icon: <SiVite className={ICON} style={{ color: '#FFC517' }} />,
    description: "Builds TL;DW and Scribe's dashboard, where Next.js doesn't fit.",
    link: { text: 'TL;DW', ...TLDW },
  },
  { name: 'PostgreSQL', icon: <SiPostgresql className={ICON} style={{ color: '#6B9BD8' }} />, description: 'Not in my apps right now: they run on SQLite, in Turso and D1.' },
  {
    name: 'Turso',
    icon: <SiTurso className={ICON} style={{ color: '#4FF8D2' }} />,
    description: "SQLite for my quick apps. Portfolio Rank's votes live here.",
    link: { text: 'Portfolio Rank', ...PORTFOLIO_RANK },
  },
  {
    name: 'Drizzle',
    icon: <SiDrizzle className={ICON} style={{ color: '#C5F74F' }} />,
    description: 'My queries on Turso, checked against the schema. NetTrailers uses it.',
    link: { text: 'NetTrailers', ...NET_TRAILERS },
  },
  {
    name: 'Firebase',
    icon: <SiFirebase className={ICON} style={{ color: '#FFCA28' }} />,
    description: 'Solara runs on it: Google sign-in, sync and hosting.',
    link: { text: 'Solara', ...SOLARA },
  },
  { name: 'AWS', icon: <FaAws className={ICON} style={{ color: '#FF9900' }} />, description: 'Cloud hosting and storage when a project needs it.' },
  {
    name: 'Google Cloud',
    icon: <SiGooglecloud className={ICON} style={{ color: '#4285F4' }} />,
    description: "Google's APIs: Calendar in Solara, PageSpeed in Portfolio Rank.",
    link: { text: 'Solara', ...SOLARA },
  },
  { name: 'Vercel', icon: <SiVercel className={ICON} style={{ color: LIGHT }} />, description: 'For quick ones now. My live apps moved to Cloudflare.' },
  {
    name: 'Cloudflare',
    icon: <SiCloudflare className={ICON} style={{ color: '#F38020' }} />,
    description: 'My go-to: hosting, data and file storage. OpenPing lives on it.',
    link: { text: 'OpenPing', ...OPENPING },
  },
  {
    name: 'Sanity',
    icon: <SiSanity className={ICON} style={{ color: '#F03E2F' }} />,
    description: "Where I write my N8's Notions posts.",
    link: { text: "N8's Notions", href: 'https://n8builds.dev/blog' },
  },
  { name: 'Upstash', icon: <SiUpstash className={ICON} style={{ color: '#00E9A3' }} />, description: 'Ran my rate limits until I moved them to Cloudflare.' },
  { name: 'Clerk', icon: <SiClerk className={ICON} style={{ color: LIGHT }} />, description: 'Sign-in on one of my side apps.' },
  {
    name: 'NextAuth',
    icon: <SiNextdotjs className={ICON} style={{ color: LIGHT }} />,
    description: 'GitHub sign-in, so Portfolio Rank counts one vote per matchup.',
    link: { text: 'Portfolio Rank', ...PORTFOLIO_RANK },
  },
  { name: 'Sentry', icon: <SiSentry className={ICON} style={{ color: LIGHT }} />, description: 'Tells me when something breaks in production.' },
  { name: 'Google Analytics', icon: <SiGoogleanalytics className={ICON} style={{ color: '#E37400' }} />, description: 'Visitor numbers, only with consent.' },
  {
    name: 'Playwright',
    icon: <Image src="/projectIcons/playwright.svg" alt="" width={28} height={28} unoptimized className={ICON} />,
    description: "Tests every pull request, and takes Portfolio Rank's screenshots.",
    link: { text: 'Portfolio Rank', ...PORTFOLIO_RANK },
  },
  {
    name: 'GitHub Actions',
    icon: <SiGithubactions className={ICON} style={{ color: '#2088FF' }} />,
    description: "CI on every pull request, and Scribe's signed installers.",
    link: { text: 'Scribe', ...SCRIBE },
  },
  { name: 'ESLint', icon: <SiEslint className={ICON} style={{ color: LIGHT }} />, description: 'Lint that fails the build on any warning.' },
  {
    name: 'Prettier',
    icon: <SiPrettier className={ICON} style={{ color: '#F7B93E' }} />,
    description: "Keeps Solara's code formatted; lint fails if it isn't.",
    link: { text: 'Solara', ...SOLARA },
  },
  { name: 'Git', icon: <SiGit className={ICON} style={{ color: '#F05032' }} />, description: 'Small commits, every change on a branch.' },
  { name: 'Figma', icon: <SiFigma className={ICON} style={{ color: '#F24E1E' }} />, description: 'Mockups before the code, when a design needs it.' },
]
