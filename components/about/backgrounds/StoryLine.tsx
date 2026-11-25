'use client'

import { useEffect, useId, useMemo, useRef } from 'react'
import { useMotionValueEvent, useScroll } from 'motion/react'
import { clamp01, type StoryLayout } from './shared'

/** The pixels that flip in around each scene's stop: offsets from the stop, size, colour. */
const PIXELS: { dx: number; dy: number; s: number; c: string }[] = [
  { dx: -14, dy: -10, s: 6, c: '#38bdf8' },
  { dx: 10, dy: -16, s: 4, c: '#22d3ee' },
  { dx: 14, dy: 6, s: 6, c: '#60a5fa' },
  { dx: -10, dy: 14, s: 4, c: '#818cf8' },
  { dx: 22, dy: -4, s: 3, c: '#7dd3fc' },
]
/** On phones the line runs in the 16px gutter, so the pixels keep to it. */
const PIXELS_NARROW: typeof PIXELS = [
  { dx: -5, dy: -14, s: 4, c: '#38bdf8' },
  { dx: 4, dy: -22, s: 3, c: '#22d3ee' },
  { dx: 4, dy: 10, s: 4, c: '#60a5fa' },
  { dx: -5, dy: 18, s: 3, c: '#818cf8' },
]

/**
 * Option 3: a thin line that draws itself down the page as you read, linking
 * the scenes. It runs from under the opening, down the gap between each
 * scene's photo and its words (in the left gutter on phones), to the ways on
 * at the end; its tip sits a little below the middle of the screen. As the
 * tip reaches a scene, a few pixels flip in around that scene's stop. The
 * drawing is a clip done with transforms (a window sliding down over the
 * line), and the pixels turn and fade, so only transform and opacity change.
 * Reduced motion: the line is drawn in full and the pixels are all there.
 */
