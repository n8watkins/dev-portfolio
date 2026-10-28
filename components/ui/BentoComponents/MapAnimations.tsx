import React, { useEffect, useRef, useMemo, useSyncExternalStore } from 'react'
import { gsap } from 'gsap'

interface MapAnimationProps {
  imgClassName?: string
  imgContainerClass?: string
}

const subscribeToResize = (onChange: () => void) => {
  window.addEventListener('resize', onChange)
  return () => window.removeEventListener('resize', onChange)
}

const getScreenSize = (): string => {
  const width = window.innerWidth
  if (width <= 320) return '1sm'
  if (width <= 375) return '1md'
  if (width <= 425) return '1lg'
  if (width < 640) return 'xs'
  if (width < 768) return 'sm'
  if (width < 1024) return 'md'
  if (width < 1280) return 'lg'
  if (width < 1536) return 'xl'
  return '2xl'
}

const getPathsForSize = (size: string): string[] => {
  switch (size) {
    case '1sm':
      return ['M80,215 Q140,200 105,120', 'M80,215 Q150,190 190,250', 'M80,215 Q180,230 270,140']
    case '1md':
      return ['M90,210 Q140,200 110,120', 'M90,210 Q150,190 210,250', 'M90,210 Q180,230 320,140']
    case '1lg':
      return ['M90,210 Q150,180 120,120', 'M90,210 Q150,190 240,250', 'M90,210 Q180,230 360,140']
    case 'sm':
      return ['M95,210 Q160,200 130,120', 'M95,210 Q150,190 280,250', 'M95,210 Q180,230 420,140']
    case 'md':
      return ['M80,205 Q160,200 120,120', 'M80,205 Q120,220 185,250', 'M80,205 Q180,230 300,140']
    case 'lg':
      return ['M88,210 Q160,160 120,120', 'M88,210 Q150,190 220,250', 'M88,210 Q180,230 350,150']
    case 'xl':
      return ['M93,170 Q140,120 130,70', 'M93,170  Q200,175 270,220', 'M93,170 Q185,160 400,100']
    case '2xl':
      return ['M93,170 Q140,120 130,70', 'M93,170  Q200,175 270,220', 'M93,170 Q185,160 400,100']
    default:
      return ['M93,210 Q160,160 140,120', 'M93,210 Q150,190 250,250', 'M93,210 Q180,230 370,140']
  }
}

const MapAnimation: React.FC<MapAnimationProps> = ({ imgClassName, imgContainerClass }) => {
  const pathRefs = useMemo(
    () => [
      { current: null } as React.RefObject<SVGPathElement | null>,
      { current: null } as React.RefObject<SVGPathElement | null>,
      { current: null } as React.RefObject<SVGPathElement | null>,
    ],
    []
  )

  const timelinesRef = useRef<gsap.core.Timeline[]>([])

  // null during server render and hydration, so the animation mounts on the client only
  const screenSize = useSyncExternalStore(subscribeToResize, getScreenSize, () => null)
  const paths = screenSize ? getPathsForSize(screenSize) : []

  useEffect(() => {
    if (!screenSize) return

    // Clear existing animations
    timelinesRef.current.forEach((timeline) => timeline.kill())
    timelinesRef.current = []

    pathRefs.forEach((pathRef, index) => {
      const path = pathRef.current

      if (path) {
        const length = path.getTotalLength()
        gsap.set(path, {
          strokeDasharray: length,
          strokeDashoffset: length,
        })

        const timeline = gsap.timeline({
          repeat: -1,
          repeatDelay: 1,
        })

        timeline
          .to(path, {
            strokeDashoffset: 0,
            duration: 3,
            ease: 'power1.inOut',
            delay: index * 1.5,
          })
          .to(path, {
            strokeDashoffset: -length,
            duration: 1.5,
            ease: 'power1.inOut',
          })

        // Store the timeline in the ref
        timelinesRef.current.push(timeline)
      }
    })

    // Cleanup function
    return () => {
      timelinesRef.current.forEach((timeline) => timeline.kill())
    }
  }, [screenSize, pathRefs])

  if (!screenSize) return null

  return (
    <div
      className={`absolute -top-62 -left-8 z-30 flex items-center justify-center w-120 h-160 animate-fade duration-500`}>
      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <defs>
          <marker
            id="neon-sky-circle"
            markerWidth="10"
            markerHeight="10"
            refX="5"
            refY="5"
            orient="auto"
            markerUnits="strokeWidth">
            <circle cx="5" cy="5" r="1.5" fill="#c21b6e" />
          </marker>
          <linearGradient id="neonPurpleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#012485 " />
            <stop offset="50%" stopColor="#6719cf" />
            <stop offset="100%" stopColor="#a218ba" />
          </linearGradient>
        </defs>

        {paths.map((path, index) => (
          <path
            key={index}
            ref={pathRefs[index]}
            d={path}
            stroke="url(#neonPurpleGradient)"
            strokeWidth="5"
            fill="none"
            markerEnd="url(#neon-sky-circle)"
            className="neon-path"
          />
        ))}
      </svg>
    </div>
  )
}

export default MapAnimation
