import dynamic from 'next/dynamic'
import type { GridItemConfig } from '@/lib/types/gridItem'

// Dynamic import with SSR disabled (client-side only)
const EmailButton = dynamic(() => import('@/components/ui/BentoComponents/EmailButton'), {
  ssr: false,
})

/**
 * Grid Item 5: Contact CTA - Email button with animation
 *
 * INTERACTION STRATEGY:
 * - Dynamically loaded email button (client-side only)
 * - Animated shimmer effect on button
 * - Opens contact form modal on click
 */
const buttonContainer = 'flex items-center  justify-evenly z-50     w-full h-full pt-10 '
const buttonClass =
  'inline-flex h-12  py-2 px-6  z-5000 animate-shimmer items-center justify-center rounded-md border border-slate-800  bg-size-[200%_100%] font-medium text-slate-200 transition-transform focus:outline-hidden focus:ring-0 focus:ring-offset-slate-50 hover:scale-105 animate-duration-[3000ms]'

export const gridItem5: GridItemConfig = {
  id: 5,
  title: '',
  description: '',
  gridItemContainer: 'col-span-2 row-span-2 md:row-span-1 lg:col-span-2 xl:row-span-2 ',

  imgClassName: '',
  img: '',

  textContainerClassName: '',
  titleClassName: ' pt-16 h-40  rounded-b-3xl select-none',
  textOrder: '',

  buttonContainer,
  buttonClass,

  renderForeground: () => (
    <div className="absolute w-full h-full">
      <EmailButton buttonClass={buttonClass} buttonContainer={buttonContainer} />
    </div>
  ),
}