export default function StoryLine({ layout, reduce }: { layout: StoryLayout; reduce: boolean }) {
  const id = useId()
  const { scrollY } = useScroll()
  const slide = useRef<HTMLDivElement>(null)
  const unslide = useRef<HTMLDivElement>(null)
  const tip = useRef<HTMLDivElement>(null)
  const path = useRef<SVGPathElement>(null)
  const stops = useRef<(HTMLDivElement | null)[]>([])
  const samples = useRef<{ y: number; x: number }[]>([])

  const wide = layout.width >= 768
  const { d, start, end, nodes } = useMemo(() => {
    const scenes = layout.parts.filter((p) => p.id !== 'intro' && p.id !== 'end')
    const intro = layout.parts.find((p) => p.id === 'intro')
    const ways = layout.parts.find((p) => p.id === 'end')
    if (!scenes.length || !intro || !ways) return { d: '', start: 0, end: 0, nodes: [] }
    const mid = (p: (typeof scenes)[number]) => (p.left + p.right) / 2
    // Where the line passes each scene: the gap between photo and words
    // (photo on the left for the 1st and 3rd, so the gap is right of centre).
    const xOf = (p: (typeof scenes)[number], i: number) => (wide ? mid(p) + (i % 2 === 0 ? 28 : -28) : p.left - 8)
    const top = intro.bottom + (wide ? 56 : 40)
    const bottom = ways.top
    const x0 = wide ? mid(scenes[0]) : xOf(scenes[0], 0)
    let path = `M ${x0} ${top}`
    let x = x0
    let y = top
    const nodes: { x: number; y: number }[] = []
    scenes.forEach((p, i) => {
      const nx = xOf(p, i)
      const ny = p.top
      const bend = (ny - y) * 0.5
      path += ` C ${x} ${y + bend}, ${nx} ${ny - bend}, ${nx} ${ny}`
      nodes.push({ x: nx, y: ny })
      path += ` L ${nx} ${p.bottom}`
      x = nx
      y = p.bottom
    })
    const ex = wide ? (ways.left + ways.right) / 2 : x
    const bend = (bottom - y) * 0.5
    path += ` C ${x} ${y + bend}, ${ex} ${bottom - bend}, ${ex} ${bottom}`
    nodes.push({ x: ex, y: bottom })
    return { d: path, start: top, end: bottom, nodes }
  }, [layout, wide])
  const height = Math.max(1, end - start)

  // Sample the path once per layout, to place the tip on it while scrolling.
  useEffect(() => {
    const el = path.current
    if (!el || !d) return
    const total = el.getTotalLength()
    const out: { x: number; y: number }[] = []
    for (let i = 0; i <= 400; i++) {
      const pt = el.getPointAtLength((total * i) / 400)
      out.push({ x: pt.x, y: pt.y })
    }
    samples.current = out
  }, [d])

  const paint = (scroll: number) => {
    const head = reduce ? end : scroll - layout.top + layout.vh * 0.62
    const p = clamp01((head - start) / height)
    const hidden = (1 - p) * height
    if (slide.current) slide.current.style.transform = `translate3d(0, ${(-hidden).toFixed(1)}px, 0)`
    if (unslide.current) unslide.current.style.transform = `translate3d(0, ${hidden.toFixed(1)}px, 0)`
    const y = start + p * height
    if (tip.current) {
      const s = samples.current
      let x = s[0]?.x ?? 0
      for (const pt of s) {
        if (pt.y > y) break
        x = pt.x
      }
      tip.current.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(45deg)`
      tip.current.style.opacity = reduce || p <= 0 || p >= 1 ? '0' : '1'
    }
    nodes.forEach((node, i) => {
      const el = stops.current[i]
      if (!el) return
      const on = reduce || head >= node.y - 4
      if ((el.dataset.on === '1') !== on) el.dataset.on = on ? '1' : '0'
    })
  }
  useEffect(() => paint(scrollY.get()))
  useMotionValueEvent(scrollY, 'change', paint)

  if (!d) return null
  const pixels = wide ? PIXELS : PIXELS_NARROW
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      {/* The drawn line: a window that slides down over it. */}
      <div className="absolute inset-x-0 overflow-hidden" style={{ top: start, height }}>
        <div ref={slide} className="absolute inset-0 overflow-hidden" style={{ transform: 'translate3d(0,-100%,0)' }}>
          <div ref={unslide} className="absolute inset-0" style={{ transform: 'translate3d(0,100%,0)' }}>
            <svg
              className="absolute left-0 overflow-visible"
              style={{ top: -start }}
              width={layout.width}
              height={layout.height}
            >
              <defs>
                <linearGradient id={id} x1="0" y1={start} x2="0" y2={end} gradientUnits="userSpaceOnUse">
                  <stop offset="0" stopColor="#38bdf8" />
                  <stop offset="0.4" stopColor="#3b82f6" />
                  <stop offset="0.7" stopColor="#22d3ee" />
                  <stop offset="1" stopColor="#818cf8" />
                </linearGradient>
              </defs>
              <path ref={path} d={d} fill="none" stroke={`url(#${id})`} strokeOpacity={0.55} strokeWidth={2} />
            </svg>
          </div>
        </div>
      </div>
      {/* The faint track still to come. */}
      <svg className="absolute top-0 left-0" width={layout.width} height={layout.height}>
        <path d={d} fill="none" stroke="rgba(148,163,184,0.09)" strokeWidth={2} strokeDasharray="2 8" />
      </svg>
      {/* The tip: a small lit pixel riding the end of the line. */}
      <div
        ref={tip}
        className="absolute top-0 left-0 -mt-[4px] -ml-[4px] h-2 w-2 bg-sky-300 shadow-[0_0_12px_3px_rgba(56,189,248,0.55)]"
        style={{ opacity: 0 }}
      />
      {nodes.map((node, i) => (
        <div
          key={i}
          ref={(el) => {
            stops.current[i] = el
          }}
          data-on="0"
          className="group absolute top-0 left-0"
          style={{ transform: `translate3d(${node.x}px, ${node.y}px, 0)` }}
        >
          <span className="absolute -mt-[5px] -ml-[5px] h-2.5 w-2.5 rotate-45 border border-sky-300/70 bg-darkBlue" />
          <span className="absolute -mt-[5px] -ml-[5px] h-2.5 w-2.5 rotate-45 bg-sky-400 opacity-0 shadow-[0_0_10px_2px_rgba(56,189,248,0.45)] transition-opacity duration-500 group-data-[on=1]:opacity-100 motion-reduce:transition-none" />
          {pixels.map((px, j) => (
            <span
              key={j}
              className="absolute opacity-0 transition-[opacity,transform] duration-500 ease-out [transform:rotateY(90deg)_scale(0.4)] group-data-[on=1]:opacity-100 group-data-[on=1]:[transform:none] motion-reduce:transition-none"
              style={{
                left: px.dx - px.s / 2,
                top: px.dy - px.s / 2,
                width: px.s,
                height: px.s,
                background: px.c,
                transitionDelay: `${120 + j * 90}ms`,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
