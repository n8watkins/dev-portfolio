import CurrentBuildsCarousel from '@/components/ui/BentoComponents/CurrentBuildsCarousel'
import type { GridItemConfig } from '@/lib/types/gridItem'

/**
 * Grid Item 6: "Building in public" - a bento card with a carousel of the
 * projects I'm shipping in public (TL;DW, Portfolio Rank), each with its own
 * icon, its stack, a timer, and a link to its page on n8builds.dev.
 */
export const gridItem6: GridItemConfig = {
  id: 6,
  title: '',
  description: '',
  gridItemContainer: 'col-span-2 row-span-3 md:col-span-4 md:row-span-2 xl:row-span-3',

  textContainerClassName: '',
  titleClassName: '',
  textOrder: '',
  buttonContainer: '',
  buttonClass: '',

  renderForeground: () => <CurrentBuildsCarousel />,
}
