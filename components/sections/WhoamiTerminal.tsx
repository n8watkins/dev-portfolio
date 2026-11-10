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
  'Open to full-time, part-time or contract roles.',
]
/**
 * Below 400px the roles line types as two, so the text stays readable: on one
 * line its 47 characters would shrink to about 9px on a 320px phone.
 */
export const whoamiNarrow: string[] = [
  'I build AI products end to end.',
  'Open to full-time, part-time',
  'or contract roles.',
]

/** Seconds per typed character, and the pause between lines. */
const CHAR = 0.032
const PAUSE = 0.3
/** Typing starts once the terminal has mostly faded in. */
const FIRST = 0.55

/** When each line starts, how long its caret stays on it, and when the end cursor takes over. */
const timing = (lines: string[]) => {
  const starts: number[] = []
  const holds: number[] = []
  let t = FIRST
  lines.forEach((line, i) => {
    starts.push(+t.toFixed(3))
    t += line.length * CHAR + PAUSE
    // The last line's caret goes as the end cursor appears, so there is one cursor.
    holds.push(+(line.length * CHAR + (i < lines.length - 1 ? PAUSE : 0)).toFixed(3))
  })
  return { starts, holds, end: +(t - PAUSE).toFixed(3) }
}

/** The typed lines, the last ending in a blinking cursor (the caret's own box and place). */
function Lines({ lines, className }: { lines: string[]; className: string }) {
  const typing = timing(lines)
  return (
    <div className={className}>
      {lines.map((line, i) => (
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
            {i === lines.length - 1 && (
              <span
                aria-hidden="true"
                className="whoami-cursor"
                style={{ '--end': `${typing.end}s` } as React.CSSProperties}
              />
            )}
          </span>
        </p>
      ))}
    </div>
  )
}

export default function WhoamiTerminal({
  className = '',
  style,
}: {
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-white/10 bg-black/30 backdrop-blur-xs text-left ${className}`}
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
      {/* Each line stays on one line (a typed line can't wrap). From 400px the
          roles line is one line, the font scaling down with the screen until
          its 47ch (~28.2em) fit; below that it types as two lines. Only one
          set shows (the other is display: none), so it is read once. */}
      <div className="whitespace-nowrap p-4 font-mono leading-relaxed min-[400px]:p-5">
        <Lines
          lines={whoami}
          className="hidden space-y-1 text-[min(0.85rem,calc((100vw-4.5rem-2px)/28.4))] min-[400px]:block"
        />
        <Lines
          lines={whoamiNarrow}
          className="space-y-1 text-[min(0.85rem,calc((100vw-4.5rem-2px)/18.8))] min-[400px]:hidden"
        />
      </div>
    </div>
  )
}
