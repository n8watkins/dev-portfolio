import { boldMapText } from './text'
import type { Visitor } from './geo'

export const MONO = 'font-mono font-bold leading-none whitespace-nowrap'

/**
 * What the bold map's card shows with or without the map: its navy, the band
 * under the title and the screen-reader sentence. The lazy card shows it alone
 * until the map has loaded, so nothing moves when it arrives. There is no
 * caption (owner, 2026-11-25: "dont need those captions").
 */
export default function Backdrop({ visitor }: { visitor: Visitor | null }) {
  return (
    <>
      <p className="sr-only">{boldMapText(visitor)}</p>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[40%] bg-linear-to-t from-[#0d304c] from-24% via-[#0d304c]/72 via-46% to-[#0d304c]/0"
      />
    </>
  )
}
