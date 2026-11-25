import type { ReactNode } from 'react'
import type { GridItemConfig } from '@/lib/types/gridItem'
import { gridItem2 } from './gridItem2'

/**
 * Grid Item 2, bold: "Ready to relocate" with the bold 3D map
 * (components/ui/BoldMap) in place of the globe picture and its arcs.
 *
 * On trial at /lab/map (owner, 2026-11-24): not in `gridItems` yet. To put it
 * on the home page, give it the visitor and swap it for gridItem2 there.
 * The map draws its own caption, pin, labels and the band under the title;
 * the title is the card's own, placed as in the lab sketch.
 */
export function gridItem2Bold(map: () => ReactNode): GridItemConfig {
  return {
    id: 2,
    title: 'Ready to relocate',
    description: '',
    // The same place in the grid as gridItem2; a container, so the title can
    // follow the card's own width rather than the window's.
    gridItemContainer: `${gridItem2.gridItemContainer} @container`,
    textContainerClassName: 'bottom-0 left-0 w-full pointer-events-none',
    titleClassName:
      'pb-[26px] pl-5 text-2xl leading-[1.21] font-bold tracking-[-0.01em] text-neutral-200 select-none @min-[400px]:pb-[30px] @min-[400px]:pl-[22px] @min-[400px]:text-[34px]',
    textOrder: 'group-hover:translate-x-2 duration-200',
    renderBackground: map,
  }
}
