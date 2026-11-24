import type { Metadata } from 'next'
import ProjectsPage from '@/components/ProjectsPage'

const description =
  "Nathan Watkins' projects in detail: Portfolio Rank, NetTrailers and Wren, the AI app he's building now, with screenshots, features and tech."

export const metadata: Metadata = {
  title: 'Projects',
  description,
  alternates: { canonical: '/projects' },
  openGraph: { title: 'Projects | Nathan Watkins', description, url: '/projects' },
  twitter: { card: 'summary_large_image', title: 'Projects | Nathan Watkins', description },
}

export default function Page() {
  return <ProjectsPage />
}
