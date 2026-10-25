import { shareSummary, summarize } from '@/lib/seo'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { projects } from '@/data/projects'
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
  const image = project.images?.[0] ? [{ url: project.images[0], alt: `${project.title} screenshot` }] : undefined
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
  return <ProjectDetail project={project} />
}
