import type { Metadata } from 'next'
import { connection } from 'next/server'
import MapLab from '@/components/lab/MapLab'
import { visitorFromQuery } from '@/components/ui/BoldMap/geo'
import { visitorFromRequest } from '@/lib/visitor'

// A hidden trial page (owner, 2026-11-24): not in the nav or the sitemap, and
// kept out of search results.
export const metadata: Metadata = {
  title: 'Map lab',
  description: 'A trial of the bold map for the Ready to relocate card.',
  robots: { index: false, follow: false },
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ from?: string | string[] }>
}) {
  // Per request: the visitor's rough location must never be cached for someone else.
  await connection()
  const { from } = await searchParams
  const query = typeof from === 'string' ? from : undefined
  const visitor = query !== undefined ? visitorFromQuery(query) : visitorFromRequest()
  return <MapLab visitor={visitor} source={query !== undefined ? 'query' : 'request'} />
}
