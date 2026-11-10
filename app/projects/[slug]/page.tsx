import { shareSummary, summarize } from '@/lib/seo'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { projects } from '@/data/projects'
import { FloatingNav } from '@/components/layout/FloatingNav'
import Footer from '@/components/layout/Footer'
import { subpageNavItems } from '@/data/navigation'
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
      <FloatingNav navItems={subpageNavItems} />
      <ProjectDetail project={project} />
      <div className="relative overflow-hidden bg-darkBlue">
        <div className="mx-auto max-w-md sm:max-w-xl md:max-w-3xl lg:max-w-4xl xl:max-w-6xl 2xl:max-w-7xl">
          <Footer />
        </div>
      </div>
    </>
  )
}
