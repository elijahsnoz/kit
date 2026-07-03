import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import ParticleField from './components/ParticleField'
import Opening from './components/Opening'
import {
  ChapterOne,
  ChapterTwo,
  ChapterThree,
  ChapterFour,
  ChapterFive,
  ChapterSix,
} from './components/Chapters'
import FinalScene from './components/FinalScene'
import HiddenNote from './components/HiddenNote'
import AmbientSound from './components/AmbientSound'
import { useSmoothScroll } from './lib/smoothScroll'
import { useReducedMotion, useInView } from './lib/hooks'

/** A held silence between rooms, so nothing ever feels rushed. */
function Breath() {
  return <div aria-hidden className="h-[26svh]" />
}

export default function App() {
  const reduced = useReducedMotion()
  useSmoothScroll(!reduced)

  // The particle field breathes with the story: near-still at the edges of the
  // experience, a little more alive during the wishes.
  const [intensity, setIntensity] = useState(0.45)

  const wishes = useInView<HTMLDivElement>({ threshold: 0.2 })
  const closing = useInView<HTMLDivElement>({ threshold: 0.2 })

  useEffect(() => {
    // Near-still as the experience closes; a little more alive during the
    // wishes; quietly present everywhere between.
    if (closing.inView) setIntensity(0.16)
    else if (wishes.inView) setIntensity(1.2)
    else setIntensity(0.62)
  }, [wishes.inView, closing.inView])

  // The hidden note, opened from a mote among the wishes.
  const [secret, setSecret] = useState(false)

  // Guarantee the very first frame is pure darkness, then let light in.
  const [lit, setLit] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setLit(true), 120)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="relative w-full">
      {/* Ambient dust behind everything */}
      <ParticleField intensity={intensity} />

      {/* A single, barely-there warm bloom high overhead — depth, not decoration */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[4]"
        style={{
          background:
            'radial-gradient(70% 50% at 50% 22%, rgba(201,162,75,0.05), transparent 60%)',
        }}
      />

      {/* Deep vignette for museum-dark edges */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[5]"
        style={{
          background:
            'radial-gradient(120% 100% at 50% 40%, transparent 38%, rgba(5,5,5,0.7) 100%)',
        }}
      />

      {/* Film grain */}
      <div className={`grain-layer ${reduced ? '' : 'grain-anim'}`} aria-hidden />

      {/* Opening curtain — the first frame is black, then it lifts */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[70] bg-ink"
        initial={{ opacity: 1 }}
        animate={{ opacity: lit ? 0 : 1 }}
        transition={{ duration: 2.6, ease: 'easeInOut' }}
      />

      <main className="relative">
        <Opening onSecret={() => setSecret(true)} />
        <Breath />
        <ChapterOne />
        <Breath />
        <ChapterTwo />
        <Breath />
        <ChapterThree />
        <Breath />
        <ChapterFour />
        <Breath />
        <ChapterFive />
        <Breath />

        {/* Chapter Six — wishes */}
        <div ref={wishes.ref}>
          <ChapterSix active={wishes.inView} />
        </div>
        <Breath />

        {/* Final */}
        <div ref={closing.ref}>
          <FinalScene />
        </div>
      </main>

      {/* Optional, off-by-default ambient — silence stays the soundtrack */}
      <AmbientSound />

      {/* The folded note, found by chance */}
      <HiddenNote open={secret} onClose={() => setSecret(false)} />
    </div>
  )
}
