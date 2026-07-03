import { useEffect } from 'react'
import Lenis from '@studio-freight/lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Installs Lenis smooth scrolling and wires it into GSAP's ScrollTrigger so
 * every scroll-driven animation reads the same eased scroll position.
 * Disabled entirely when the user prefers reduced motion — native scroll then.
 */
export function useSmoothScroll(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return

    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.1,
    })

    lenis.on('scroll', ScrollTrigger.update)

    const raf = (time: number) => {
      // Lenis expects milliseconds.
      lenis.raf(time)
    }
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(raf)
      lenis.destroy()
    }
  }, [enabled])
}

export { gsap, ScrollTrigger }
