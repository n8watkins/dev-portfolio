export type WorkExperienceItem = {
  id: number
  company: string
  companyUrl?: string
  location: string
  role: string
  period: string
  bullets: string[]
  links?: { label: string; url: string }[]
  hoverImage?: string
  /**
   * The glow around the card's right (image) side on hover, in the colours of
   * its hover image: a background class for a blurred layer behind the card
   * (a full Tailwind class, so the build sees it). The other side glows a light
   * blue; a card with no image glows light blue all round, so it has none.
   */
  hoverGlow?: string
  /**
   * Where the hover image sits in its frame and how far it is zoomed (at rest,
   * then on hover): each picture framed on its own subject.
   */
  hoverFrame?: string
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
  },
  {
    id: 1,
    company: 'Freelance web development',
    location: 'Los Angeles, CA',
    role: 'Full Stack Developer and Consultant',
    period: 'March 2023 – June 2026',
    bullets: [
      'Led end-to-end delivery of client apps: frontend and backend data flows, API boundaries, testing, code reviews and production releases.',
      "Automated Lifeline Clinical Lab's data processing with Python, Cloudflare Workers and Gemini, saving ~$20K a year, with uncertain results routed to human review.",
      "Built Riverwood Ranch's searchable document repository and reusable Comfort1 HVAC landing templates with ISR and analytics, improving LCP and INP ~35%.",
      'Set up a repeatable AWS deployment path with Docker and Terraform, pre-deploy checks in GitHub Actions and a documented rollback procedure.',
    ],
    links: [
      { label: 'riverwoodranch.web.app', url: 'https://riverwoodranch.web.app/' },
      { label: 'lifelineclinicallab.com', url: 'https://lifelineclinicallab.com/' },
      { label: 'comfort1hvac.com', url: 'https://comfort1hvac.com/' },
      { label: 'primeshows.live', url: 'https://primeshows.live/' },
    ],
  },
  {
    id: 2,
    company: 'Donovan Golf Course Management',
    // A little of the course's green
    hoverGlow: 'bg-green-400/[0.14]',
    companyUrl: 'https://www.arroyosecogc.com/',
    location: 'Pasadena, CA',
    role: 'Web Developer',
    period: 'June 2022 – January 2023',
    bullets: [
      'Built course and event sites and a staff CMS with React, Next.js and Firebase, reaching 90+ Lighthouse performance and accessibility scores.',
      'Integrated Cloudinary media and Google Analytics, so staff update content and track visitors without a developer.',
    ],
    links: [{ label: 'arroyosecogc.com', url: 'https://www.arroyosecogc.com/' }],
    hoverImage: '/experience/arroyoseco.webp',
    hoverFrame: 'object-[35%_0%] origin-[35%_0%] scale-[1.15] group-hover:scale-110',
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
    // Green, and white at the bottom
    hoverGlow: 'bg-linear-to-b from-green-400/16 to-white/[0.14]',
    companyUrl: 'https://www.thecoderschool.com/locations/santamonica/',
    location: 'Santa Monica, CA',
    role: 'Programming Instructor',
    period: 'June 2024 – Present',
    additional: true,
    bullets: [
      'Teach JavaScript, Python and application development, guiding students through debugging and the responsible use of LLM-assisted coding tools.',
    ],
    hoverImage: '/experience/coderschool.webp',
    hoverFrame: 'object-[50%_30%] origin-[50%_30%] scale-[2.3] group-hover:scale-[2.15]',
  },
]
