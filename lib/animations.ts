import { Variants } from 'motion/react'

// Common animation variants for fade-in effects
export const fadeInVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
}

// Fade in from different directions
export const fadeInUpVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 40
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: "easeOut"
    }
  }
}

export const fadeInDownVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -20
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
}

export const fadeInLeftVariants: Variants = {
  hidden: {
    opacity: 0,
    x: -30
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
}

export const fadeInRightVariants: Variants = {
  hidden: {
    opacity: 0,
    x: 30
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
}

// Container variants for staggered animations
export const staggerContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
}

export const staggerContainerSlowVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1
    }
  }
}

// Item variants for staggered children
export const staggerItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 25,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
}

// Scale fade-in for cards
export const scaleInVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
    y: 20
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
}

// Common animation configuration
export const defaultAnimationConfig = {
  initial: "hidden",
  whileInView: "visible",
  viewport: {
    once: true,
    amount: 0.3
  }
}

export const partialAnimationConfig = {
  initial: "hidden",
  whileInView: "visible",
  viewport: {
    once: true,
    amount: 0.1
  }
}

// Utility function to get animation delay
export const getStaggerDelay = (index: number, baseDelay = 0.1) => baseDelay * index

// Animation presets for common use cases
export const animationPresets = {
  fadeIn: {
    variants: fadeInVariants,
    ...defaultAnimationConfig
  },
  fadeInUp: {
    variants: fadeInUpVariants,
    ...defaultAnimationConfig
  },
  fadeInDown: {
    variants: fadeInDownVariants,
    ...defaultAnimationConfig
  },
  fadeInLeft: {
    variants: fadeInLeftVariants,
    ...defaultAnimationConfig
  },
  fadeInRight: {
    variants: fadeInRightVariants,
    ...defaultAnimationConfig
  },
  scaleIn: {
    variants: scaleInVariants,
    ...defaultAnimationConfig
  },
  staggerContainer: {
    variants: staggerContainerVariants,
    ...defaultAnimationConfig
  },
  staggerContainerSlow: {
    variants: staggerContainerSlowVariants,
    ...defaultAnimationConfig
  },
  staggerItem: {
    variants: staggerItemVariants
  }
}