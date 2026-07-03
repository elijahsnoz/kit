import { useEffect, useRef, useState } from 'react'

/**
 * Optional, off by default. A tender, generative solo-piano theme — soft struck
 * notes drawn from a major-pentatonic set (so it is always consonant, never a
 * wrong note), laid over a whisper of room-tone air for warmth. Built with the
 * Web Audio API so it needs no asset and cannot be taken down for copyright.
 *
 * It never autoplays: the listener chooses it. Volume is low, and the whole
 * thing withdraws to silence as the ending approaches, so the final black
 * screen is truly quiet.
 *
 * To use a real recording instead (e.g. your own piano), drop an audio file at
 * `public/media/theme.mp3` and set USE_RECORDING to its path — the same toggle,
 * fade, and near-end behaviour will drive it.
 */
const USE_RECORDING: string | null = null // e.g. './media/theme.mp3'

// A warm, hopeful D-major pentatonic spread across two octaves. Any subset of
// these sounds sweet together, so random selection can never clash.
const NOTES = [
  293.66, // D4
  329.63, // E4
  369.99, // F#4
  440.0, // A4
  493.88, // B4
  587.33, // D5
  659.25, // E5
  739.99, // F#5
  880.0, // A5
]
const ROOTS = [146.83, 220.0] // D3, A3 — occasional low pillow underneath

