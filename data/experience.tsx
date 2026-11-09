export type WorkExperienceItem = {
  id: number
  company: string
  /**
   * The company's site. Only Tech for Pros has one now (owner, 2026-11-08):
   * the other companies show as plain text, with no client-site links.
   */
  companyUrl?: string
  location: string
  role: string
  period: string
  bullets: string[]
  /**
   * Small screenshots of the work, shown with the bullets when a role is
   * opened ("What I did"). Pictures only, never links.
   */
  visuals?: { src: string; alt: string }[]
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
    bullets: [
      'Building Tech for Pros, a SaaS for service businesses: trade-specific Next.js templates and an intake-driven site generator that turns business details into launch-ready drafts in minutes.',
      'Architecting a shared delivery layer on Cloudflare for domains, hosting, forms, analytics, reviews and client content, so a new business launches without a rebuild.',
      'Shipped lead capture, review display and request flows, and an instant site-health check covering performance, mobile usability, SEO and accessibility.',
      'Developing automated follow-up for leads and quotes, appointment and maintenance reminders, referrals and missed-call text-back.',
      'Consulting with businesses on AI alongside it: where it saves them time, and the tools and automations that put it to work.',
    ],
    visuals: [{ src: '/work/landscaping-verdant.webp', alt: 'A landscaping website drafted by Tech for Pros' }],
  },
  {
    id: 1,
    company: 'Appturnity',
    location: 'Los Angeles, CA',
    role: 'Full Stack Developer',
    period: 'March 2023 – June 2026',
    bullets: [
      'Led end-to-end delivery of client apps: frontend and backend data flows, API boundaries, testing, code reviews and production releases.',
      "Automated Lifeline Clinical Lab's data processing with Python, Cloudflare Workers and Gemini, saving ~$20K a year, with uncertain results routed to human review.",
      "Built Riverwood Ranch's searchable document repository and reusable Comfort1 HVAC landing templates with ISR and analytics, improving LCP and INP ~35%.",
      'Set up a repeatable AWS deployment path with Docker and Terraform, pre-deploy checks in GitHub Actions and a documented rollback procedure.',
    ],
    visuals: [
      { src: '/experience/riverwoodranch.webp', alt: "Riverwood Ranch's site: a private community in Southern California" },
      { src: '/experience/comfort1hvac.webp', alt: "Comfort1 HVAC's landing page: Climate control you can count on" },
    ],
  },
  {
    id: 2,
    company: 'Donovan Golf Course Management',
    location: 'Pasadena, CA',
    role: 'Web Developer',
    period: 'June 2022 – January 2023',
    bullets: [
      'Built course and event sites and a staff CMS with React, Next.js and Firebase, reaching 90+ Lighthouse performance and accessibility scores.',
      'Integrated Cloudinary media and Google Analytics, so staff update content and track visitors without a developer.',
    ],
    visuals: [{ src: '/experience/arroyoseco.webp', alt: "Arroyo Seco Golf Course's site" }],
  },
  {
    id: 3,
    company: 'Realtek Solutions',
    location: 'Los Angeles, CA',
    role: 'Frontend Developer',
    period: 'July 2021 – May 2022',
    bullets: [
      'Launched 5+ small-business websites with reusable React and Tailwind components, through reviews, testing, releases and post-launch fixes.',
      'Cut page-load times ~40% with image compression, lazy loading and cross-browser testing; deployed on Firebase Hosting and Vercel.',
    ],
  },
  {
    id: 4,
    company: 'The Coder School',
    location: 'Santa Monica, CA',
    role: 'Programming Instructor',
    period: 'June 2024 – Present',
    additional: true,
    bullets: [
      'Teach JavaScript, Python and application development, guiding students through debugging and the responsible use of LLM-assisted coding tools.',
    ],
    visuals: [{ src: '/experience/coderschool.webp', alt: "The Coder School Santa Monica's site" }],
  },
]
