/**
 * Tech for Pros, my SaaS for service businesses (it took over from Appturnity,
 * my consulting firm, in 2026). Its buttons (the hero's and the workshop's)
 * link to it already, in Appturnity's place (owner, 2026-11-01). Until
 * techforpros.com is live (`live`), the footers leave it out.
 * Going live is flipping `live` here.
 */
export const TECH_FOR_PROS = {
  name: 'Tech for Pros',
  url: 'https://techforpros.com',
  live: false as boolean,
}

/** The footers' link to Tech for Pros, or undefined while the site isn't live. */
export const techForProsHref: string | undefined = TECH_FOR_PROS.live
  ? TECH_FOR_PROS.url
  : undefined
