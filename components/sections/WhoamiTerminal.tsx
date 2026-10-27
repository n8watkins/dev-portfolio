/**
 * The hero's `whoami` terminal, after n8builds.dev's
 * (n8builds-web components/features/WhoamiTerminal.tsx), with the hiring
 * message. The text is in the server HTML at full size, so it reads without
 * JavaScript and reserves its space (no layout shift); only a clip-path steps
 * across each line (`.whoami-type` in app/globals.css). Reduced motion shows
 * it all at once.
 */
export const whoamiTitle = { path: '~/whoami', name: 'Nathan Watkins' }
export const whoami: string[] = [
  'I build AI products end to end.',
  'Voice agents, research agents, chat.',
  'Open to full-time roles.',
]

/** Seconds per typed character, and the pause between lines. */
const CHAR = 0.032
const PAUSE = 0.3
/** Typing starts once the terminal has mostly faded in. */
const FIRST = 0.55

/** When each line starts, how long its cursor stays on it, and when the prompt returns. */
const typing = (() => {
  const starts: number[] = []
  const holds: number[] = []
  let t = FIRST
  whoami.forEach((line, i) => {
    starts.push(+t.toFixed(3))
    t += line.length * CHAR + PAUSE
    // The last line's cursor goes as the prompt's appears, so there is one cursor.
    holds.push(+(line.length * CHAR + (i < whoami.length - 1 ? PAUSE : 0)).toFixed(3))
  })
  return { starts, holds, end: +(t - PAUSE).toFixed(3) }
})()

export default function WhoamiTerminal({
  className = '',
  style,
}: {
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-white/10 bg-black/30 backdrop-blur-sm text-left ${className}`}
      style={style}
    >
      <div className="flex items-center gap-2 border-b border-white/5 px-4 py-2.5">
        <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-red-400/70" />
        <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-yellow-400/70" />
        <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-green-400/70" />
        <p className="ml-2 min-w-0 truncate font-mono text-[0.72rem] tracking-wide text-slate-400">
          <span className="text-cyan-400/80">{whoamiTitle.path}</span>
          <span className="text-slate-500"> :: </span>
          <span className="text-slate-200">{whoamiTitle.name}</span>
        </p>
      </div>
      {/* Each line stays on one line (a typed line can't wrap): on a phone the
          font scales with the screen so the longest line (36ch, ~22em) fits. */}
      <div className="space-y-1 whitespace-nowrap p-4 font-mono text-[min(0.85rem,calc((100vw-4.5rem-2px)/22.2))] leading-relaxed min-[400px]:p-5">
        {whoami.map((line, i) => (
          <p key={line} className="text-slate-300">
            <span
              className="whoami-type"
              style={
                {
                  '--chars': line.length,
                  '--start': `${typing.starts[i]}s`,
                  '--hold': `${typing.holds[i]}s`,
                } as React.CSSProperties
              }
            >
              <span>{line}</span>
            </span>
          </p>
        ))}
        <p
          className="whoami-prompt text-slate-500"
          style={{ '--start': `${typing.end}s` } as React.CSSProperties}
        >
          <span className="text-cyan-400">$</span> <span className="whoami-cursor">▊</span>
        </p>
      </div>
    </div>
  )
}
