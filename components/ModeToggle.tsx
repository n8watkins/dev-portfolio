'use client'

import * as React from 'react'
import { MoonIcon, SunIcon } from '@radix-ui/react-icons'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'

export function ModeToggle() {
  const { setTheme } = useTheme()

  return (
    <div className="p-0 ">
      <Button
        variant="ghost"
        className=" cursor-pointer  dark:text-white text-black  focus:border-none! focus:ring-orange-500! hover:bg-transparent"
        size="icon">
        <SunIcon
          className=" h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 "
          onClick={() => setTheme('dark')}
        />
        <MoonIcon
          className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
          onClick={() => setTheme('light')}
        />
        <span className="sr-only">Toggle theme</span>
      </Button>
    </div>
  )
}
