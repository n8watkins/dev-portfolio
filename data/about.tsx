import type React from 'react'

/** A photo on the About page. Without `src` it shows as a placeholder until the photo arrives. */
export interface AboutPhoto {
  /** e.g. '/about/at-work.webp' (public/about/). Leave out for the placeholder. */
  src?: string
  alt: string
  /** What the placeholder asks for (listed in OWNER-TODO.md). */
  wanted: string
}

export interface AboutScene {
  id: string
  eyebrow: string
  title: string
  body: React.ReactNode
  photo: AboutPhoto
  /** The placeholder's icon and the stickers that drift around the scene. */
  mood: 'work' | 'la' | 'setup'
}

/**
 * The one portrait (owner, 2026-11-08: one, not two). The owner hasn't picked
 * which yet; the photo portrait stands in.
 */
export const aboutPortrait = {
  src: '/hero/portrait.jpg',
  alt: 'Photo of Nathan Watkins',
}

/**
 * The story, in a few scenes, each with a photo. To add a photo: put it in
 * public/about/ (4:3, at least 1200x900, WebP) and set its `src` here.
 * Until the owner makes his own (owner, 2026-11-25), the first two are stock
 * photos (credits in public/about/CREDITS.md) and the setup is a screenshot
 * of n8builds.dev; their alt text says what is in them, never that it is him.
 */
export const aboutScenes: Omit<AboutScene, 'body'>[] = [
  {
    id: 'work',
    eyebrow: 'At work',
    title: 'Using AI to help people get things done',
    mood: 'work',
    photo: {
      src: '/about/at-work.webp',
      alt: 'An electrician in a yellow hard hat and work gloves wiring a panel on a wall',
      wanted: 'You at work: at your desk, or with a client or team, 4:3 landscape',
    },
  },
  {
    id: 'la',
    eyebrow: 'Los Angeles',
    title: 'In LA, and open to moving',
    mood: 'la',
    photo: {
      src: '/about/teaching.webp',
      alt: 'A man pointing at a laptop screen while a boy beside him follows along',
      wanted: 'LA life: you outdoors somewhere in Los Angeles you like, 4:3 landscape',
    },
  },
  {
    id: 'setup',
    eyebrow: 'The setup',
    title: 'Where I build in public',
    mood: 'setup',
    photo: {
      src: '/about/n8builds.webp',
      alt: 'The home page of n8builds.dev',
      wanted: 'Your setup: the desk, screens, keyboard and mic you build and stream from, 4:3 landscape',
    },
  },
]
