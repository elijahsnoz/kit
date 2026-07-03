import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { BIG_WISHES, WISH_WORDS } from '../lib/content'

/**
 * CHAPTER SIX — the wishes multiply. A quiet field of small word-bubbles rises
 * endlessly in the background while, at the centre, the full blessings surface
 * one at a time, each held long enough to be read and felt.
 */
export default function WishStorm({ active }: { active: boolean }) {
  const reduce = useReducedMotion()
  const [index, setIndex] = useState(0)

  // Cycle the central blessing slowly while the section is on screen.
  useEffect(() => {
    if (!active) return
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % BIG_WISHES.length)
    }, 4200)
    return () => clearInterval(id)
  }, [active])

  return (
    <div className="relative flex min-h-[100svh] w-full items-center justify-center overflow-hidden">
      {/* Rising field of small wishes */}
      {!reduce && <RisingField active={active} />}

      {/* Central blessing, one at a time */}
      <div className="relative z-10 flex h-[40vh] max-w-3xl items-center justify-center px-6">
        <AnimatePresence mode="wait">
          <motion.p
            key={index}
            className="text-center font-serif text-[clamp(1.7rem,4.6vw,3.1rem)] font-light italic leading-[1.45] text-white/95 text-breathe"
            initial={{ opacity: 0, y: reduce ? 0 : 24, filter: 'blur(12px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: reduce ? 0 : -24, filter: 'blur(12px)' }}
            transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
          >
            {BIG_WISHES[index]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  )
}

function RisingField({ active }: { active: boolean }) {
  // A fixed set of drifting word-motes; enough to feel like "hundreds" without
  // overwhelming the reader or the frame rate.
  const [motes] = useState(() =>
    Array.from({ length: 46 }, (_, i) => ({
      id: i,
      word: WISH_WORDS[i % WISH_WORDS.length],
      x: Math.random() * 100,
      delay: Math.random() * 14,
      dur: 16 + Math.random() * 16,
      size: 0.7 + Math.random() * 0.7,
      opacity: 0.12 + Math.random() * 0.22,
    })),
  )

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {motes.map((m) => (
        <span
          key={m.id}
          className="absolute bottom-[-10%] whitespace-nowrap font-serif italic text-white"
          style={{
            left: `${m.x}%`,
            fontSize: `${m.size}rem`,
            opacity: active ? m.opacity : 0,
            animation: active ? `rise ${m.dur}s linear ${m.delay}s infinite` : 'none',
            transition: 'opacity 2s ease',
          }}
        >
          {m.word}
        </span>
      ))}
    </div>
  )
}
