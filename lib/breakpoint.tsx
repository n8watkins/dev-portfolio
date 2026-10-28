import React, { useState, useEffect } from 'react'

type Breakpoint = 'xs' | '1sm' | '1md' | '1lg' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

interface BreakpointConfig {
  name: Breakpoint
  minWidth: number
}

const breakpoints: BreakpointConfig[] = [
  { name: 'xs', minWidth: 0 },
  { name: '1sm', minWidth: 320 },
  { name: '1md', minWidth: 375 },
  { name: '1lg', minWidth: 425 },
  { name: 'sm', minWidth: 640 },
  { name: 'md', minWidth: 768 },
  { name: 'lg', minWidth: 1024 },
  { name: 'xl', minWidth: 1280 },
  { name: '2xl', minWidth: 1536 },
]

const BreakpointDisplay: React.FC = () => {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('xs')

  const getBreakpoint = (width: number): Breakpoint => {
    const currentBreakpoint = breakpoints
      .slice()
      .reverse()
      .find((bp) => width >= bp.minWidth)
    return currentBreakpoint ? currentBreakpoint.name : 'xs'
  }

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      setBreakpoint(getBreakpoint(width))
    }

    // Initial call
    handleResize()

    // Add event listener
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className=" z-6000 breakpoint-display fixed top-20 right-10 m-2   bg-blue-800! text-white dark:bg-white! px-5 dark:text-blue-800 text-lg rounded-2xl shadow-md">
      {breakpoint}
    </div>
  )
}

export default BreakpointDisplay
