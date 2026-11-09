'use client'
import React from 'react'
import { motion } from 'motion/react'
import { BentoGrid, BentoGridItem } from '@/components/ui/BentoGrid'
import { gridItems } from '@/data/grid'
import { staggerContainerVariants, defaultAnimationConfig } from '@/lib/animations'

/** The bento: where I am, my tech stack (with the dino), the resume and a way to reach me. */
export default function StackGrid() {
  return (
    <motion.div variants={staggerContainerVariants} {...defaultAnimationConfig}>
      <BentoGrid>
        {gridItems.map((item) => (
          <BentoGridItem key={item.id} {...item} />
        ))}
      </BentoGrid>
    </motion.div>
  )
}
