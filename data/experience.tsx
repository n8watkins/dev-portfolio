export type WorkExperienceItem = {
  id: number
  company: string
  /**
   * The company's site, linked from its name. Only Tech for Pros has one
   * (owner, 2026-11-08); the sites built for clients are `sites`.
   */
  companyUrl?: string
  location: string
  role: string
  period: string
  /** A short list every visitor sees, with no click (owner, round 5 of 2026-11-09). */
  basics: string[]
  /**
   * The rest, for the roles with more to say (owner, round 5 of 2026-11-09):
   * a role with `more` gets the expand ("More"), a role without has none.
   */
  more?: string[]
  /**
   * The role's own picture, on the right of its row: a glimpse on hover that
   * stays, faded into the row, while the role is open (owner, round 4 of
   * 2026-11-09). Each role keeps its own: Tech for Pros a site it drafted,
   * Appturnity its own home page (the role is historical, so it stays
   * Appturnity, though the firm became Tech for Pros on 2026-11-01).
   */
  image?: { src: string; alt: string }
  /**
   * Sites I built there, still live: small preview cards that link to them,
   * with `more` when the role is open (owner, round 4 of 2026-11-09).
   * Clients whose sites are gone are described, never linked or named by
   * domain (owner, round 5 of 2026-11-09).
   */
  sites?: { label: string; url: string; shot: string }[]
  additional?: boolean
}

/** The roles follow the resume of November 2026: its titles, dates and claims. */
export const workExperience: WorkExperienceItem[] = [
  {
    id: 5,
    company: 'Tech for Pros',
    companyUrl: 'https://techforpros.com',
    location: 'Los Angeles, CA',
    role: 'Full-Stack Software Developer',
    period: 'August 2026 – Present',
    basics: [
      'Building managed websites, AI receptionists and customer workflow automation for service businesses.',
      'Deployed AI receptionists in a 12-client pilot, handling ~120 missed calls a month per client, about 15% of them qualified leads.',
    ],
    more: [
      'Migrated client call flows from Twilio to Telnyx, with business-first routing, missed and after-hours call handling and conditional staff handoffs.',
      'Re-architected separately deployed Next.js client sites into a single configuration-driven Cloudflare Worker serving multiple client websites, with reusable templates, lead capture and automated follow-up.',
      'Designed a staging-first CI/CD workflow for AI-generated pull requests: comprehensive validation before merge, without redundant CI runs or wasted LLM tokens while iterating.',
      'Interviewed business owners and staff to turn how they operate into client-specific SOPs, then built automations for warranty-expiration outreach and scheduling-gap recovery from customer records and appointment availability.',
    ],
    image: {
      src: '/work/landscaping-verdant.webp',
      alt: 'A landscaping website drafted by Tech for Pros',
    },
  },
  {
    id: 1,
    company: 'Appturnity',
    location: 'Los Angeles, CA',
    role: 'Full-Stack Developer',
    period: 'March 2023 – June 2026',
    basics: [
      'Built or maintained 40+ Next.js client websites within a portfolio of 120+ accounts.',
      'Integrated quote-request forms with multiple CRMs, with tests verifying that customer and quote details reached each business.',
    ],
    more: [
      'Architected searchable document retrieval with Next.js ISR for cacheable pages and Firestore metadata for indexing, enforcing property-staff access rules on protected documents.',
      'Built an automated image-sizing audit script that checks images against their placement in responsive layouts and finds oversized assets that slow mobile page loads.',
      'Built mobile-first Next.js sites with ISR and responsive components, scoring 90+ in Lighthouse for Performance, Accessibility, Best Practices and SEO and meeting Core Web Vitals.',
    ],
    image: { src: '/experience/appturnity.webp', alt: "Appturnity's home page" },
    sites: [
      {
        label: 'riverwoodranch.web.app',
        url: 'https://riverwoodranch.web.app/',
        shot: '/experience/riverwoodranch.webp',
      },
      {
        label: 'comfort1hvac.com',
        url: 'https://comfort1hvac.com/',
        shot: '/experience/comfort1hvac.webp',
      },
    ],
  },
  {
    id: 6,
    company: 'Lifeline Clinical Labs',
    location: 'Los Angeles, CA · Contract',
    role: 'Full-Stack Developer',
    period: 'February 2024 – June 2024',
    basics: [
      'Developed a Python order-entry pipeline that uses Gemini to extract patient information and requested tests from hospital requisitions, enters them into the lab software and cross-checks the records, ending manual re-entry across ~2,000 orders a month.',
      'Built a clinical intake pipeline with React Hook Form and Zod validation, Next.js APIs and Firebase Functions for record sync, reducing duplicate entry.',
    ],
  },
  {
    id: 2,
    company: 'Donovan Golf Course Management',
    location: 'Pasadena, CA · Contract',
    role: 'Web Developer',
    period: 'June 2022 – January 2023',
    basics: [
      'Rebuilt six golf course websites and integrated tee-time and event booking.',
      'On select courses, comparable monthly off-peak online bookings rose from 200 to 260 (+30%) after rollout.',
    ],
    more: [
      'Coordinated pre-launch booking integration testing with the web team, verifying tee-time and event reservations on the rebuilt frontends against the existing backend.',
    ],
    image: { src: '/experience/arroyoseco.webp', alt: "Arroyo Seco Golf Course's site" },
    sites: [
      {
        label: 'arroyosecogc.com',
        url: 'https://www.arroyosecogc.com/',
        shot: '/experience/arroyoseco.webp',
      },
      {
        label: 'angelesnational.com',
        url: 'https://www.angelesnational.com/',
        shot: '/experience/angelesnational.webp',
      },
      {
        label: 'alhambragolf.com',
        url: 'https://www.alhambragolf.com/',
        shot: '/experience/alhambragolf.webp',
      },
      {
        label: 'debellgolf.com',
        url: 'https://debellgolf.com/',
        shot: '/experience/debellgolf.webp',
      },
      {
        label: 'mpgolfclub.com',
        url: 'https://www.mpgolfclub.com/',
        shot: '/experience/mpgolfclub.webp',
      },
      {
        label: 'lcfcountryclub.com',
        url: 'https://lcfcountryclub.com/',
        shot: '/experience/lcfcountryclub.webp',
      },
    ],
  },
  {
    id: 3,
    company: 'Realtek Solutions',
    location: 'Los Angeles, CA',
    role: 'Frontend Developer',
    period: 'July 2021 – May 2022',
    basics: [
      'Launched 5+ small-business websites with reusable React and Tailwind components.',
      'Cut page-load times ~40% with image compression, lazy loading and cross-browser testing.',
    ],
  },
  {
    id: 4,
    company: 'The Coder School',
    location: 'Santa Monica, CA',
    role: 'Programming Instructor',
    period: 'June 2024 – Present',
    additional: true,
    basics: [
      'Teach JavaScript, Python and application development, including the responsible use of AI coding tools.',
    ],
    image: { src: '/experience/coderschool.webp', alt: "The Coder School Santa Monica's site" },
  },
]
