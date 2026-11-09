import type { NavItem } from '@/components/layout/FloatingNav'

/** The home page's nav: About is its own page; the rest scroll to sections here. */
export const navItems: NavItem[] = [
  { name: 'About', href: '/about' },
  { name: 'Projects', link: 'projects' },
  { name: 'Experience', link: 'experience' },
  { name: 'Contact', link: 'contact' },
]

/** The About page's nav: the home page's sections, and this page. */
export const aboutNavItems: NavItem[] = [
  { name: 'About', href: '/about', current: true },
  { name: 'Projects', href: '/', home: 'projects' },
  { name: 'Experience', href: '/', home: 'experience' },
  { name: 'Contact', href: '/', home: 'contact' },
]
