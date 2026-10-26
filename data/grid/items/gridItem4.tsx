import Image from 'next/image'
import ResumeButtons from '@/components/ui/BentoComponents/ResumeButtons'
import type { GridItemConfig } from '@/lib/types/gridItem'

/**
 * Grid Item 4: "Check out my resume!" - Resume download/view actions
 *
 * INTERACTION STRATEGY:
 * - Resume icon with hover animation (scale + translate)
 * - Title animates up on hover to reveal buttons
 * - Two action buttons: Download PDF and View Online
 */
const buttonContainer = 'flex items-center justify-evenly z-50 w-full h-full pb-14'
const buttonClass =
  'inline-flex h-12 py-2 px-6 z-[5000] animate-shimmer items-center justify-center rounded-md border border-slate-800 bg-[length:200%_100%] font-medium text-slate-200 transition-transform focus:outline-none focus:ring-0 focus:ring-offset-slate-50 hover:scale-105 animate-duration-[3000ms] cursor-pointer'

export const gridItem4: GridItemConfig = {
  id: 4,
  title: 'Check out my resume!',
  description: '',
  gridItemContainer:
    'col-span-2 row-span-2 md:row-span-1 md:col-span-2  lg:col-span-2 xl:row-span-2 xl:col-span-2 group  ',

  imgContainerClass: '  ',
  imgClassName:
    'absolute w-full h-full pl-52 1sm:pt-10 1sm:h-[10rem] pt-0 rounded-3xl  z-10 group-hover:scale-105 transition duration-500 group-hover:translate-y-10 group-hover:translate-x-6  ',
  img: '/bento/resume.svg',

  textContainerClassName:
    'flex items-center justify-start xs:pl-10 1sm:pl-5  w-full h-full whitespace-nowrap dark:via-[#0d304c]/90 dark:to-[#0d304c]/0 ',

  // Keyboard focus on a button reveals them like hover does; the title steps aside.
  textOrder:
    'group-focus-within:opacity-0 group-hover:opacity-100 group-hover:-translate-y-20 group-hover:translate-x-[3.5rem] 1sm:group-hover:translate-x-[0rem] sm:group-hover:translate-x-[5.5rem] duration-200 md:group-hover:translate-x-[1rem] xl:group-hover:translate-x-[3rem] ',

  titleClassName:
    'flex transition duration-300  pt-[5rem] z-30 font-sans font-bold   select-none text-slate-200 dark:text-neutral-200  text-2xl lg:text-3xl text-start w-full',

  buttonContainer,
  buttonClass,

  renderBackground: () => (
    <div className="relative w-full h-full overflow-hidden">
      <div className="relative w-full h-full   ">
        <Image
          src="/bento/resume.svg"
          fill
          sizes="100%"
          className="absolute w-full h-full pl-52 1sm:pt-10 1sm:h-[10rem] pt-0 rounded-3xl  z-10 group-hover:scale-105 transition duration-500 group-hover:translate-y-10 group-hover:translate-x-6  "
          alt=""
          loading="lazy"
        />
      </div>
    </div>
  ),

  renderContent: () => <ResumeButtons buttonClass={buttonClass} buttonContainer={buttonContainer} />,
}
