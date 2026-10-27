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
    id: 1,
    company: 'Appturnity',
    // White, where Appturnity's white page shows
    hoverGlow: 'bg-white/[0.16]',
    companyUrl: 'https://appturnity.com',
    location: 'Los Angeles, CA',
    role: 'Full Stack Developer & Co-Founder',
    period: 'March 2023 – Present',
    bullets: [
      'Lead end-to-end development of client apps across healthcare, property management, and HVAC using React, Next.js, and TypeScript.',
      'Built AI automation with Gemini and Cloudflare Workers that replaced manual data entry, saving clients ~$20K/year.',
      'Developed in-house AI tooling that scores prospective client sites on performance, accessibility, and SEO.',
    ],
    links: [
      { label: 'riverwoodranch.web.app', url: 'https://riverwoodranch.web.app/' },
      { label: 'lifelineclinicallab.com', url: 'https://lifelineclinicallab.com/' },
      { label: 'comfort1hvac.com', url: 'https://comfort1hvac.com/' },
      { label: 'primeshows.live', url: 'https://primeshows.live/' },
    ],
    hoverImage: '/projects/appturnity-home-2026-10.webp',
    hoverFrame: 'object-[0%_40%] origin-[0%_40%] scale-100 group-hover:scale-[1.03]',
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
      'Built course and event sites for the Donovan portfolio with React, Next.js, and Firebase, with a custom CMS for staff.',
      'Improved mobile Lighthouse scores by 40 points across all projects.',
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
      'Launched 5+ small business sites focused on SEO, responsive UX, and Core Web Vitals.',
      'Cut page load times ~40% via image compression, lazy loading, and cross-browser testing.',
    ],
  },
  {
    id: 4,
    company: 'The Coder School',
    // Green, and white at the bottom
    hoverGlow: 'bg-gradient-to-b from-green-400/[0.16] to-white/[0.14]',
    companyUrl: 'https://www.thecoderschool.com/locations/santamonica/',
    location: 'Santa Monica, CA',
    role: 'Programming Instructor',
    period: 'June 2024 – Present',
    additional: true,
    bullets: [
      'Teach full-stack development with JavaScript and Python, including LLM-assisted coding and debugging.',
    ],
    hoverImage: '/experience/coderschool.webp',
    hoverFrame: 'object-[50%_30%] origin-[50%_30%] scale-[2.3] group-hover:scale-[2.15]',
  },
]
