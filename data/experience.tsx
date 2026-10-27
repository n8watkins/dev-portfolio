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
   * The card's hover glow, off its right side, in the colours of its hover
   * image (a full Tailwind class, so the build sees it).
   */
  hoverGlow: string
  additional?: boolean
}

export const workExperience: WorkExperienceItem[] = [
  {
    id: 1,
    company: 'Appturnity',
    // Appturnity's blue and white
    hoverGlow:
      'hover:shadow-[22px_0_28px_-14px_rgba(59,130,246,0.75),34px_0_40px_-20px_rgba(255,255,255,0.45)]',
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
    hoverImage: '/projects/Appturnity.webp',
  },
  {
    id: 2,
    company: 'Donovan Golf Course Management',
    // A little of the course's green
    hoverGlow: 'hover:shadow-[22px_0_28px_-14px_rgba(74,222,128,0.6)]',
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
  },
  {
    id: 3,
    company: 'Realtek Solutions',
    // White (no hover image)
    hoverGlow: 'hover:shadow-[22px_0_28px_-14px_rgba(255,255,255,0.5)]',
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
    hoverGlow:
      'hover:shadow-[22px_-6px_28px_-14px_rgba(74,222,128,0.6),22px_12px_28px_-14px_rgba(255,255,255,0.5)]',
    companyUrl: 'https://www.thecoderschool.com/locations/santamonica/',
    location: 'Santa Monica, CA',
    role: 'Programming Instructor',
    period: 'June 2024 – Present',
    additional: true,
    bullets: [
      'Teach full-stack development with JavaScript and Python, including LLM-assisted coding and debugging.',
    ],
    hoverImage: '/experience/coderschool.webp',
  },
]
