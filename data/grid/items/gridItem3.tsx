import { TechStack } from '@/components/features/TechStack'
import type { GridItemConfig } from '@/lib/types/gridItem'

/**
 * Grid Item 3: "My tech stack" - Animated technology showcase
 *
 * VISUAL STRATEGY:
 * - TechStack component in foreground with infinite scroll animation
 * - Gradient overlay at bottom for text readability
 * - Title and description at bottom with hover effect
 */
export const gridItem3: GridItemConfig = {
  id: 3,
  title: 'My tech stack',
  description: 'I constantly try to improve',
  // One row taller on phones than the relocate card: the dino's roar bubble
  // needs headroom above the first row, and the title needs the bottom.
  gridItemContainer:
    'col-span-2 row-span-5 md:col-span-2 md:row-span-3 lg:col-span-2 lg:row-span-3 xl:col-span-2 xl:row-span-4',

  imgClassName: '',
  img: '',

  textContainerClassName:
    'absolute  bottom-0 pt-16 h-40 w-full bg-gradient-to-t rounded-b-3xl from-blue-500 via-blue-500 to-blue-500/0 dark:from-[#0d304c] dark:via-[#0d304c]/90 dark:to-[#0d304c]/0 z-30 text-slate-200 dark:text-white  ',

  textOrder: 'flex flex-col-reverse xs:pl-10 1sm:pl-5 group-hover:translate-x-2 duration-200',

  titleClassName: ' font-sans font-bold text-2xl lg:text-4xl items-center  select-none ',

  descriptionClass: 'relative text-base w-[50%]  font-bold nowrap whitespace-nowrap select-none ',

  buttonContainer: '',
  buttonClass: '',

  // The dino measures the rows once it loads; a scaling entrance would skew that.
  entrance: 'fade',
  renderForeground: () => <TechStack />,
}
