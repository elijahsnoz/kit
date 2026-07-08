import { useEffect, useRef, useState } from 'react'
import { usePointerParallax, useReducedMotion } from '../lib/hooks'

/**
 * The emotional anchor. Kit's portrait develops out of pure darkness over
 * ~10 seconds: a soft luminance mask opens from within, the image lifts from
 * black through blur into focus, and a loose gold "artist's line" draws itself
 * around her — a nod to the fact that this was made by someone who draws.
 * When it settles, it breathes.
 */
export default function PortraitReveal({
  small = false,
  onRevealed,
  src = './media/kit-portrait.png',
  alt = 'Kit, smiling — the evening this was made for her.',
}: {
  small?: boolean
  onRevealed?: () => void
  src?: string
  alt?: string
}) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const parallax = usePointerParallax(0.6)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const el = imgRef.current
    if (!el) return

    const DURATION = small ? 3000 : 12000
    let start = 0
    let raf = 0
    let firedRevealed = false

    // Cubic-in-out for an unhurried, film-like develop.
    const ease = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

    const set = (reveal: number) => {
      el.style.setProperty('--reveal', reveal.toFixed(4))
      el.style.setProperty('--r', (reveal * 150).toFixed(2))
    }

    if (reduce) {
      set(1)
      setDone(true)
      onRevealed?.()
      return
    }

    set(0)
    const step = (ts: number) => {
      if (!start) start = ts
      const p = Math.min(1, (ts - start) / DURATION)
      set(ease(p))
      if (p >= 0.62 && !firedRevealed) {
        firedRevealed = true
        onRevealed?.()
      }
      if (p < 1) {
        raf = requestAnimationFrame(step)
      } else {
        setDone(true)
      }
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce, small])

  // Subtle pointer parallax on the whole plate.
  useEffect(() => {
    if (reduce) return
    const wrap = wrapRef.current
    if (!wrap) return
    let raf = 0
    const tick = () => {
      const { x, y } = parallax.current
      wrap.style.transform = `translate3d(${x * 10}px, ${y * 10}px, 0)`
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [reduce, parallax])

  const size = small
    ? 'w-[min(52vw,240px)]'
    : 'w-[min(78vw,430px)]'

  return (
    <div ref={wrapRef} className={`relative ${size} aspect-[979/1606] will-change-transform`}>
      {/* Ambient bloom that swells as she appears */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-[22%] rounded-full blur-3xl"
        style={{
          background:
            'radial-gradient(circle at 50% 42%, rgba(201,162,75,0.16), rgba(201,162,75,0.04) 40%, transparent 68%)',
          opacity: done ? 0.9 : 0.6,
          transition: 'opacity 3s ease',
        }}
      />

      {/* The developing photograph */}
      <div
        ref={imgRef}
        className={`portrait-plate absolute inset-0 overflow-hidden rounded-[2px] ${
          done && !reduce ? 'portrait-breathe' : ''
        }`}
        style={
          {
            '--reveal': 0,
            '--r': 0,
          } as React.CSSProperties
        }
      >
        <img
          src={src}
          alt={alt}
          className="h-full w-full select-none object-cover"
          draggable={false}
        />
      </div>

      {/* Loose gold gesture line that draws itself around her */}
      {!small && <GestureLine play={!reduce} />}

      {/* A fine warm frame edge */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[2px]"
        style={{
          boxShadow:
            'inset 0 0 0 1px rgba(216,190,134,0.10), 0 40px 120px -30px rgba(0,0,0,0.9)',
          opacity: done ? 1 : 0,
          transition: 'opacity 2.4s ease',
        }}
      />
    </div>
  )
}

function GestureLine({ play }: { play: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 200 320"
      className="pointer-events-none absolute -inset-[6%] h-[112%] w-[112%]"
      fill="none"
    >
      <path
        d="M100 14 C40 20 20 90 24 160 C28 232 52 300 100 306 C150 300 176 232 178 160 C180 92 160 22 100 14"
        stroke="url(#goldline)"
        strokeWidth="1.1"
        strokeLinecap="round"
        style={{
          strokeDasharray: 980,
          strokeDashoffset: play ? 980 : 0,
          animation: play ? 'draw-line 9s ease 1.2s forwards' : 'none',
          opacity: 0.6,
        }}
      />
      <defs>
        <linearGradient id="goldline" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#D8BE86" stopOpacity="0.05" />
          <stop offset="0.5" stopColor="#D8BE86" stopOpacity="0.7" />
          <stop offset="1" stopColor="#C9A24B" stopOpacity="0.1" />
        </linearGradient>
      </defs>
    </svg>
  )
}
