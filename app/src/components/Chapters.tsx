import { ChapterMark, Sentence } from './Ui'
import { Line } from './Reveal'
import { CinematicImage, CinematicVideo } from './CinematicMedia'
import { InkTexture, WaterLight } from './Atmosphere'
import WishStorm from './WishStorm'
import { ESSENCE } from '../lib/content'

/** Shared section wrapper: full breath, generous vertical rhythm. */
function Chapter({
  children,
  className = '',
  id,
}: {
  children: React.ReactNode
  className?: string
  id?: string
}) {
  return (
    <section
      id={id}
      className={`relative z-10 flex min-h-[100svh] flex-col items-center justify-center px-6 py-[22vh] ${className}`}
    >
      {children}
    </section>
  )
}

/* ── CHAPTER ONE — THE FIGHTER ─────────────────────────────────── */
export function ChapterOne() {
  return (
    <Chapter className="overflow-hidden">
      <InkTexture />
      <div className="relative z-10 flex max-w-3xl flex-col items-center gap-[9vh]">
        <ChapterMark numeral="I" title="The Fighter" />
        <div className="flex flex-col items-center gap-[7vh]">
          <Sentence className="text-[clamp(1.5rem,4.2vw,2.7rem)]">
            One thing I noticed about you…
          </Sentence>
          <Sentence className="text-[clamp(1.5rem,4.2vw,2.7rem)]">
            You never seem afraid of a challenge.
          </Sentence>
          <div className="flex flex-col items-center gap-6">
            <Sentence className="text-[clamp(1.15rem,3vw,1.7rem)] text-white/70">
              Some people avoid confrontation.
            </Sentence>
            <Sentence className="text-[clamp(1.15rem,3vw,1.7rem)] text-white/70" delay={0.15}>
              You almost welcome it.
            </Sentence>
          </div>
          <Sentence className="text-[clamp(1.5rem,4.2vw,2.7rem)] italic gold-hair">
            There is something fearless about you.
          </Sentence>
          <div className="flex flex-col items-center gap-3">
            <Line className="font-serif text-[clamp(1.3rem,3.4vw,2rem)] font-light text-white/85">Not anger.</Line>
            <Line delay={0.4} className="font-serif text-[clamp(1.3rem,3.4vw,2rem)] font-light text-white/85">Strength.</Line>
            <Line delay={0.8} className="font-serif text-[clamp(1.3rem,3.4vw,2rem)] font-light text-white/85">Persistence.</Line>
          </div>
          <Sentence className="text-[clamp(1.3rem,3.6vw,2.1rem)]">
            That persistence is one of the qualities I admire most.
          </Sentence>
        </div>
      </div>
    </Chapter>
  )
}

/* ── CHAPTER TWO — REALISTIC ───────────────────────────────────── */
export function ChapterTwo() {
  return (
    <Chapter className="overflow-hidden">
      <WaterLight />
      <div className="relative z-10 flex max-w-3xl flex-col items-center gap-[9vh]">
        <ChapterMark numeral="II" title="Realistic" />
        <div className="flex flex-col items-center gap-[7vh]">
          <Sentence className="text-[clamp(1.4rem,4vw,2.5rem)]">
            One conversation stayed with me.
          </Sentence>
          <Sentence className="text-[clamp(1.6rem,4.6vw,3rem)] italic gold-hair">
            That day at Jabi Lake.
          </Sentence>
          <Sentence className="text-[clamp(1.4rem,4vw,2.5rem)]">
            You reminded me to be realistic.
          </Sentence>
          <div className="flex flex-col items-center gap-5">
            <Sentence className="text-[clamp(1.1rem,3vw,1.6rem)] text-white/65">Simple words.</Sentence>
            <Sentence className="text-[clamp(1.1rem,3vw,1.6rem)] text-white/65" delay={0.2}>Yet somehow…</Sentence>
            <Sentence className="text-[clamp(1.3rem,3.6vw,2rem)]" delay={0.4}>they stayed with me.</Sentence>
          </div>
          <Sentence className="text-[clamp(1.4rem,4vw,2.4rem)] italic">
            Thank you for that lesson.
          </Sentence>
        </div>
      </div>
    </Chapter>
  )
}

