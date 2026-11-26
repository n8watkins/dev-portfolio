import type { ReactNode } from 'react'
import BoldMapLazy from '@/components/ui/BoldMap/BoldMapLazy'
import type { GridItemConfig } from '@/lib/types/gridItem'

/**
 * Grid Item 2: "Ready to relocate", with the bold 3D map (components/ui/BoldMap;
 * owner, 2026-11-25, after trying it at /lab/map). It replaced the globe
 * picture and its gsap arcs.
 *
 * The map draws its own caption, pin, labels and the band under the title; the
 * title is the card's own. `relocateCard` takes the map to show, so the lab
 * page can give it a visitor of its choosing (`?from=`).
 */
export function relocateCard(map: () => ReactNode): GridItemConfig {
  return {
    id: 2,
    title: 'Ready to relocate',
    description: '',
    // A container, so the title follows the card's own width, not the window's.
    gridItemContainer:
      'col-span-2 row-span-4 md:col-span-2 md:row-span-3 lg:col-span-2 lg:row-span-3 xl:col-span-5 xl:row-span-4 @container',
    textContainerClassName: 'bottom-0 left-0 w-full pointer-events-none',
    titleClassName:
      'pb-[26px] pl-5 text-2xl leading-[1.21] font-bold tracking-[-0.01em] text-neutral-200 select-none @min-[400px]:pb-[30px] @min-[400px]:pl-[22px] @min-[400px]:text-[34px]',
    textOrder: 'group-hover:translate-x-2 duration-200',
    renderBackground: map,
  }
}

/** On the home page: the map loads as the card nears the screen and asks /api/where itself. */
export const gridItem2: GridItemConfig = relocateCard(() => <BoldMapLazy />)
