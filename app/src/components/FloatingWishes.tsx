import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import { WISH_WORDS } from '../lib/content'

// Short, single-word wishes for narrow screens (no wrapping / clipping) —
// still drawn from who Kit is, never generic.
const SHORT_WISHES = [
  'Kindness',
  'Persistence',
  'Curiosity',
  'Art',
  'Courage',
  'Laughter',
  'Purpose',
  'Adventure',
  'Creativity',
]

type Bubble = {
  id: number
  word: string
  x: number // vw %
  y: number // vh %
  scale: number
  delay: number
}

// Keep the centre (the portrait) clear. On wide screens the wishes drift down
// the left and right margins; on phones — where there is no room beside a
// centred portrait — they drift in the open bands above and below her instead.
function randomEdgePosition(narrow: boolean) {
  if (narrow) {
    // Phones: drift only in the open band above her, clear of the portrait,
    // the "FOR KIT" caption and the scroll hint.
    const x = 10 + Math.random() * 80
    const y = 2 + Math.random() * 11
    return { x, y }
  }
  const side = Math.random()
  const x = side < 0.5 ? 8 + Math.random() * 16 : 68 + Math.random() * 16
  const y = 12 + Math.random() * 72
  return { x, y }
}

let uid = 0

/**
 * Slow, translucent wish-bubbles drifting around the portrait. Hovering (or
 * tapping) one dissolves it into a small burst of particles; another quietly
 * fades in elsewhere, so there is always gentle movement — never stillness,
 * never rush.
 */
