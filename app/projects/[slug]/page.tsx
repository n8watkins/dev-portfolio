import { shareSummary, summarize } from '@/lib/seo'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { projects } from '@/data/projects'
import CornerLinks from '@/components/layout/CornerLinks'
import PageFooter from '@/components/layout/PageFooter'
import ProjectDetail from '@/components/Projects/ProjectDetail'

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const project = projects.find((p) => p.slug === slug)
  if (!project) return { title: 'Project not found' }
  const title = `${project.title} - ${project.subTitle}`
  const share = shareSummary(project.des)
  const shareImage = project.shareImage ?? project.images?.[0]?.src
  const image = shareImage ? [{ url: shareImage, alt: `${project.title} screenshot` }] : undefined
  return {
    title,
    description: summarize(project.des),
    alternates: { canonical: `/projects/${slug}` },
    openGraph: { title, description: share, url: `/projects/${slug}`, images: image },
    twitter: { card: 'summary_large_image', title, description: share, images: image },
  }
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const project = projects.find((p) => p.slug === slug)
  if (!project) notFound()
  return (
    <>
      <CornerLinks />
      <ProjectDetail project={project} />
      <PageFooter />
    </>
  )
}
