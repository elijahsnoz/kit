import { useEffect, useRef, useState } from 'react'

/** Tracks the user's reduced-motion preference, reactively. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])
  return reduced
}

/**
 * Smoothed, normalized pointer position in [-1, 1] on each axis.
 * Returns a ref (never triggers re-renders) so heavy scenes can read it
 * inside their own animation frames.
 */
export function usePointerParallax(strength = 1) {
  const target = useRef({ x: 0, y: 0 })
  const smooth = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      target.current.x = ((e.clientX / window.innerWidth) * 2 - 1) * strength
      target.current.y = ((e.clientY / window.innerHeight) * 2 - 1) * strength
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    let raf = 0
    const tick = () => {
      smooth.current.x += (target.current.x - smooth.current.x) * 0.045
      smooth.current.y += (target.current.y - smooth.current.y) * 0.045
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [strength])

  return smooth
}

/** Fires once when the element first scrolls into view. */
export function useInView<T extends HTMLElement>(
  options: IntersectionObserverInit = { threshold: 0.35 },
) {
  const ref = useRef<T | null>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true)
        obs.disconnect()
      }
    }, options)
    obs.observe(el)
    return () => obs.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return { ref, inView }
}