export default function FloatingWishes({
  count = 7,
  onSecret,
  words,
}: {
  count?: number
  onSecret?: () => void
  words?: string[]
}) {
  const reduce = useReducedMotion()
  const [narrow, setNarrow] = useState(false)
  const [bubbles, setBubbles] = useState<Bubble[]>([])
  // Custom gifts pass their own words; Kit's original falls back to the shared set.
  const fullWords = words && words.length ? words : WISH_WORDS
  const shortWords = words && words.length
    ? words.filter((w) => !w.includes(' ')).concat(words).slice(0, 9)
    : SHORT_WISHES
  const wordPool = useRef<string[]>(shuffle(fullWords))
  const poolIdx = useRef(0)
  const [bursts, setBursts] = useState<{ id: number; x: number; y: number }[]>([])

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const update = () => setNarrow(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  const nextWord = useCallback(() => {
    // On phones, only the short, single-word wishes — the longer phrases would
    // clip against a narrow screen. On wider screens, the full set.
    const pool = narrow ? shortWords : fullWords
    if (poolIdx.current >= wordPool.current.length) {
      wordPool.current = shuffle(pool)
      poolIdx.current = 0
    }
    return wordPool.current[poolIdx.current++]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [narrow])

  const spawn = useCallback((): Bubble => {
    const { x, y } = randomEdgePosition(narrow)
    return {
      id: uid++,
      word: nextWord(),
      x,
      y,
      scale: 0.85 + Math.random() * 0.5,
      delay: Math.random() * 1.5,
    }
  }, [nextWord, narrow])

  useEffect(() => {
    // Reset the word pool so the layout switch immediately draws from the
    // correct set (short words on phones, full phrases on wider screens).
    wordPool.current = shuffle(narrow ? shortWords : fullWords)
    poolIdx.current = 0
    const effective = narrow ? Math.min(count, 4) : count
    const initial = Array.from({ length: effective }, () => spawn())
    // On phones, spread the first bubbles evenly across the top band so they
    // never spawn stacked on top of one another.
    if (narrow) {
      initial.forEach((b, i) => {
        b.x = 16 + (68 / Math.max(1, effective - 1)) * i
        b.y = 3 + Math.random() * 9
      })
    }
    setBubbles(initial)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, narrow])

  const dissolve = useCallback(
    (b: Bubble) => {
      const burstId = uid++
      setBursts((prev) => [...prev, { id: burstId, x: b.x, y: b.y }])
      setTimeout(() => setBursts((prev) => prev.filter((p) => p.id !== burstId)), 1400)
      setBubbles((prev) => prev.map((p) => (p.id === b.id ? spawn() : p)))
    },
    [spawn],
  )

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
      <AnimatePresence>
        {bubbles.map((b) => (
          <motion.button
            key={b.id}
            className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 cursor-default select-none"
            style={{ left: `${b.x}%`, top: `${b.y}%` }}
            initial={{ opacity: 0, scale: 0.6, filter: 'blur(8px)' }}
            animate={{
              opacity: 0.55,
              scale: b.scale,
              filter: 'blur(0px)',
              y: reduce ? 0 : [0, -14, 0],
              x: reduce ? 0 : [0, 6, 0],
            }}
            exit={{ opacity: 0, scale: 1.3, filter: 'blur(10px)' }}
            transition={{
              opacity: { duration: 2.4, delay: b.delay },
              scale: { duration: 2.4, delay: b.delay },
              filter: { duration: 2.4, delay: b.delay },
              y: { duration: 9 + Math.random() * 5, repeat: Infinity, ease: 'easeInOut' },
              x: { duration: 11 + Math.random() * 6, repeat: Infinity, ease: 'easeInOut' },
            }}
            onHoverStart={() => dissolve(b)}
            onTapStart={() => dissolve(b)}
          >
            <span className="relative flex items-center justify-center">
              <span
                className="absolute h-[132%] w-[132%] rounded-full"
                style={{
                  background:
                    'radial-gradient(circle at 40% 35%, rgba(255,255,255,0.08), rgba(255,255,255,0.015) 55%, transparent 72%)',
                  boxShadow: 'inset 0 0 20px rgba(255,255,255,0.04)',
                  border: '1px solid rgba(216,190,134,0.10)',
                }}
              />
              <span className="relative px-5 py-3 font-serif text-[clamp(0.95rem,2.2vw,1.35rem)] font-light tracking-wide text-white/85">
                {b.word}
              </span>
            </span>
          </motion.button>
        ))}
      </AnimatePresence>

      {/* Particle bursts left behind by a dissolving bubble */}
      <AnimatePresence>
        {bursts.map((burst) => (
          <Burst key={burst.id} x={burst.x} y={burst.y} />
        ))}
      </AnimatePresence>

      {/* The folded note — a single, barely-there mote to be found by chance */}
      {onSecret && <HiddenMote narrow={narrow} onOpen={onSecret} />}
    </div>
  )
}

/**
 * One faint point of light, indistinguishable from the drifting dust until the
 * cursor happens across it. Clicking it opens the hidden note. Deliberately
 * quiet — finding it should feel like chance, not a game.
 */
function HiddenMote({ narrow, onOpen }: { narrow: boolean; onOpen: () => void }) {
  const [near, setNear] = useState(false)
  // Tucked into open space, clear of the portrait, caption and scroll hint.
  const pos = narrow ? { left: '82%', top: '14%' } : { left: '15%', top: '70%' }
  return (
    <button
      aria-label="A hidden note"
      className="pointer-events-auto absolute z-30 -translate-x-1/2 -translate-y-1/2"
      style={pos}
      onPointerEnter={() => setNear(true)}
      onPointerLeave={() => setNear(false)}
      onClick={onOpen}
    >
      <motion.span
        className="block rounded-full"
        style={{ background: 'rgba(216,190,134,1)' }}
        animate={{
          width: near ? 9 : 5,
          height: near ? 9 : 5,
          opacity: near ? 0.9 : 0.32,
          boxShadow: near
            ? '0 0 22px 6px rgba(216,190,134,0.5)'
            : '0 0 8px 1px rgba(216,190,134,0.18)',
        }}
        transition={{ duration: 1.2, ease: 'easeInOut' }}
      />
    </button>
  )
}

function Burst({ x, y }: { x: number; y: number }) {
  const parts = useRef(
    Array.from({ length: 14 }, () => ({
      dx: (Math.random() - 0.5) * 120,
      dy: (Math.random() - 0.5) * 120,
      s: 1 + Math.random() * 2.5,
      d: Math.random() * 0.3,
    })),
  )
  return (
    <div className="absolute" style={{ left: `${x}%`, top: `${y}%` }}>
      {parts.current.map((p, i) => (
        <motion.span
          key={i}
          className="absolute block rounded-full"
          style={{ width: p.s, height: p.s, background: 'rgba(216,190,134,0.9)' }}
          initial={{ opacity: 0.9, x: 0, y: 0 }}
          animate={{ opacity: 0, x: p.dx, y: p.dy }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: p.d }}
        />
      ))}
    </div>
  )
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
