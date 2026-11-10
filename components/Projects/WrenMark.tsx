'use client'

import { useId } from 'react'

/**
 * Wren's mark, from its own repo (n8watkins/wren, components/WrenMark.tsx):
 * ink body, ember beak, cocked tail. Idle, it flicks its tail and tilts its
 * head now and then (app/globals.css, `svg.wren`); still under reduced motion.
 * Its eye and wing line are masks, defined inline with ids of their own.
 */
export default function WrenMark({
  size = 40,
  className = '',
}: {
  size?: number
  className?: string
}) {
  const id = useId().replace(/:/g, '')
  const eye = `wren-eye-${id}`
  const wing = `wren-wing-${id}`
  return (
    <svg
      className={`wren idle overflow-visible ${className}`}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      aria-hidden="true"
    >
      <defs>
        <mask id={eye} maskUnits="userSpaceOnUse" x="-4" y="-4" width="40" height="40">
          <rect x="-4" y="-4" width="40" height="40" fill="#fff" />
          <circle cx="23.2" cy="12.5" r=".85" fill="#000" />
        </mask>
        <mask id={wing} maskUnits="userSpaceOnUse" x="-4" y="-4" width="40" height="40">
          <rect x="-4" y="-4" width="40" height="40" fill="#fff" />
          <path
            d="M10.4 18.4Q15.4 17.6 18.8 21.2"
            fill="none"
            stroke="#000"
            strokeWidth="1.05"
            strokeLinecap="round"
          />
        </mask>
      </defs>
      <g fill="currentColor">
        <path className="tail" d="M7.4 17.2L4.7 6.2Q4.5 4.7 5.9 4.8Q7 4.9 7.4 6L11 14.8Z" />
        <g mask={`url(#${wing})`}>
          <ellipse cx="15.2" cy="19.2" rx="9.4" ry="6.9" transform="rotate(-18 15.2 19.2)" />
        </g>
        <path
          d="M13.8 25.2v3.6M17 25v3.6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
        <g className="head" mask={`url(#${eye})`}>
          <circle cx="22" cy="13.4" r="4.3" />
          {/* Wren's ember (#ff7d4d on dark) */}
          <path d="M25.8 12.3L29.9 13.6L25.9 14.7Z" fill="#ff7d4d" />
        </g>
      </g>
    </svg>
  )
}
