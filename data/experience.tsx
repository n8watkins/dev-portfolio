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

export const workExperience: WorkExperienceItem[] = [
  {
    id: 5,
    company: 'Tech for Pros',
    companyUrl: 'https://techforpros.com',
    location: 'Los Angeles, CA',
    role: 'Full Stack Engineer and AI Consultant',
    period: 'January 2026 – Present',
    basics: [
      'Building Tech for Pros, a SaaS that turns a service business’s details into a launch-ready website in minutes.',
      'Consulting with businesses on AI: where it saves them time, and the tools and automations that put it to work.',
    ],
    more: [
      'Trade-specific Next.js templates and an intake-driven site generator behind it.',
      'Architecting a shared delivery layer on Cloudflare for domains, hosting, forms, analytics, reviews and client content, so a new business launches without a rebuild.',
      'Shipped lead capture, review display and request flows, and an instant site-health check covering performance, mobile usability, SEO and accessibility.',
      'Developing automated follow-up for leads and quotes, appointment and maintenance reminders, referrals and missed-call text-back.',
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
    role: 'Full Stack Developer',
    period: 'March 2023 – June 2026',
    basics: [
      'Built and shipped client apps end to end, for a clinical lab, a streaming service, a private ranch community and an HVAC company.',
      'Owned frontend and backend data flows, APIs, testing, code reviews and production releases.',
    ],
    more: [
      "Automated a clinical lab's data processing with Python, Cloudflare Workers and Gemini, saving ~$20K a year, with uncertain results routed to human review.",
      "Built Riverwood Ranch's searchable document repository and reusable Comfort1 HVAC landing templates with ISR and analytics, improving LCP and INP ~35%.",
      'Set up a repeatable AWS deployment path with Docker and Terraform, pre-deploy checks in GitHub Actions and a documented rollback procedure.',
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
    id: 2,
    company: 'Donovan Golf Course Management',
    location: 'Pasadena, CA',
    role: 'Web Developer',
    period: 'June 2022 – January 2023',
    basics: ['Built course and event sites and a staff CMS with React, Next.js and Firebase.'],
    more: [
      'Reached 90+ Lighthouse performance and accessibility scores.',
      'Integrated Cloudinary media and Google Analytics, so staff update content and track visitors without a developer.',
    ],
    image: { src: '/experience/arroyoseco.webp', alt: "Arroyo Seco Golf Course's site" },
    sites: [
      {
        label: 'arroyosecogc.com',
        url: 'https://www.arroyosecogc.com/',
        shot: '/experience/arroyoseco.webp',
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
