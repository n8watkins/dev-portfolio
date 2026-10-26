import React, { useState, useEffect } from 'react'
import { MdContentCopy } from 'react-icons/md'
import { BackgroundGradientAnimation } from '../background-gradient-animation'
import Lottie from 'lottie-react'
import animationData from '../../../data/confetti.json'
import { motion, AnimatePresence } from 'framer-motion'

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
    <div className="">
      <BackgroundGradientAnimation className="h-full pb-32 group pointer-events-none ">
        <div className="z-50 flex justify-center group-hover:scale-105 duration-200  text-2xl pt-5  font-sans font-bold ">
          <h2 className="text-slate-800 dark:text-white text-2xl text-center  lg:text-2xl xl:text-3xl pt-3    ">
            Have a Project? Let&apos;s Connect!{' '}
          </h2>
        </div>
        {/* First firework - BAM! */}
        <div key={animationKey} className="absolute top-0 left-0 w-full h-full z-50 ">
          <Lottie
            animationData={animationData}
            loop={false}
            autoplay={true}
            style={{ height: 400, width: 400 }}
          />
        </div>
        {/* Second firework - BAM! (delayed and offset to the right) */}
        {showSecondFirework && (
          <div key={`${animationKey}-2`} className="absolute top-0 left-0 w-full h-full z-50 ">
            <Lottie
              animationData={animationData}
              loop={false}
              autoplay={true}
              style={{ height: 400, width: 400, marginLeft: '150px' }}
            />
          </div>
        )}
        <div
          className={`${buttonContainer} transition-opacity duration-500 ${
            isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}>
          <button
            className={`${buttonClass} pointer-events-auto gap-3 bg-[linear-gradient(1100deg,#5b21b6,45%,#6d28d9,55%,#5b21b6)] dark:bg-[linear-gradient(1100deg,#001f54,45%,#002b76,55%,#001f54)] border-white/30 dark:bg-animate-duration-[4000ms] `}
            onClick={handleEmailClick}
            disabled={!isVisible}>
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
