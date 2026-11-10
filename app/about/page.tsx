import type { Metadata } from 'next'
import AboutPage from '@/components/AboutPage'

const description =
  'Nathan Watkins, full-stack developer in Los Angeles: the full story, how I work, my stack, my resume and every role in full.'

export const metadata: Metadata = {
  title: 'About',
  description,
  alternates: { canonical: '/about' },
  openGraph: { title: 'About | Nathan Watkins', description, url: '/about' },
  twitter: { card: 'summary_large_image', title: 'About | Nathan Watkins', description },
}

export default function Page() {
  return <AboutPage />
}
