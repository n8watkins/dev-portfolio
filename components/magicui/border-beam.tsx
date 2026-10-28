import { cn } from '@/lib/utils'

interface BorderBeamProps {
  className?: string
  size?: number // Now interpreted as rem
  duration?: number
  borderWidth?: number // Now interpreted as rem
  anchor?: number
  colorFrom?: string
  colorTo?: string
  delay?: number
  offset?: number // Now interpreted as rem
  startPosition?: number // New prop to handle different starting positions
}

export const BorderBeam = ({
  className,
  size = 12.5, // Default 200px / 16 = 12.5rem
  duration = 15,
  anchor = 90,
  borderWidth = 0.15, // Default 1.5px / 16 = 0.09375rem
  colorFrom = '#ffaa40',
  colorTo = '#9c40ff',
  delay = 0,
  offset = 0, // Default offset is 0rem
  startPosition = 0, // New prop to adjust starting position (in percentage or time)
}: BorderBeamProps) => {
  return (
    <div
      style={
        {
          '--size': `${size}rem`,
          '--duration': duration,
          '--anchor': anchor,
          '--border-width': `${borderWidth}rem`,
          '--color-from': colorFrom,
          '--color-to': colorTo,
          '--delay': `-${delay + startPosition}s`, // Updated to include the startPosition
          '--offset': `${offset}rem`,
        } as React.CSSProperties
      }
      className={cn(
        'pointer-events-none absolute inset-0 rounded-[inherit]',
        '[border:calc(var(--border-width))_solid_transparent]',

        // Adjusted to include offset in rem
        'inset-[calc(var(--offset)*-1)]',

        // mask styles
        '[mask-clip:padding-box,border-box]! mask-intersect! [mask:linear-gradient(transparent,transparent),linear-gradient(white,white)]',

        // pseudo styles
        'after:absolute after:aspect-square after:w-[calc(var(--size))] after:animate-border-beam after:[animation-delay:var(--delay)]',
        'after:[background:linear-gradient(to_left,var(--color-from),var(--color-to),transparent)]',
        'after:[offset-anchor:calc(var(--anchor)*1%)_50%]',
        // Adjusted to include offset in the animation path using rem
        'after:[offset-path:rect(calc(var(--offset)*-1)_calc(100%+var(--offset)*2)_calc(100%+var(--offset)*2)_calc(var(--offset)*-1)_round_calc((var(--size)+var(--offset)*2)))]',
        className
      )}
    />
  )
}
