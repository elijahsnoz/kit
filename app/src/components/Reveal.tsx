import { motion, useReducedMotion, type Variants } from 'framer-motion'
import type { ReactNode } from 'react'

const EASE = [0.16, 1, 0.3, 1] as const

/**
 * A line (or block) of text that rises out of a soft blur when it enters view.
 * The default cadence is slow and unhurried — every sentence gets room.
 */
export function Line({
  children,
  delay = 0,
  className = '',
  as = 'p',
  once = true,
  amount = 0.6,
}: {
  children: ReactNode
  delay?: number
  className?: string
  as?: 'p' | 'h1' | 'h2' | 'span' | 'div'
  once?: boolean
  amount?: number
}) {
  const reduce = useReducedMotion()
  const MotionTag = motion[as]

  const variants: Variants = {
    hidden: reduce
      ? { opacity: 0 }
      : { opacity: 0, y: 34, filter: 'blur(14px)' },
    show: reduce
      ? { opacity: 1, transition: { duration: 0.9, delay } }
      : {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          transition: { duration: 2.2, ease: EASE, delay },
        },
  }

  return (
    <MotionTag
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount }}
    >
      {children}
    </MotionTag>
  )
}

/** Renders successive lines with a growing delay — a slow, breathing cascade. */
export function Stanza({
  lines,
  className = '',
  lineClassName = '',
  step = 1.1,
  start = 0,
}: {
  lines: string[]
  className?: string
  lineClassName?: string
  step?: number
  start?: number
}) {
  return (
    <div className={className}>
      {lines.map((line, i) => (
        <Line key={i} delay={start + i * step} className={lineClassName} amount={0.4}>
          {line}
        </Line>
      ))}
    </div>
  )
}
