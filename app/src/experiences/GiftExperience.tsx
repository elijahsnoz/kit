import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import ParticleField from '../components/ParticleField'
import PortraitReveal from '../components/PortraitReveal'
import FloatingWishes from '../components/FloatingWishes'
import WishStorm from '../components/WishStorm'
import HiddenNote from '../components/HiddenNote'
import { ChapterMark, ScrollHint, Sentence } from '../components/Ui'
import { Line } from '../components/Reveal'
import { useReducedMotion, useInView } from '../lib/hooks'
import { useSmoothScroll } from '../lib/smoothScroll'
import type { GiftConfig } from '../lib/gift'

/** A held silence between rooms, so nothing ever feels rushed. */
function Breath() {
  return <div aria-hidden className="h-[26svh]" />
}

/**
 * The same cinematic language as Kit's original, but rendered entirely from a
 * GiftConfig — so it works for anyone, with or without a photograph. When no
 * portrait is given, an elegant typographic centerpiece stands in its place.
 */
export default function GiftExperience({ gift }: { gift: GiftConfig }) {
  const reduced = useReducedMotion()
  useSmoothScroll(!reduced)

  const [intensity, setIntensity] = useState(0.45)
  const wishes = useInView<HTMLDivElement>({ threshold: 0.2 })
  const closing = useInView<HTMLDivElement>({ threshold: 0.2 })

  useEffect(() => {
    if (closing.inView) setIntensity(0.16)
    else if (wishes.inView) setIntensity(1.2)
    else setIntensity(0.62)
  }, [wishes.inView, closing.inView])

  const [secret, setSecret] = useState(false)

  const [lit, setLit] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setLit(true), 120)
    return () => clearTimeout(t)
  }, [])

  const hasNote = !!(gift.hiddenNote && gift.hiddenNote.length)

  return (
    <div className="relative w-full">
      <ParticleField intensity={intensity} />

      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[4]"
        style={{
          background:
            'radial-gradient(70% 50% at 50% 22%, rgba(201,162,75,0.05), transparent 60%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[5]"
        style={{
          background:
            'radial-gradient(120% 100% at 50% 40%, transparent 38%, rgba(5,5,5,0.7) 100%)',
        }}
      />
      <div className={`grain-layer ${reduced ? '' : 'grain-anim'}`} aria-hidden />

      <motion.div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[70] bg-ink"
        initial={{ opacity: 1 }}
        animate={{ opacity: lit ? 0 : 1 }}
        transition={{ duration: 2.6, ease: 'easeInOut' }}
      />

      <main className="relative">
        <GiftOpening gift={gift} onSecret={hasNote ? () => setSecret(true) : undefined} />
        <Breath />

        {/* The things that make you… you */}
        {gift.essence.length > 0 && (
          <>
            <section className="relative z-10 flex min-h-[70svh] flex-col items-center justify-center px-6 py-[16vh]">
              <ChapterMark numeral="I" title="The Things That Make You… You" />
              <Sentence className="mt-2 text-[clamp(1.1rem,2.8vw,1.5rem)] text-white/55">
                A few of the things I know to be true about you.
              </Sentence>
            </section>
            <section className="relative z-10 mx-auto flex max-w-5xl flex-col gap-[24vh] px-6 pb-[10vh]">
              {gift.essence.map((item, i) => (
                <EssenceScene key={`${item.word}-${i}`} item={item} index={i} />
              ))}
            </section>
            <Breath />
          </>
        )}

        {/* A personal passage — the heart of it */}
        {gift.message.length > 0 && (
          <>
            <section className="relative z-10 flex min-h-[60svh] flex-col items-center justify-center px-6 pb-[6vh]">
              <ChapterMark numeral="II" title="What I Wanted to Say" />
            </section>
            <section className="relative z-10 mx-auto flex max-w-3xl flex-col items-center gap-[12vh] px-6 pb-[10vh]">
              {gift.message.map((line, i) => (
                <Sentence
                  key={i}
                  delay={i === 0 ? 0 : 0.15}
                  className={
                    i === gift.message.length - 1
                      ? 'text-[clamp(1.4rem,4vw,2.4rem)] italic gold-hair'
                      : 'text-[clamp(1.3rem,3.6vw,2rem)]'
                  }
                >
                  {line}
                </Sentence>
              ))}
            </section>
            <Breath />
          </>
        )}

        {/* Wishes */}
        <section id="wishes" className="relative z-10">
          <div className="flex min-h-[60svh] flex-col items-center justify-end px-6 pb-[6vh]">
            <ChapterMark numeral="III" title="Wishes" />
          </div>
          <div ref={wishes.ref}>
            <WishStorm active={wishes.inView} wishes={gift.bigWishes} words={gift.wishWords} />
          </div>
        </section>
        <Breath />

        {/* The way out */}
        <div ref={closing.ref}>
          <GiftFinale gift={gift} />
        </div>

        {/* The quiet invitation — carry the gesture forward */}
        <GiftFooter />
      </main>

      {hasNote && <HiddenNote open={secret} onClose={() => setSecret(false)} note={gift.hiddenNote} />}
    </div>
  )
}

/* ── Opening ───────────────────────────────────────────────────── */

type Stage = 'dark' | 'name' | 'date' | 'portrait'

function GiftOpening({ gift, onSecret }: { gift: GiftConfig; onSecret?: () => void }) {
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
      <section className="stage relative z-10 flex-col overflow-hidden">
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
                For {gift.recipient}.
              </motion.p>
              {gift.date && (
                <motion.p
                  className="font-hand text-[clamp(1.5rem,4.5vw,2.6rem)] font-normal text-gold-soft/70"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: stage === 'date' ? 1 : 0, y: 0 }}
                  transition={{ duration: 2.6, ease: 'easeInOut' }}
                >
                  {gift.date}.
                </motion.p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {stage === 'portrait' && (
          <>
            <FloatingWishes count={7} onSecret={onSecret} words={gift.wishWords} />
            <motion.div
              className="relative z-10 flex flex-col items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 2.5 }}
            >
              <Centerpiece gift={gift} onRevealed={() => setRevealed(true)} />
            </motion.div>
            <ScrollHint show={revealed} />
          </>
        )}
      </section>

      {/* The slow opening beat */}
      <section className="stage relative z-10 flex-col px-6 py-[24vh]">
        <div className="flex max-w-4xl flex-col items-center gap-[20vh] text-center">
          {gift.introLines.map((line, i) => (
            <Line
              key={i}
              amount={0.7}
              className={
                i === gift.introLines.length - 1
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

/**
 * The portrait — or, when no photo is given, a typographic monogram that
 * develops out of the dark inside the same gold artist's-line frame.
 */
function Centerpiece({ gift, onRevealed }: { gift: GiftConfig; onRevealed?: () => void }) {
  if (gift.portraitUrl) {
    return (
      <PortraitReveal
        src={gift.portraitUrl}
        alt={`${gift.recipient} — made for them.`}
        onRevealed={onRevealed}
      />
    )
  }
  return <TypographicCenterpiece gift={gift} onRevealed={onRevealed} />
}

function TypographicCenterpiece({
  gift,
  onRevealed,
}: {
  gift: GiftConfig
  onRevealed?: () => void
}) {
  const reduce = useReducedMotion()
  useEffect(() => {
    const t = setTimeout(() => onRevealed?.(), reduce ? 0 : 4200)
    return () => clearTimeout(t)
  }, [reduce, onRevealed])

  const initial = gift.recipient.trim().charAt(0).toUpperCase()

  return (
    <div className="relative flex h-[min(78vw,430px)] w-[min(78vw,430px)] items-center justify-center">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-[10%] rounded-full blur-3xl"
        style={{
          background:
            'radial-gradient(circle at 50% 45%, rgba(201,162,75,0.18), rgba(201,162,75,0.04) 42%, transparent 70%)',
        }}
      />
      {/* Loose gold gesture ring, drawing itself in */}
      <svg
        aria-hidden
        viewBox="0 0 200 200"
        className="pointer-events-none absolute inset-0 h-full w-full"
        fill="none"
      >
        <circle
          cx="100"
          cy="100"
          r="86"
          stroke="url(#giftgold)"
          strokeWidth="1.1"
          strokeLinecap="round"
          style={{
            strokeDasharray: 560,
            strokeDashoffset: reduce ? 0 : 560,
            animation: reduce ? 'none' : 'draw-line 8s ease 0.6s forwards',
            opacity: 0.6,
          }}
        />
        <defs>
          <linearGradient id="giftgold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#D8BE86" stopOpacity="0.05" />
            <stop offset="0.5" stopColor="#D8BE86" stopOpacity="0.7" />
            <stop offset="1" stopColor="#C9A24B" stopOpacity="0.1" />
          </linearGradient>
        </defs>
      </svg>
      <motion.div
        className="relative z-10 flex flex-col items-center gap-4"
        initial={{ opacity: 0, filter: 'blur(16px)', scale: 0.94 }}
        animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
        transition={{ duration: reduce ? 0.8 : 3.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className="font-serif text-[clamp(5rem,20vw,9rem)] font-light leading-none text-white/90 text-breathe">
          {initial}
        </span>
        <span className="font-hand text-[clamp(1.4rem,4vw,2.2rem)] text-gold-soft/75">
          {gift.recipient}
        </span>
      </motion.div>
    </div>
  )
}

/* ── Essence scene (large typographic beats) ───────────────────── */

function EssenceScene({
  item,
  index,
}: {
  item: { word: string; note: string }
  index: number
}) {
  const alignRight = index % 2 === 1
  return (
    <div className={`flex flex-col ${alignRight ? 'items-end text-right' : 'items-start text-left'}`}>
      <Line className="font-serif text-[clamp(3rem,13vw,9rem)] font-light leading-[0.95] tracking-tight text-white/90 text-breathe">
        {item.word}
      </Line>
      <Line delay={0.3} className="mt-4 max-w-md font-sans text-[0.72rem] uppercase tracking-widest2 text-gold-soft/60">
        {item.note}
      </Line>
    </div>
  )
}

/* ── Finale ────────────────────────────────────────────────────── */

function GiftFinale({ gift }: { gift: GiftConfig }) {
  return (
    <>
      {gift.portraitUrl && (
        <section className="stage flex-col px-6 py-[16vh]">
          <div className="flex flex-col items-center gap-14">
            <PortraitReveal small src={gift.portraitUrl} alt={`${gift.recipient}.`} />
          </div>
        </section>
      )}

      {gift.finalThanks.length > 0 && (
        <>
          <section className="stage flex-col px-6 py-[10vh]">
            <Line amount={0.6} className="font-serif text-[clamp(2rem,6vw,3.6rem)] font-light italic text-white/90 text-breathe">
              Thank you…
            </Line>
          </section>
          <section className="stage flex-col px-6 py-[12vh]">
            <div className="flex max-w-3xl flex-col items-center gap-[11vh] text-center">
              {gift.finalThanks.map((line, i) => (
                <Line
                  key={i}
                  amount={0.75}
                  className="font-serif text-[clamp(1.5rem,4.4vw,2.8rem)] font-light leading-tight text-white/88"
                >
                  {line}
                </Line>
              ))}
            </div>
          </section>
        </>
      )}

      <section className="stage flex-col px-6 py-[18vh]">
        <Sentence className="max-w-4xl text-[clamp(1.5rem,4.2vw,2.7rem)] leading-[1.5] italic gold-hair">
          {gift.blessing}
        </Sentence>
      </section>

      <section className="stage flex-col px-6 py-[24vh]">
        <div className="flex flex-col items-center gap-10 text-center">
          <Line amount={0.8} className="font-serif text-[clamp(2.6rem,9vw,6rem)] font-light leading-[1.05] text-white text-breathe">
            {gift.occasion}, {gift.recipient}.
          </Line>
          {gift.sender && (
            <Line
              delay={1.8}
              amount={0.8}
              className="font-hand text-[clamp(1.7rem,4vw,2.4rem)] font-medium text-gold-soft/75"
            >
              — {gift.sender}
            </Line>
          )}
        </div>
      </section>

      <div className="h-[55svh]" aria-hidden />
    </>
  )
}

/* ── Footer — the gentle invitation to pass it on ──────────────── */

function GiftFooter() {
  return (
    <footer className="relative z-10 flex flex-col items-center gap-5 px-6 pb-[18vh] text-center">
      <Line amount={0.6} className="font-hand text-[clamp(1.3rem,3.6vw,1.9rem)] text-gold-soft/45">
        made with love
      </Line>
      <a
        href="#/make"
        className="font-sans text-[0.6rem] uppercase tracking-widest2 text-white/30 transition-colors duration-700 hover:text-gold-soft/80"
      >
        make one of your own →
      </a>
    </footer>
  )
}
