import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

// A taste of what the maker writes — shown rotating on the homepage so the
// beauty of the wishes is the first thing a visitor feels.
const SAMPLE_WISHES = [
  'May every journey leave you with a story worth keeping.',
  'May your kindness always find its way back to you.',
  'May the life you build be even kinder than the one you imagined.',
  'May laughter follow you into every room you enter.',
  'May you keep choosing each other, gently, every day.',
  'May this next year be braver and fuller than the last.',
]

const DRIFT_WORDS = [
  'Joy', 'Kindness', 'Courage', 'Wonder', 'Laughter', 'Adventure',
  'Peace', 'Love', 'Grace', 'Hope', 'Curiosity', 'Warmth', 'Home', 'Light',
]

/**
 * The front door of the product. Same hush as the gift itself: darkness, a warm
 * bloom, drifting wishes, and a single rotating blessing — so the first thing a
 * visitor sees is how beautiful the words can be.
 */
export default function Landing() {
  const reduce = useReducedMotion()
  const [wish, setWish] = useState(0)

  useEffect(() => {
    if (reduce) return
    const id = setInterval(() => setWish((i) => (i + 1) % SAMPLE_WISHES.length), 5200)
    return () => clearInterval(id)
  }, [reduce])

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-ink">
      {/* Warm overhead bloom + vignette, echoing the experience */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            'radial-gradient(70% 55% at 50% 20%, rgba(201,162,75,0.09), transparent 62%), radial-gradient(120% 100% at 50% 42%, transparent 40%, rgba(5,5,5,0.88) 100%)',
        }}
      />

      {/* A quiet field of drifting words behind everything */}
      {!reduce && <DriftField />}

      <div className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 text-center">
        <motion.p
          className="mb-8 font-sans text-[0.62rem] uppercase tracking-widest2 text-gold-soft/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
        >
          a gift, not a card
        </motion.p>

        <motion.h1
          className="font-serif text-[clamp(2.6rem,8vw,5.2rem)] font-light leading-[1.05] text-white text-breathe"
          initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 2.4, ease: [0.16, 1, 0.3, 1] }}
        >
          Make someone a gift
          <br />
          they'll keep.
        </motion.h1>

        <motion.p
          className="mt-8 max-w-xl font-serif text-[clamp(1.15rem,3vw,1.6rem)] font-light leading-relaxed text-white/65"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2.4, delay: 0.5 }}
        >
          A birthday, a wedding, an anniversary, any day that matters — answer a
          few quiet questions and we write it into a cinematic, one-of-a-kind
          page, with a private link to send to friends and family.
        </motion.p>

        {/* The rotating blessing — beautiful wishes, front and centre */}
        <div className="mt-12 flex h-[8.5rem] w-full items-center justify-center sm:h-[7rem]">
          <AnimatePresence mode="wait">
            <motion.p
              key={wish}
              className="max-w-2xl font-serif text-[clamp(1.4rem,4.4vw,2.4rem)] font-light italic leading-[1.4] text-gold-soft/90 text-breathe"
              initial={{ opacity: 0, y: reduce ? 0 : 16, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: reduce ? 0 : -16, filter: 'blur(10px)' }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            >
              “{SAMPLE_WISHES[wish]}”
            </motion.p>
          </AnimatePresence>
        </div>

        <motion.div
          className="mt-12 flex flex-col items-center gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 1 }}
        >
          <a
            href="#/create"
            className="rounded-full border border-gold-soft/40 bg-gold-soft/[0.07] px-11 py-4 font-sans text-[0.72rem] uppercase tracking-widest2 text-gold-soft transition-all hover:border-gold-soft/70 hover:bg-gold-soft/[0.14]"
          >
            Create a gift
          </a>
          <a
            href="#/kit"
            className="font-sans text-[0.65rem] uppercase tracking-widest2 text-white/40 transition-colors hover:text-white/75"
          >
            see the one that started it →
          </a>
        </motion.div>

        <motion.p
          className="mt-20 font-sans text-[0.58rem] uppercase tracking-widest2 text-white/25"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 1.6 }}
        >
          free · private · no account
        </motion.p>
      </div>
    </div>
  )
}

/** Slow, translucent words rising through the dark — the same language as the
 *  wish-storm, dialled almost to silence. */
function DriftField() {
  const [motes] = useState(() =>
    Array.from({ length: 22 }, (_, i) => ({
      id: i,
      word: DRIFT_WORDS[i % DRIFT_WORDS.length],
      x: Math.random() * 100,
      delay: Math.random() * 18,
      dur: 22 + Math.random() * 18,
      size: 0.75 + Math.random() * 0.7,
      opacity: 0.06 + Math.random() * 0.1,
    })),
  )
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[1] overflow-hidden">
      {motes.map((m) => (
        <span
          key={m.id}
          className="absolute bottom-[-8%] whitespace-nowrap font-serif italic text-white"
          style={{
            left: `${m.x}%`,
            fontSize: `${m.size}rem`,
            opacity: m.opacity,
            animation: `rise ${m.dur}s linear ${m.delay}s infinite`,
          }}
        >
          {m.word}
        </span>
      ))}
    </div>
  )
}
