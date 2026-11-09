import type { Metadata } from 'next'
import StackPage from '@/components/StackPage'

const description =
  'The AI and the stack Nathan Watkins builds with, layer by layer, each with a line on why. And a dino to catch.'

export const metadata: Metadata = {
  title: 'Stack',
  description,
  alternates: { canonical: '/stack' },
  openGraph: { title: 'Stack | Nathan Watkins', description, url: '/stack' },
  twitter: { card: 'summary_large_image', title: 'Stack | Nathan Watkins', description },
}

export default function Page() {
  return <StackPage />
}