/* ── CHAPTER THREE — YOUR AURA ─────────────────────────────────── */
export function ChapterThree() {
  return (
    <Chapter>
      <div className="grid w-full max-w-6xl grid-cols-1 items-center gap-16 md:grid-cols-2">
        <div className="order-2 md:order-1">
          <CinematicImage
            src="./media/aura-candid.jpg"
            alt="Kit, at ease — a quiet, candid moment."
            frame="tall"
            objectPosition="50% 30%"
          />
        </div>
        <div className="order-1 flex flex-col gap-[6vh] md:order-2">
          <ChapterMark numeral="III" title="Your Aura" />
          <div className="flex flex-col gap-8 text-center md:text-left">
            <Line className="font-serif text-[clamp(1.4rem,3.6vw,2.2rem)] font-light text-white/85">
              Some people are noticed.
            </Line>
            <Line delay={0.2} className="font-serif text-[clamp(1.4rem,3.6vw,2.2rem)] font-light text-white/85">
              Others are remembered.
            </Line>
            <Line delay={0.4} className="font-serif text-[clamp(1.5rem,4vw,2.5rem)] font-light italic gold-hair">
              You have an aura that quietly fills the room.
            </Line>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 md:justify-start">
              {['Calm.', 'Strong.', 'Comfortable.', 'Authentic.'].map((w, i) => (
                <Line key={w} delay={0.5 + i * 0.15} className="font-serif text-[clamp(1.2rem,3vw,1.8rem)] text-white/80">
                  {w}
                </Line>
              ))}
            </div>
            <Line delay={1.2} className="font-serif text-[clamp(1.1rem,2.8vw,1.5rem)] font-light text-white/60">
              It isn't something you try to create. It's simply who you are.
            </Line>
          </div>
        </div>
      </div>
    </Chapter>
  )
}

/* ── CHAPTER FOUR — THE THINGS THAT MAKE YOU… YOU ──────────────── */
export function ChapterFour() {
  return (
    <>
      <Chapter className="pb-[8vh]">
        <ChapterMark numeral="IV" title="The Things That Make You… You" />
        <Sentence className="mt-2 text-[clamp(1.1rem,2.8vw,1.5rem)] text-white/55">
          A few of the things I know to be true about you.
        </Sentence>
      </Chapter>

      {/* Alternating immersive typographic scenes */}
      <section className="relative z-10 mx-auto flex max-w-5xl flex-col gap-[24vh] px-6 pb-[16vh]">
        {ESSENCE.map((item, i) => (
          <EssenceScene key={item.word} item={item} index={i} />
        ))}

        {/* Black fashion / art / culture — anchored by the Fela portrait */}
        <div className="grid grid-cols-1 items-center gap-14 md:grid-cols-2">
          <CinematicImage
            src="./media/fela-fashion.jpg"
            alt="Kit holding a gold-on-black Fela Kuti shirt — art, music, and black worn like a signature."
            frame="portrait"
            objectPosition="50% 35%"
            className="md:order-2"
          />
          <div className="flex flex-col gap-6 text-center md:order-1 md:text-left">
            <Line className="font-serif text-[clamp(1.6rem,4vw,2.4rem)] font-light italic gold-hair">
              Black, worn like a signature.
            </Line>
            <Line delay={0.25} className="font-serif text-[clamp(1.1rem,2.8vw,1.5rem)] font-light leading-relaxed text-white/70">
              Art you can hold. Music that means something. A curiosity for
              culture that isn't yours by birth, but yours by love.
            </Line>
          </div>
        </div>
      </section>
    </>
  )
}

function EssenceScene({
  item,
  index,
}: {
  item: { word: string; note: string }
  index: number
}) {
  const alignRight = index % 2 === 1
  return (
    <div className={`flex flex-col ${alignRight ? 'items-end text-right' : 'items-start text-left'}`}>
      <Line className="font-serif text-[clamp(3rem,13vw,9rem)] font-light leading-[0.95] tracking-tight text-white/90 text-breathe">
        {item.word}
      </Line>
      <Line delay={0.3} className="mt-4 max-w-md font-sans text-[0.72rem] uppercase tracking-widest2 text-gold-soft/60">
        {item.note}
      </Line>
    </div>
  )
}

