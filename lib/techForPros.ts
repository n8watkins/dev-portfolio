/**
 * Tech for Pros, my SaaS for service businesses (it took over from Appturnity,
 * my consulting firm, in 2026). techforpros.com isn't live yet: while `live`
 * is false nothing links to it, and the cards show "Coming soon" instead of a
 * link. Going live is flipping `live` here (tests/home.spec.ts checks no link
 * points there before then).
 */
export const TECH_FOR_PROS = {
  name: 'Tech for Pros',
  url: 'https://techforpros.com',
  live: false as boolean,
}

/** The link to Tech for Pros, or undefined while the site isn't live. */
export const techForProsHref: string | undefined = TECH_FOR_PROS.live
  ? TECH_FOR_PROS.url
  : undefined
