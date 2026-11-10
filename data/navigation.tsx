import type { NavItem } from '@/components/layout/FloatingNav'

/**
 * The nav jumps to the home page's sections, from every page (owner,
 * 2026-11-08); the detail pages (/projects, /stack, /about) are reached from
 * their sections.
 */
const SECTIONS = [
  { name: 'About', id: 'about' },
  { name: 'Projects', id: 'projects' },
  { name: 'Experience', id: 'experience' },
  { name: 'Contact', id: 'contact' },
]

/** On the home page: scroll to the section. */
export const navItems: NavItem[] = SECTIONS.map(({ name, id }) => ({ name, link: id }))

/** On the other pages: go home, then scroll to the section. */
export const subpageNavItems: NavItem[] = SECTIONS.map(({ name, id }) => ({
  name,
  href: '/',
  home: id,
}))
