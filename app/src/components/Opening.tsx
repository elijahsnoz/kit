import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import PortraitReveal from './PortraitReveal'
import FloatingWishes from './FloatingWishes'
import { ScrollHint } from './Ui'
import { Line } from './Reveal'
import { INTRO_LINES } from '../lib/content'

type Stage = 'dark' | 'name' | 'date' | 'portrait'

/**
 * The way in. Complete darkness and drifting particles — no text, no portrait.
 * After a held pause a single handwritten line arrives: "For Kit." Then, quietly,
 * "July 3." Only once those have been felt does the portrait begin to surface
 * from the dark, as if someone were slowly emerging from memory.
 */
export default function Opening({ onSecret }: { onSecret: () => void }) {
  const reduce = useReducedMotion()
  const [stage, setStage] = useState<Stage>('dark')
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    if (reduce) {
      setStage('portrait')
      return
    }
    const timers = [
      setTimeout(() => setStage('name'), 3200),
      setTimeout(() => setStage('date'), 7200),
      setTimeout(() => setStage('portrait'), 11600),
    ]
    return () => timers.forEach(clearTimeout)
  }, [reduce])

  const showTitles = stage === 'name' || stage === 'date'

  return (
    <>
      {/* First breath: the handwritten titles, then the portrait + wishes */}
      <section className="stage relative z-10 flex-col overflow-hidden">
        {/* Handwritten opening titles — they retire as she surfaces */}
        <AnimatePresence>
          {showTitles && (
            <motion.div
              key="titles"
              className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 3, ease: 'easeInOut' } }}
            >
              <motion.p
                className="font-hand text-[clamp(2.6rem,8vw,5rem)] font-medium text-white/90"
                initial={{ opacity: 0, y: 14, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 3, ease: [0.16, 1, 0.3, 1] }}
              >
                For Kit.
              </motion.p>
              <motion.p
                className="font-hand text-[clamp(1.5rem,4.5vw,2.6rem)] font-normal text-gold-soft/70"
                initial={{ opacity: 0 }}
                animate={{ opacity: stage === 'date' ? 1 : 0, y: 0 }}
                transition={{ duration: 2.6, ease: 'easeInOut' }}
              >
                July 3.
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Portrait + wishes, mounted only once the titles have passed */}
        {stage === 'portrait' && (
          <>
            <FloatingWishes count={7} onSecret={onSecret} />
            <motion.div
              className="relative z-10 flex flex-col items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 2.5 }}
            >
              <PortraitReveal onRevealed={() => setRevealed(true)} />
            </motion.div>
            <ScrollHint show={revealed} />
          </>
        )}
      </section>

      {/* The opening lines — a slow four-beat */}
      <section className="stage relative z-10 flex-col px-6 py-[24vh]">
        <div className="flex max-w-4xl flex-col items-center gap-[20vh] text-center">
          {INTRO_LINES.map((line, i) => (
            <Line
              key={i}
              amount={0.7}
              className={
                i === INTRO_LINES.length - 1
                  ? 'font-serif text-[clamp(2.4rem,7vw,5rem)] font-light italic leading-tight text-white text-breathe'
                  : 'font-serif text-[clamp(1.6rem,4.6vw,3rem)] font-light leading-[1.4] text-white/85'
              }
            >
              {line}
            </Line>
          ))}
        </div>
      </section>
    </>
  )
}
