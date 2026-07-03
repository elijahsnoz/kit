import PortraitReveal from './PortraitReveal'
import { Line } from './Reveal'
import { Sentence } from './Ui'
import { FINAL_THANKS, CLOSING_BLESSING } from '../lib/content'

/**
 * The way out. Everything slows. The portrait returns, smaller and quieter.
 * The thanks arrive one at a time, then dissolve into a single blessing — and
 * a final screen that simply holds. No replay. No footer. No navigation.
 */
export default function FinalScene() {
  return (
    <>
      {/* The portrait returns */}
      <section className="stage flex-col px-6 py-[16vh]">
        <div className="flex flex-col items-center gap-14">
          <PortraitReveal small />
          <Line amount={0.6} className="font-serif text-[clamp(2rem,6vw,3.6rem)] font-light italic text-white/90 text-breathe">
            Thank you…
          </Line>
        </div>
      </section>

      {/* The litany of thanks — one breath each */}
      <section className="stage flex-col px-6 py-[14vh]">
        <div className="flex max-w-3xl flex-col items-center gap-[11vh] text-center">
          {FINAL_THANKS.map((line, i) => (
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

      {/* The blessing */}
      <section className="stage flex-col px-6 py-[18vh]">
        <Sentence className="max-w-4xl text-[clamp(1.5rem,4.2vw,2.7rem)] leading-[1.5] italic gold-hair">
          {CLOSING_BLESSING}
        </Sentence>
      </section>

      {/* Final screen — it simply holds */}
      <section className="stage flex-col px-6 py-[24vh]">
        <div className="flex flex-col items-center gap-10 text-center">
          <Line amount={0.8} className="font-serif text-[clamp(2.6rem,9vw,6rem)] font-light leading-[1.05] text-white text-breathe">
            Happy Birthday, Kit.
          </Line>
          <Line
            delay={1.8}
            amount={0.8}
            className="font-hand text-[clamp(1.7rem,4vw,2.4rem)] font-medium text-gold-soft/75"
          >
            — Elijah
          </Line>
        </div>
      </section>

      {/* A last, long breath of darkness — the silence completes it */}
      <div className="h-[55svh]" aria-hidden />
    </>
  )
}
