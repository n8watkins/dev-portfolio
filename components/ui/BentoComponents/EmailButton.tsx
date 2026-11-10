import React, { useState, useEffect } from 'react'
import { MdContentCopy } from 'react-icons/md'
import { BackgroundGradientAnimation } from '../background-gradient-animation'
import dynamic from 'next/dynamic'
import { motion, AnimatePresence } from 'motion/react'

// The firework loads when the pointer or focus reaches the button, so it is
// ready by the click; a click before that shows it as soon as it arrives.
const loadConfetti = () => import('./Confetti')
const Confetti = dynamic(loadConfetti, { ssr: false })
const preloadConfetti = () => void loadConfetti().catch(() => {})

interface ResumeButtonsProps {
  buttonContainer?: string
  buttonClass?: string
}

const EmailButton: React.FC<ResumeButtonsProps> = ({ buttonContainer, buttonClass }) => {
  const [copiedEmail, setCopiedEmail] = useState(false)
  const [animationKey, setAnimationKey] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [showSecondFirework, setShowSecondFirework] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 500) // Adjust this delay as needed

    return () => clearTimeout(timer)
  }, [])

  const handleEmailClick = () => {
    navigator.clipboard.writeText('contact@n8builds.dev').then(() => {
      if (!copiedEmail) {
        setCopiedEmail(true)
        setAnimationKey((prevKey) => prevKey + 1)
        setShowSecondFirework(false)
        // Trigger second firework with delay - BAM BAM!
        setTimeout(() => {
          setShowSecondFirework(true)
        }, 200)
      }
      setTimeout(() => {
        setCopiedEmail(false)
        setShowSecondFirework(false)
      }, 5000)
    })
  }

  return (
    <div className="h-full">
      {/* The heading and the button sit together, centred in the card (owner, round 5 of
          2026-11-09: closer together). */}
      <BackgroundGradientAnimation
        interactive={false}
        className="group pointer-events-none flex h-full flex-col items-center justify-center gap-5"
      >
        <div className="z-50 flex justify-center group-hover:scale-105 duration-200 text-2xl font-sans font-bold">
          <h2 className="text-slate-800 dark:text-white text-2xl text-center text-balance px-5 lg:text-2xl xl:text-3xl">
            Have a project? Let&apos;s connect!{' '}
          </h2>
        </div>
        {/* First firework - BAM! (after a copy; it used to play once, unseen, at page load) */}
        {animationKey > 0 && (
          <div key={animationKey} className="absolute top-0 left-0 w-full h-full z-50 ">
            <Confetti style={{ height: 400, width: 400 }} />
          </div>
        )}
        {/* Second firework - BAM! (delayed and offset to the right) */}
        {showSecondFirework && (
          <div key={`${animationKey}-2`} className="absolute top-0 left-0 w-full h-full z-50 ">
            <Confetti style={{ height: 400, width: 400, marginLeft: '150px' }} />
          </div>
        )}
        <div
          className={`${buttonContainer} transition-opacity duration-500 ${
            isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <button
            className={`${buttonClass} pointer-events-auto gap-3 bg-[linear-gradient(1100deg,#5b21b6,45%,#6d28d9,55%,#5b21b6)] dark:bg-[linear-gradient(1100deg,#001f54,45%,#002b76,55%,#001f54)] border-white/30 dark:bg-animate-duration-[4000ms] `}
            onClick={handleEmailClick}
            onPointerEnter={preloadConfetti}
            onFocus={preloadConfetti}
            disabled={!isVisible}
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={copiedEmail ? 'copied' : 'copy'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="text-white dark:text-white font-semibold dark:font-normal"
              >
                {copiedEmail ? 'Copied!' : 'Copy Email'}
              </motion.span>
            </AnimatePresence>
            <MdContentCopy className="text-white dark:text-white " />
          </button>
        </div>
      </BackgroundGradientAnimation>
    </div>
  )
}

export default EmailButton
