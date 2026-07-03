import { useEffect, useRef, useState } from 'react'

/**
 * Optional, off by default. A soft, synthesized room-tone / wind bed — no
 * melody, no birthday music — built with the Web Audio API so it needs no asset.
 * Silence is the real soundtrack, so the control is barely there and the sound
 * quietly withdraws to nothing as the ending approaches.
 */
export default function AmbientSound() {
  const [on, setOn] = useState(false)
  const [nearEnd, setNearEnd] = useState(false)

  const ctxRef = useRef<AudioContext | null>(null)
  const masterRef = useRef<GainNode | null>(null)
  const nodesRef = useRef<AudioNode[]>([])

  // Fade the control (and any sound) away near the very end, so the final
  // black screen is truly silent and empty.
  useEffect(() => {
    const onScroll = () => {
      const rest = document.body.scrollHeight - window.innerHeight - window.scrollY
      setNearEnd(rest < window.innerHeight * 1.4)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const build = () => {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new Ctx()

    // Brown noise buffer (a few seconds, looped) — the body of the "wind".
    const seconds = 4
    const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    let last = 0
    for (let i = 0; i < data.length; i++) {
      const white = Math.random() * 2 - 1
      last = (last + 0.02 * white) / 1.02
      data[i] = last * 3.2
    }
    const src = ctx.createBufferSource()
    src.buffer = buffer
    src.loop = true

    // Shape it soft and distant.
    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 480

    const master = ctx.createGain()
    master.gain.value = 0

    // Very slow swell, like breath / distant air.
    const lfo = ctx.createOscillator()
    lfo.frequency.value = 0.06
    const lfoGain = ctx.createGain()
    lfoGain.gain.value = 140
    lfo.connect(lfoGain).connect(lp.frequency)

    src.connect(lp).connect(master).connect(ctx.destination)
    src.start()
    lfo.start()

    ctxRef.current = ctx
    masterRef.current = master
    nodesRef.current = [src, lfo, lp, master, lfoGain]
  }

  // Drive the master gain from state: on & not near the end → audible; else 0.
  useEffect(() => {
    const master = masterRef.current
    const ctx = ctxRef.current
    if (!master || !ctx) return
    const target = on && !nearEnd ? 0.05 : 0
    master.gain.cancelScheduledValues(ctx.currentTime)
    master.gain.setTargetAtTime(target, ctx.currentTime, 1.6)
  }, [on, nearEnd])

  const toggle = () => {
    if (!ctxRef.current) build()
    ctxRef.current?.resume()
    setOn((v) => !v)
  }

  useEffect(() => {
    return () => {
      ctxRef.current?.close()
    }
  }, [])

  return (
    <button
      onClick={toggle}
      aria-label={on ? 'Mute ambient sound' : 'Play ambient sound'}
      className="fixed bottom-6 left-6 z-40 flex items-center gap-2 font-sans text-[0.58rem] tracking-widest2 text-white/35 transition-opacity duration-1000 hover:text-white/70"
      style={{ opacity: nearEnd ? 0 : 1, pointerEvents: nearEnd ? 'none' : 'auto' }}
    >
      <span
        className="inline-block h-[6px] w-[6px] rounded-full"
        style={{
          background: on ? 'rgba(216,190,134,0.9)' : 'transparent',
          boxShadow: on ? '0 0 10px 2px rgba(216,190,134,0.5)' : 'none',
          border: '1px solid rgba(216,190,134,0.5)',
        }}
      />
      {on ? 'AMBIENT ON' : 'AMBIENT'}
    </button>
  )
}
