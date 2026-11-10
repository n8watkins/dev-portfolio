import BuildLogCard from '@/components/ui/BentoComponents/BuildLogCard'
import type { GridItemConfig } from '@/lib/types/gridItem'

/**
 * Grid Item 6: the n8builds.dev build log, a month at a glance (owner, round 4
 * of 2026-11-09), beside "Have a project?". Live from n8builds.dev; the arrows
 * cycle the months and the rest of the card opens the full build log.
 */
export const gridItem6: GridItemConfig = {
  id: 6,
  title: '',
  description: '',
  gridItemContainer:
    'col-span-2 row-span-3 md:col-span-4 md:row-span-2 lg:row-span-2 xl:col-span-4 xl:row-span-3',
  renderForeground: () => <BuildLogCard />,
}
