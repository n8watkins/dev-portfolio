/**
 * Titles and descriptions for search results and share cards, in one place so
 * the page title, Open Graph and Twitter never drift apart.
 */

// The site's one home: canonical links, share cards and the sitemap always use
// it, so a stale environment variable can't point them somewhere else.
export const SITE_URL = 'https://portfolio.n8builds.dev'
export const SITE_NAME = 'Nathan Watkins'
export const ROLE = 'AI Full-Stack Developer'

/** The home page title; other pages are "<page> | Nathan Watkins". */
export const SITE_TITLE = `${SITE_NAME} | ${ROLE}`

/** For search results (about 155 characters). */
export const SITE_DESCRIPTION =
  'Nathan Watkins, AI full-stack developer in Los Angeles. Realtime voice agents, research agents and client sites, built with React, Next.js and AI.'

/** For share cards (previews show about 120 characters). */
export const SITE_SHARE_DESCRIPTION = 'AI full-stack developer in LA: voice agents, research agents and client sites, built with React, Next.js and AI.'

/** Shorten text at a word boundary, with an ellipsis. */
export function summarize(text: string, max = 155): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  const cut = clean.slice(0, max - 1)
  return `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[\s,;:.-]+$/, '')}…`
}

/**
 * Shorten text for a share card: whole sentences while they fit, so the card
 * never ends mid-thought. Falls back to a word-boundary cut when even the
 * first sentence is too long.
 */
export function shareSummary(text: string, max = 120): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  // A sentence ends at . ! or ? followed by a space, so "n8builds.dev" stays whole.
  let out = ''
  for (const sentence of clean.split(/(?<=[.!?])\s+/)) {
    const next = out ? `${out} ${sentence}` : sentence
    if (next.length > max) break
    out = next
  }
  return out || summarize(clean, max)
}
