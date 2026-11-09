'use client'
import type { CSSProperties } from 'react'
import { Lottie } from 'lottie-react'
import animationData from '../../../data/confetti.json'

/**
 * The "Copy Email" firework (EmailButton): lottie-react and its animation are
 * about 90 KB of script, so they load only when the button is about to be
 * used, not with the page.
 */
export default function Confetti({ style }: { style: CSSProperties }) {
  return <Lottie src={animationData} loop={false} autoplay style={style} />
}
