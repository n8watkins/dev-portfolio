'use client'
import { cn } from '@/lib/utils'
import { useEffect, useRef, useSyncExternalStore } from 'react'
import { useTheme } from 'next-themes'

// The user agent never changes, so there is nothing to subscribe to.
const subscribeToNothing = () => () => {}

export const BackgroundGradientAnimation = ({
  gradientBackgroundStart = 'rgb(190, 140, 220)', // Light purple
  gradientBackgroundEnd = 'rgb(100, 140, 220)', // Blue-purple
  firstColor = '80, 60, 200', // Deep purple
  secondColor = '180, 130, 220', // Medium purple
  thirdColor = '140, 100, 240', // Bright purple
  fourthColor = '200, 100, 220', // Pink-purple
  fifthColor = '160, 140, 240', // Lavender
  pointerColor = '120, 80, 220', // Purple
  size = '80%',
  blendingValue = 'soft-light',
  children,
  className,
  interactive = true,
  containerClassName,
}: {
  gradientBackgroundStart?: string
  gradientBackgroundEnd?: string
  firstColor?: string
  secondColor?: string
  thirdColor?: string
  fourthColor?: string
  fifthColor?: string
  pointerColor?: string
  size?: string
  blendingValue?: string
  children?: React.ReactNode
  className?: string
  interactive?: boolean
  containerClassName?: string
}) => {
  const interactiveRef = useRef<HTMLDivElement>(null)
  const { resolvedTheme } = useTheme()

  // Animation position/target are tracked in refs (not state) so the per-frame
  // requestAnimationFrame loop never triggers React re-renders. Driving this via
  // state caused an infinite setState->render->effect loop under React 19.
  const curX = useRef(0)
  const curY = useRef(0)
  const tgX = useRef(0)
  const tgY = useRef(0)

  useEffect(() => {
    const isLightMode = resolvedTheme === 'light'
    document.body.style.setProperty(
      '--gradient-background-start',
      isLightMode ? gradientBackgroundStart : 'rgb(12, 74, 110)'
    )
    document.body.style.setProperty(
      '--gradient-background-end',
      isLightMode ? gradientBackgroundEnd : 'rgb(15, 23, 42)'
    )
    document.body.style.setProperty('--first-color', isLightMode ? firstColor : '56, 189, 248')
    document.body.style.setProperty('--second-color', isLightMode ? secondColor : '59, 130, 246')
    document.body.style.setProperty('--third-color', isLightMode ? thirdColor : '14, 165, 233')
    document.body.style.setProperty('--fourth-color', isLightMode ? fourthColor : '99, 102, 241')
    document.body.style.setProperty('--fifth-color', isLightMode ? fifthColor : '34, 211, 238')
    document.body.style.setProperty('--pointer-color', pointerColor)
    document.body.style.setProperty('--size', size)
    document.body.style.setProperty('--blending-value', isLightMode ? blendingValue : 'hard-light')
  }, [
    resolvedTheme,
    gradientBackgroundStart,
    gradientBackgroundEnd,
    firstColor,
    secondColor,
    thirdColor,
    fourthColor,
    fifthColor,
    pointerColor,
    size,
    blendingValue,
  ])

  useEffect(() => {
    let frameId: number
    function move() {
      if (interactiveRef.current) {
        curX.current += (tgX.current - curX.current) / 20
        curY.current += (tgY.current - curY.current) / 20
        interactiveRef.current.style.transform = `translate(${Math.round(
          curX.current
        )}px, ${Math.round(curY.current)}px)`
      }
      frameId = requestAnimationFrame(move)
    }

    frameId = requestAnimationFrame(move)
    return () => cancelAnimationFrame(frameId)
  }, [])

  // Attached to the container (not the blob) so the glow tracks the cursor
  // even over text/children; the blob's own rect moves with its transform.
  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    tgX.current = event.clientX - rect.left
    tgY.current = event.clientY - rect.top
  }

  const isSafari = useSyncExternalStore(
    subscribeToNothing,
    () => /^((?!chrome|android).)*safari/i.test(navigator.userAgent),
    () => false
  )

  return (
    <div
      onMouseMove={interactive ? handleMouseMove : undefined}
      className={cn(
        'absolute w-full h-full z-50 overflow-hidden top-0 left-0 bg-[linear-gradient(40deg,var(--gradient-background-start),var(--gradient-background-end))] animate-fade duration-500',
        containerClassName
      )}>
      <svg className="hidden">
        <defs>
          <filter id="blurMe">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>
      <div className={cn('', className)}>{children}</div>
      <div
        className={cn(
          'gradients-container h-full w-full blur-lg',
          isSafari ? 'blur-2xl' : '[filter:url(#blurMe)_blur(40px)]'
        )}>
        <div
          className={cn(
            `absolute [background:radial-gradient(circle_at_center,_var(--first-color)_0,_var(--first-color)_50%)_no-repeat]`,
            `[mix-blend-mode:var(--blending-value)] w-[var(--size)] h-[var(--size)] top-[calc(50%-var(--size)/2)] left-[calc(50%-var(--size)/2)]`,
            `[transform-origin:center_center]`,
            `animate-first`,
            `opacity-100`
          )}></div>
        <div
          className={cn(
            `absolute [background:radial-gradient(circle_at_center,_rgba(var(--second-color),_0.8)_0,_rgba(var(--second-color),_0)_50%)_no-repeat]`,
            `[mix-blend-mode:var(--blending-value)] w-[var(--size)] h-[var(--size)] top-[calc(50%-var(--size)/2)] left-[calc(50%-var(--size)/2)]`,
            `[transform-origin:calc(50%-400px)]`,
            `animate-second`,
            `opacity-100`
          )}></div>
        <div
          className={cn(
            `absolute [background:radial-gradient(circle_at_center,_rgba(var(--third-color),_0.8)_0,_rgba(var(--third-color),_0)_50%)_no-repeat]`,
            `[mix-blend-mode:var(--blending-value)] w-[var(--size)] h-[var(--size)] top-[calc(50%-var(--size)/2)] left-[calc(50%-var(--size)/2)]`,
            `[transform-origin:calc(50%+400px)]`,
            `animate-third`,
            `opacity-100`
          )}></div>
        <div
          className={cn(
            `absolute [background:radial-gradient(circle_at_center,_rgba(var(--fourth-color),_0.8)_0,_rgba(var(--fourth-color),_0)_50%)_no-repeat]`,
            `[mix-blend-mode:var(--blending-value)] w-[var(--size)] h-[var(--size)] top-[calc(50%-var(--size)/2)] left-[calc(50%-var(--size)/2)]`,
            `[transform-origin:calc(50%-200px)]`,
            `animate-fourth`,
            `opacity-70`
          )}></div>
        <div
          className={cn(
            `absolute [background:radial-gradient(circle_at_center,_rgba(var(--fifth-color),_0.8)_0,_rgba(var(--fifth-color),_0)_50%)_no-repeat]`,
            `[mix-blend-mode:var(--blending-value)] w-[var(--size)] h-[var(--size)] top-[calc(50%-var(--size)/2)] left-[calc(50%-var(--size)/2)]`,
            `[transform-origin:calc(50%-800px)_calc(50%+800px)]`,
            `animate-fifth`,
            `opacity-100`
          )}></div>

        {interactive && (
          <div
            ref={interactiveRef}
            className={cn(
              `absolute [background:radial-gradient(circle_at_center,_rgba(var(--pointer-color),_0.8)_0,_rgba(var(--pointer-color),_0)_50%)_no-repeat]`,
              `[mix-blend-mode:var(--blending-value)] w-full h-full -top-1/2 -left-1/2`,
              `opacity-70 pointer-events-none`
            )}></div>
        )}
      </div>
    </div>
  )
}

export default BackgroundGradientAnimation
