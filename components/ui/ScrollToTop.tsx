'use client'

import React, { useState, useEffect } from 'react'
import { FaArrowUp } from 'react-icons/fa6'

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false)

  // Show button when user scrolls down 300px
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener('scroll', toggleVisibility)

    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  if (!isVisible) {
    return null
  }

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll to top of page"
      className="fixed bottom-[calc(1.5rem+var(--consent-banner-h,0px))] right-6 z-50 p-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
    >
      <FaArrowUp className="w-4 h-4" aria-hidden="true" />
    </button>
  )
}

export default ScrollToTop