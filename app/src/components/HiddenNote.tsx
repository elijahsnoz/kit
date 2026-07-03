import { AnimatePresence, motion } from 'framer-motion'
import { HIDDEN_NOTE } from '../lib/content'

/**
 * The folded note. When the hidden mote is found, everything else falls away
 * and a single handwritten message surfaces — no music, no flourish, just
 * honesty. A touch anywhere folds it closed again.
 */
export default function HiddenNote({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[85] flex flex-col items-center justify-center bg-ink px-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2.4, ease: 'easeInOut' }}
          onClick={onClose}
        >
          <div className="flex max-w-2xl flex-col items-center gap-8 text-center">
            {HIDDEN_NOTE.map((line, i) => (
              <motion.p
                key={i}
                className={
                  i === HIDDEN_NOTE.length - 1
                    ? 'font-hand text-[clamp(2rem,6vw,3.2rem)] font-medium text-gold-soft/85'
                    : 'font-hand text-[clamp(1.7rem,4.8vw,2.6rem)] font-normal leading-snug text-white/85'
                }
                initial={{ opacity: 0, y: 16, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 2.2, delay: 1 + i * 1.8, ease: [0.16, 1, 0.3, 1] }}
              >
                {line}
              </motion.p>
            ))}
          </div>

          <motion.span
            className="pointer-events-none absolute bottom-10 font-sans text-[0.6rem] tracking-widest2 text-white/25"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2, delay: 1 + HIDDEN_NOTE.length * 1.8 + 1 }}
          >
            touch to fold it away
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
