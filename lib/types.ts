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

/** A chapter's picture: one of the project's screenshots, by index (the clip opens the page). */
export type StoryMedia = { image: number; caption: string }

/**
 * One beat of a project's story. The beats run the same way on every page
 * (owner, 2026-11-26: "tell a story"): the spark, the question, the build,
 * how it grew, where it is now.
 */
export interface StoryChapter {
  /** The anchor and the "On this page" entry. */
  id: 'spark' | 'question' | 'build' | 'grew' | 'now'
  /** The beat's name, small above the title ("The spark"). */
  beat: string
  title: string
  paragraphs: string[]
  /** A line set large, the question the project asks. */
  quote?: string
  /** Shown after the words that mention it. */
  media?: StoryMedia
  /** Dated steps, oldest first, each from the project's history. */
  timeline?: { when: string; what: string }[]
}

export interface ProjectStory {
  /** The opening line under the title. */
  lede: string
  chapters: StoryChapter[]
}

export interface Project {
  id: number
  /** URL slug for the project's detail page, e.g. /projects/net-trailers */
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
  /** An animated mark shown in place of the icon (Wren's bird, components/Projects/WrenMark.tsx). */
  mark?: 'wren'
  /** The app's brand colour: its row's glow, outline, checks and main button (lib/accents.ts). */
  accent: 'wren' | 'net-trailer' | 'portfolio-rank'
  /** A few pills for the tech, shown on the project's page. */
  tags: string[]
  /** What it actually does, shown on its page as checks in its colour (from each app's own Key Features). */
  features: string[]
  /** A 1200x630 card for link previews, when the first screenshot isn't one. */
  shareImage?: string
  technologies: Technologies
  /** The project's page, told as a short story in my voice (owner, 2026-11-26). */
  story: ProjectStory
  github?: string
  liveSite?: string
  /** The people and work it builds on, credited on its card and its page. */
  credits?: { name: string; href: string; note: string }[]
  /** An invitation on its page (Portfolio Rank: vote, or add your portfolio). */
  invite?: { heading: string; body: string; label: string; href: string }
  /** The monitor's name on OpenPing's public status page, when the live site is monitored. */
  statusName?: string
}

export type TechNameMappingInterface = {
  [key: string]: string
}
