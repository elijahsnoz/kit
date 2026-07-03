import { useEffect, useRef } from 'react'
import { gsap } from '../lib/smoothScroll'
import { useReducedMotion } from '../lib/hooks'

type Frame = 'tall' | 'portrait' | 'wide' | 'square'

const FRAME: Record<Frame, string> = {
  tall: 'aspect-[3/4]',
  portrait: 'aspect-[4/5]',
  wide: 'aspect-[16/10]',
  square: 'aspect-square',
}

/**
 * A photograph presented like a plate in an exhibition: it lifts in from a
 * soft blur, then holds a slow, continuous zoom as it travels through the
 * viewport. A warm gradient laces it into the surrounding darkness so nothing
 * ever feels like a pasted-in image.
 */
export function CinematicImage({
  src,
  alt,
  frame = 'tall',
  className = '',
  objectPosition = 'center',
  zoom = 0.14,
}: {
  src: string
  alt: string
  frame?: Frame
  className?: string
  objectPosition?: string
  zoom?: number
}) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const reduce = useReducedMotion()

  useEffect(() => {
    if (reduce) return
    const wrap = wrapRef.current
    const img = imgRef.current
    if (!wrap || !img) return

    const ctx = gsap.context(() => {
      // Entrance: emerge from blur + slight rise, revealed by a growing mask.
      gsap.fromTo(
        wrap,
        { autoAlpha: 0, y: 60, filter: 'blur(18px)', clipPath: 'inset(12% 12% 12% 12%)' },
        {
          autoAlpha: 1,
          y: 0,
          filter: 'blur(0px)',
          clipPath: 'inset(0% 0% 0% 0%)',
          duration: 1.8,
          ease: 'power3.out',
          scrollTrigger: { trigger: wrap, start: 'top 82%' },
        },
      )
      // Continuous slow zoom while it crosses the screen.
      gsap.fromTo(
        img,
        { scale: 1 + zoom },
        {
          scale: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: wrap,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.2,
          },
        },
      )
    }, wrap)

    return () => ctx.revert()
  }, [reduce, zoom])

  return (
    <div
      ref={wrapRef}
      className={`relative overflow-hidden rounded-[3px] ${FRAME[frame]} ${className}`}
      style={{ boxShadow: '0 50px 130px -40px rgba(0,0,0,0.95)' }}
    >
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading="lazy"
        draggable={false}
        className="h-full w-full select-none object-cover"
        style={{ objectPosition }}
      />
      {/* Warm lacing + vignette so it dissolves into the dark */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 90% at 50% 40%, transparent 55%, rgba(5,5,5,0.55) 100%), linear-gradient(to top, rgba(5,5,5,0.5), transparent 40%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 mix-blend-soft-light"
        style={{ background: 'radial-gradient(90% 70% at 50% 30%, rgba(201,162,75,0.12), transparent 70%)' }}
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-[rgba(216,190,134,0.08)]" />
    </div>
  )
}

/**
 * The school-art video. Muted, loops softly, and only plays while on screen to
 * stay gentle on resources. Presented in the same exhibition frame as the
 * stills.
 */
export function CinematicVideo({
  src,
  poster,
  frame = 'tall',
  className = '',
}: {
  src: string
  poster?: string
  frame?: Frame
  className?: string
}) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const reduce = useReducedMotion()

  useEffect(() => {
    const wrap = wrapRef.current
    const video = videoRef.current
    if (!wrap || !video) return

    // Play only while in view.
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {})
        else video.pause()
      },
      { threshold: 0.25 },
    )
    io.observe(wrap)

    if (reduce) return () => io.disconnect()

    const ctx = gsap.context(() => {
      gsap.fromTo(
        wrap,
        { autoAlpha: 0, y: 60, filter: 'blur(18px)' },
        {
          autoAlpha: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 1.8,
          ease: 'power3.out',
          scrollTrigger: { trigger: wrap, start: 'top 82%' },
        },
      )
    }, wrap)

    return () => {
      io.disconnect()
      ctx.revert()
    }
  }, [reduce])

  return (
    <div
      ref={wrapRef}
      className={`relative overflow-hidden rounded-[3px] ${FRAME[frame]} ${className}`}
      style={{ boxShadow: '0 50px 130px -40px rgba(0,0,0,0.95)' }}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        preload="metadata"
        className="h-full w-full object-cover"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 90% at 50% 40%, transparent 55%, rgba(5,5,5,0.55) 100%), linear-gradient(to top, rgba(5,5,5,0.5), transparent 45%)',
        }}
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-[rgba(216,190,134,0.08)]" />
    </div>
  )
}
