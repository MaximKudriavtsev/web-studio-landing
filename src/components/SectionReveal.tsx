import { motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'

type SectionRevealProps = {
  children: ReactNode
  className?: string
  delay?: number
}

export const SectionReveal = ({
  children,
  className = '',
  delay = 0,
}: SectionRevealProps) => {
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  )
}
