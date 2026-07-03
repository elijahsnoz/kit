import { useReducedMotion } from 'framer-motion'

/**
 * Slow-moving ink & scratch texture for THE FIGHTER — soft impact ripples that
 * bloom and fade, drifting dust, and faint scratches. All very dark, very slow.
 */
export function InkTexture() {
  const reduce = useReducedMotion()
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Two large ink blooms breathing against each other */}
      <div
        className={`absolute -left-[10%] top-[12%] h-[60vh] w-[60vh] rounded-full blur-[80px] ${
          reduce ? '' : 'ink-drift-a'
        }`}
        style={{ background: 'radial-gradient(circle, rgba(30,30,34,0.9), transparent 68%)' }}
      />
      <div
        className={`absolute -right-[8%] bottom-[8%] h-[70vh] w-[70vh] rounded-full blur-[90px] ${
          reduce ? '' : 'ink-drift-b'
        }`}
        style={{ background: 'radial-gradient(circle, rgba(24,20,16,0.85), transparent 66%)' }}
      />
      {/* Impact ripple */}
      {!reduce && (
        <span
          className="ripple absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ border: '1px solid rgba(216,190,134,0.16)' }}
        />
      )}
      {/* Faint scratches */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.06]" preserveAspectRatio="none">
        <line x1="8%" y1="4%" x2="24%" y2="96%" stroke="white" strokeWidth="1" />
        <line x1="62%" y1="-2%" x2="78%" y2="102%" stroke="white" strokeWidth="0.6" />
        <line x1="88%" y1="10%" x2="96%" y2="90%" stroke="white" strokeWidth="0.5" />
      </svg>
    </div>
  )
}

/**
 * Caustic water-light for REALISTIC — the memory of Jabi Lake rendered as slow
 * shifting light on dark water, rather than a literal photograph we don't have.
 */
export function WaterLight() {
  const reduce = useReducedMotion()
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className={`absolute inset-x-0 bottom-0 h-[62%] ${reduce ? '' : 'water-shift'}`}
        style={{
          background:
            'repeating-linear-gradient(100deg, rgba(216,190,134,0.05) 0px, transparent 3px, transparent 22px), repeating-linear-gradient(80deg, rgba(120,150,170,0.05) 0px, transparent 4px, transparent 30px)',
          maskImage: 'linear-gradient(to top, black, transparent)',
          WebkitMaskImage: 'linear-gradient(to top, black, transparent)',
        }}
      />
      <div
        className={`absolute left-1/2 top-1/3 h-[50vh] w-[80vw] -translate-x-1/2 rounded-full blur-[100px] ${
          reduce ? '' : 'water-glow'
        }`}
        style={{ background: 'radial-gradient(circle, rgba(70,90,110,0.28), transparent 70%)' }}
      />
    </div>
  )
}
