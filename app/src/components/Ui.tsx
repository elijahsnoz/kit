import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Line } from './Reveal'

/** A quiet chapter marker: roman numeral, hairline rule, title. */
export function ChapterMark({
  numeral,
  title,
}: {
  numeral: string
  title: string
}) {
  return (
    <div className="mb-14 flex flex-col items-center text-center">
      <Line as="span" className="mb-6 block font-sans text-[0.62rem] tracking-widest2 text-gold-soft/70">
        {numeral}
      </Line>
      <Line delay={0.2} className="relative">
        <span className="block h-px w-16 bg-gradient-to-r from-transparent via-gold-soft/40 to-transparent" />
      </Line>
      <Line
        as="h2"
        delay={0.35}
        className="mt-7 font-serif text-[clamp(1.9rem,5.5vw,3.6rem)] font-light uppercase tracking-[0.16em] text-white text-breathe"
      >
        {title}
      </Line>
    </div>
  )
}

/**
 * The barely-there invitation to scroll. It appears once the portrait has
 * arrived and retires for good the moment the journey begins — so the chapters,
 * and especially the silent ending, are never intruded upon.
 */
export function ScrollHint({ show }: { show: boolean }) {
  const reduce = useReducedMotion()
  const [begun, setBegun] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > window.innerHeight * 0.5) setBegun(true)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed bottom-8 left-1/2 z-40 -translate-x-1/2 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: show && !begun ? 1 : 0 }}
      transition={{ duration: 2 }}
    >
      <span className="mb-3 block font-sans text-[0.6rem] tracking-widest2 text-white/40">
        scroll, slowly
      </span>
      <motion.span
        className="mx-auto block h-10 w-px bg-gradient-to-b from-white/40 to-transparent"
        animate={reduce ? {} : { scaleY: [0.4, 1, 0.4], opacity: [0.3, 0.7, 0.3] }}
        style={{ transformOrigin: 'top' }}
        transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.div>
  )
}

/** A large, centered sentence given a whole breath of space. */
export function Sentence({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  return (
    <Line
      delay={delay}
      amount={0.5}
      className={`mx-auto max-w-3xl text-center font-serif font-light leading-[1.5] text-white/90 ${className}`}
    >
      {children}
    </Line>
  )
}
