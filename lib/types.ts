import type React from 'react'

export interface TechIcon {
  icon: string
}

export interface DescriptionPart {
  text: string
  icons: TechIcon[]
}

export interface TechnologyCategory {
  descriptionParts: DescriptionPart[]
}

export interface Technologies {
  Frontend: TechnologyCategory
  Backend: TechnologyCategory
  Cloud: TechnologyCategory
}

export interface Project {
  id: number
  /** URL slug for the project's detail page, e.g. /projects/net-trailer */
  slug: string
  title: string
  /** The title as the app writes it (Portfolio Rank's gold "Rank"); `title` otherwise. */
  wordmark?: React.ReactNode
  subTitle: string
  des: string
  /** One or two sentences for the home page's project card; the page itself shows `des`. */
  summary: string
  /** What's interesting about how it's built, in a sentence: the card's second line. */
  highlight?: string
  /** Screenshots, first one shown; the gallery steps through the rest. */
  images: { src: string; alt: string }[]
  /**
   * A few muted seconds of the live demo in use (an MP4 and its poster in
   * public/projects/clips/), shown on the project's big card in place of the
   * screenshots. Without one, the card shows the first screenshot.
   */
  clip?: { src: string; poster: string; alt: string }
  /** The app's own icon, shown left of its name. */
  icon: string
  /** The app's brand colour: its row's glow, outline, checks and main button (lib/accents.ts). */
  accent: 'net-trailer' | 'portfolio-rank'
  /** A few pills for the tech, shown on the project's page. */
  tags: string[]
  /** What it actually does, shown on its page as checks in its colour (from each app's own Key Features). */
  features: string[]
  /** A 1200x630 card for link previews, when the first screenshot isn't one. */
  shareImage?: string
  technologies: Technologies
  /** The "why" - the goal / what this project is exploring / the question behind it. */
  purpose?: string
  /** How the project actually uses AI - the model, the technique, the implementation. */
  aiUsage?: string
  highlights?: string[]
  github?: string
  liveSite?: string
  /** The people and work it builds on, credited on its card and its page. */
  credits?: { name: string; href: string; note: string }[]
  /** An invitation on its page (Portfolio Rank: vote, or add your portfolio). */
  invite?: { heading: string; body: string; label: string; href: string }
  /** The monitor's name on OpenPing's public status page, when the live site is monitored. */
  statusName?: string
}

/** The newest app, live and public: a one-line card above the projects (Wren, 2026-11-09). */
export interface FeaturedApp {
  name: string
  /** What it is, in one line. */
  line: string
  /** The live app ("Try it"). */
  site: string
  /** Its public repository ("Source"). */
  source: string
}

export type TechNameMappingInterface = {
  [key: string]: string
}