export default function AmbientSound() {
  const [on, setOn] = useState(false)
  const [nearEnd, setNearEnd] = useState(false)

  const ctxRef = useRef<AudioContext | null>(null)
  const masterRef = useRef<GainNode | null>(null)
  const reverbRef = useRef<ConvolverNode | null>(null)
  const airRef = useRef<AudioNode[]>([])
  const timerRef = useRef<number | null>(null)
  const audioElRef = useRef<HTMLAudioElement | null>(null)

  // Fade the control (and any sound) away near the very end.
  useEffect(() => {
    const onScroll = () => {
      const rest = document.body.scrollHeight - window.innerHeight - window.scrollY
      setNearEnd(rest < window.innerHeight * 1.4)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // --- Reverb impulse: a short, soft exponential-decay tail for space. ---
  const makeReverb = (ctx: AudioContext) => {
    const seconds = 3.4
    const len = Math.floor(ctx.sampleRate * seconds)
    const impulse = ctx.createBuffer(2, len, ctx.sampleRate)
    for (let ch = 0; ch < 2; ch++) {
      const d = impulse.getChannelData(ch)
      for (let i = 0; i < len; i++) {
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6)
      }
    }
    const conv = ctx.createConvolver()
    conv.buffer = impulse
    return conv
  }

  // --- One struck piano-ish note: two detuned partials with a quick attack ---
  // and a long, soft decay, shaped warm by a lowpass.
  const strike = (ctx: AudioContext, freq: number, when: number, gain: number) => {
    const master = masterRef.current
    const reverb = reverbRef.current
    if (!master || !reverb) return

    const voice = ctx.createGain()
    voice.gain.setValueAtTime(0, when)
    voice.gain.linearRampToValueAtTime(gain, when + 0.012) // fast, soft attack
    voice.gain.exponentialRampToValueAtTime(gain * 0.28, when + 0.9)
    voice.gain.exponentialRampToValueAtTime(0.0001, when + 5.2) // long tail

    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.setValueAtTime(2600, when)
    lp.frequency.exponentialRampToValueAtTime(900, when + 3.5) // mellows as it fades

    // Fundamental + a quieter octave give it a little body/shimmer.
    const partials = [
      { f: freq, type: 'triangle' as OscillatorType, g: 1 },
      { f: freq * 2, type: 'sine' as OscillatorType, g: 0.35 },
      { f: freq * 1.001, type: 'sine' as OscillatorType, g: 0.4 }, // slight detune
    ]
    const oscs: OscillatorNode[] = []
    for (const p of partials) {
      const o = ctx.createOscillator()
      o.type = p.type
      o.frequency.value = p.f
      const g = ctx.createGain()
      g.gain.value = p.g
      o.connect(g).connect(lp)
      o.start(when)
      o.stop(when + 5.4)
      oscs.push(o)
    }

    // Dry + wet: a touch of the note direct, more of it into the reverb.
    const dry = ctx.createGain()
    dry.gain.value = 0.6
    const wet = ctx.createGain()
    wet.gain.value = 0.9
    lp.connect(voice)
    voice.connect(dry).connect(master)
    voice.connect(wet).connect(reverb).connect(master)
  }

  // --- Scheduler: drop notes at slow, gently random intervals. ---
  const scheduleLoop = (ctx: AudioContext) => {
    let step = 0
    const tick = () => {
      if (!ctxRef.current) return
      const now = ctx.currentTime + 0.05

      // A melody note, occasionally two together for a soft interval.
      const n = NOTES[Math.floor(Math.random() * NOTES.length)]
      strike(ctx, n, now, 0.16 + Math.random() * 0.06)
      if (Math.random() < 0.35) {
        const n2 = NOTES[Math.floor(Math.random() * NOTES.length)]
        if (n2 !== n) strike(ctx, n2, now + 0.04, 0.09)
      }
      // Every so often, a low root pillow underneath.
      if (step % 6 === 0) {
        strike(ctx, ROOTS[Math.floor(Math.random() * ROOTS.length)], now, 0.12)
      }
      step++

      // 3.6–6.6s between phrases — slow and unhurried, lots of air.
      const next = 3600 + Math.random() * 3000
      timerRef.current = window.setTimeout(tick, next)
    }
    tick()
  }

  const buildSynth = () => {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new Ctx()

    const master = ctx.createGain()
    master.gain.value = 0
    master.connect(ctx.destination)

    const reverb = makeReverb(ctx)
    reverb.connect(master)

    // A whisper of brown-noise air under the piano for warmth (very quiet).
    const seconds = 4
    const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    let last = 0
    for (let i = 0; i < data.length; i++) {
      const white = Math.random() * 2 - 1
      last = (last + 0.02 * white) / 1.02
      data[i] = last * 3.2
    }
    const air = ctx.createBufferSource()
    air.buffer = buffer
    air.loop = true
    const airLp = ctx.createBiquadFilter()
    airLp.type = 'lowpass'
    airLp.frequency.value = 420
    const airGain = ctx.createGain()
    airGain.gain.value = 0.22 // barely there, just body
    air.connect(airLp).connect(airGain).connect(master)
    air.start()

    ctxRef.current = ctx
    masterRef.current = master
    reverbRef.current = reverb
    airRef.current = [air, airLp, airGain]

    scheduleLoop(ctx)
  }

  // Drive the master gain from state: on & not near the end → audible; else 0.
  useEffect(() => {
    // Recording path.
    if (USE_RECORDING) {
      const el = audioElRef.current
      if (!el) return
      const target = on && !nearEnd ? 0.55 : 0
      el.volume = Math.max(0, Math.min(1, target))
      return
    }
    // Synth path.
    const master = masterRef.current
    const ctx = ctxRef.current
    if (!master || !ctx) return
    const target = on && !nearEnd ? 0.3 : 0
    master.gain.cancelScheduledValues(ctx.currentTime)
    master.gain.setTargetAtTime(target, ctx.currentTime, 2.4)
  }, [on, nearEnd])

  const toggle = () => {
    if (USE_RECORDING) {
      const el = audioElRef.current
      if (el) {
        if (on) el.pause()
        else el.play().catch(() => {})
      }
    } else {
      if (!ctxRef.current) buildSynth()
      ctxRef.current?.resume()
    }
    setOn((v) => !v)
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
      ctxRef.current?.close()
    }
  }, [])

  return (
    <>
      {USE_RECORDING && (
        <audio ref={audioElRef} src={USE_RECORDING} loop preload="none" />
      )}
      <button
        onClick={toggle}
        aria-label={on ? 'Pause music' : 'Play music'}
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
        {on ? 'MUSIC ON' : 'MUSIC'}
      </button>
    </>
  )
}