/* ── CHAPTER FIVE — THANK YOU (the emotional centre) ───────────── */
export function ChapterFive() {
  return (
    <>
      <Chapter className="pb-[6vh]">
        <ChapterMark numeral="V" title="Thank You" />
      </Chapter>

      <section className="relative z-10 mx-auto flex max-w-3xl flex-col items-center gap-[10vh] px-6">
        <Sentence className="text-[clamp(1.4rem,4vw,2.3rem)]">
          I still remember you coming to my exhibition.
        </Sentence>
        <div className="flex flex-col items-center gap-5">
          <Sentence className="text-[clamp(1.2rem,3.2vw,1.8rem)] text-white/75">
            Not only did you come…
          </Sentence>
          <Sentence delay={0.3} className="text-[clamp(1.5rem,4.2vw,2.6rem)] italic gold-hair">
            you brought your two friends.
          </Sentence>
        </div>
      </section>

      {/* Walking into the exhibition together */}
      <section className="relative z-10 mx-auto my-[16vh] w-full max-w-2xl px-6">
        <CinematicVideo
          src="./media/exhibition.mp4"
          poster="./media/exhibition-poster.jpg"
          frame="portrait"
        />
        <Line delay={0.2} className="mt-6 text-center font-sans text-[0.72rem] uppercase tracking-widest2 text-white/40">
          walking in
        </Line>
      </section>

      <section className="relative z-10 mx-auto flex max-w-3xl flex-col items-center gap-[9vh] px-6">
        <Sentence className="text-[clamp(1.2rem,3.2vw,1.8rem)] text-white/75">
          That meant far more than you probably realised.
        </Sentence>
        <Sentence className="text-[clamp(1.3rem,3.6vw,2.1rem)]">
          But what stayed with me even longer… was what happened afterwards.
        </Sentence>
        <Sentence className="text-[clamp(1.3rem,3.6vw,2.1rem)]" delay={0.2}>
          You organised for me and my friends to come to your school.
        </Sentence>
      </section>

      {/* Us at the school */}
      <section className="relative z-10 mx-auto my-[12vh] w-full max-w-3xl px-6">
        <CinematicImage
          src="./media/school-together.jpg"
          alt="Elijah and Kit at the school, the day we came to teach."
          frame="portrait"
          objectPosition="50% 25%"
        />
      </section>

      <section className="relative z-10 mx-auto flex max-w-3xl flex-col items-center gap-[7vh] px-6">
        <Sentence className="text-[clamp(1.3rem,3.6vw,2rem)]">
          Together we spent time teaching children art.
        </Sentence>
        <div className="flex flex-col items-center gap-4">
          {['Watching those children create…', 'seeing their excitement…', 'their imagination…', 'their smiles…'].map(
            (l, i) => (
              <Sentence key={l} delay={i * 0.12} className="text-[clamp(1.1rem,3vw,1.6rem)] text-white/75">
                {l}
              </Sentence>
            ),
          )}
        </div>
      </section>

      {/* The art itself — the video */}
      <section className="relative z-10 mx-auto my-[12vh] w-full max-w-2xl px-6">
        <CinematicVideo
          src="./media/school-art.mp4"
          poster="./media/school-art-poster.jpg"
          frame="portrait"
        />
        <Line delay={0.2} className="mt-6 text-center font-sans text-[0.72rem] uppercase tracking-widest2 text-white/40">
          what we made together
        </Line>
      </section>

      <section className="relative z-10 mx-auto flex max-w-3xl flex-col items-center gap-[8vh] px-6 pb-[14vh]">
        <Sentence className="text-[clamp(1.2rem,3.2vw,1.8rem)] text-white/80">
          …is something I'll always appreciate.
        </Sentence>
        <Sentence className="text-[clamp(1.4rem,4vw,2.3rem)] italic">
          Thank you for making that possible.
        </Sentence>
        <Sentence delay={0.3} className="text-[clamp(1.3rem,3.6vw,2.1rem)] gold-hair">
          You reminded me that art becomes even more meaningful when it is shared.
        </Sentence>
      </section>
    </>
  )
}

/* ── CHAPTER SIX — WISHES ──────────────────────────────────────── */
export function ChapterSix({ active }: { active: boolean }) {
  return (
    <section id="wishes" className="relative z-10">
      <div className="flex min-h-[60svh] flex-col items-center justify-end px-6 pb-[6vh]">
        <ChapterMark numeral="VI" title="Wishes" />
      </div>
      <WishStorm active={active} />
    </section>
  )
}
