import Image from 'next/image'
import WrenMark from './WrenMark'
import type { Project } from '@/lib/types'

/**
 * A project's icon beside its name: its image, or for Wren its animated bird
 * on a dark tile (owner, round 5 of 2026-11-09: "keep the animated bird as its
 * icon"). `className` sizes the tile.
 */
export default function ProjectIcon({
  project,
  size,
  className,
}: {
  project: Project
  size: number
  className: string
}) {
  if (project.mark === 'wren') {
    return (
      <span
        aria-hidden="true"
        className={`flex shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-[#0a1322] text-slate-100 shadow-lg shadow-black/40 ${className}`}
      >
        <WrenMark size={Math.round(size * 0.62)} />
      </span>
    )
  }
  return (
    <Image
      src={project.icon}
      alt=""
      width={size}
      height={size}
      unoptimized={project.icon.endsWith('.svg')}
      className={`shrink-0 rounded-2xl shadow-lg shadow-black/40 ${className}`}
    />
  )
}
