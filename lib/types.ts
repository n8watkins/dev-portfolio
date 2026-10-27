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
  /** URL slug for the project's detail page, e.g. /projects/echo */
  slug: string
  title: string
  subTitle: string
  des: string
  /** Screenshots, first one shown; the gallery steps through the rest. */
  images: { src: string; alt: string }[]
  /** The app's own icon, shown left of its name. */
  icon: string
  /** The app's brand colour: its row's glow, outline, checks and main button (lib/accents.ts). */
  accent: 'echo' | 'scout' | 'geminigpt' | 'net-trailer'
  /** A few pills for the tech; the full stack is on the project's page. */
  tags: string[]
  /** What it actually does, shown as checks in its colour (from each app's own Key Features). */
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
  /** The monitor's name on OpenPing's public status page, when the live site is monitored. */
  statusName?: string
}

export type TechNameMappingInterface = {
  [key: string]: string
}

