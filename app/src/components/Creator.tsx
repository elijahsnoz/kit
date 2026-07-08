import { useState } from 'react'
import { generateGift, type GiftInput } from '../lib/ai'
import { giftUrl } from '../lib/share'
import type { GiftConfig } from '../lib/gift'

// Occasion presets. `kind` guides the writing; `headline` is the closing line
// ("<headline>, <name>."). "other" lets the maker type their own.
const OCCASIONS: { kind: string; label: string; headline: string }[] = [
  { kind: 'birthday', label: 'Birthday', headline: 'Happy Birthday' },
  { kind: 'wedding', label: 'Wedding', headline: 'Congratulations' },
  { kind: 'anniversary', label: 'Anniversary', headline: 'Happy Anniversary' },
  { kind: 'graduation', label: 'Graduation', headline: 'Congratulations' },
  { kind: 'christmas', label: 'Christmas', headline: 'Merry Christmas' },
  { kind: 'new year', label: 'New Year', headline: 'Happy New Year' },
  { kind: "mother's day", label: "Mother's Day", headline: "Happy Mother's Day" },
  { kind: "father's day", label: "Father's Day", headline: "Happy Father's Day" },
  { kind: "valentine's day", label: "Valentine's Day", headline: "Happy Valentine's Day" },
  { kind: 'thank you', label: 'Thank You / Just Because', headline: 'Thank You' },
]

/**
 * The maker's room. A quiet form gathers a few true things about the person,
 * the AI (or a local fallback) writes the piece, and out comes a private link
 * to share with friends and family.
 */
export default function Creator() {
  const [form, setForm] = useState<GiftInput>({
    recipient: '',
    occasion: 'Happy Birthday',
    occasionKind: 'birthday',
    date: '',
    sender: '',
    relationship: '',
    traits: '',
    memory: '',
    tone: 'warm & sincere',
  })
  const isCustomOccasion = !OCCASIONS.some((o) => o.kind === form.occasionKind)

  function onOccasion(e: React.ChangeEvent<HTMLSelectElement>) {
    const v = e.target.value
    if (v === 'other') {
      setForm((f) => ({ ...f, occasionKind: 'other', occasion: '' }))
      return
    }
    const preset = OCCASIONS.find((o) => o.kind === v)!
    setForm((f) => ({ ...f, occasionKind: preset.kind, occasion: preset.headline }))
  }
  const [status, setStatus] = useState<'idle' | 'working' | 'done' | 'error'>('idle')
  const [error, setError] = useState('')
  const [gift, setGift] = useState<GiftConfig | null>(null)
  const [usedAI, setUsedAI] = useState(false)
  const [link, setLink] = useState('')
  const [copied, setCopied] = useState(false)

  const set = (k: keyof GiftInput) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const canSubmit =
    form.recipient.trim() && form.traits.trim() && form.occasion.trim() && status !== 'working'

  async function onCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setStatus('working')
    setError('')
    try {
      const { gift, usedAI } = await generateGift(form)
      setGift(gift)
      setUsedAI(usedAI)
      setLink(giftUrl(gift))
      setStatus('done')
    } catch (err: any) {
      setError(String(err?.message || err))
      setStatus('error')
    }
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    } catch {
      /* clipboard blocked — the field is selectable as a fallback */
    }
  }

  return (
    <div className="min-h-screen w-full bg-ink px-6 py-[10vh]">
      <div className="mx-auto flex max-w-2xl flex-col">
        <a
          href="#/make"
          className="mb-10 font-sans text-[0.62rem] uppercase tracking-widest2 text-white/40 transition-colors hover:text-gold-soft/80"
        >
          ← home
        </a>

        <h1 className="font-serif text-[clamp(2.2rem,6vw,3.4rem)] font-light leading-tight text-white">
          Make a gift for someone.
        </h1>
        <p className="mt-4 max-w-xl font-serif text-[clamp(1.1rem,2.6vw,1.4rem)] font-light leading-relaxed text-white/60">
          Tell me a few true things about them. I'll write it into a quiet,
          cinematic page — and give you a private link to send.
        </p>

        {status !== 'done' && (
          <form onSubmit={onCreate} className="mt-12 flex flex-col gap-7">
            <Field label="Their name" required>
              <input className={inputCls} value={form.recipient} onChange={set('recipient')} placeholder="Kit" />
            </Field>

            <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
              <Field label="Occasion">
                <select
                  aria-label="Occasion"
                  className={inputCls}
                  value={isCustomOccasion ? 'other' : form.occasionKind}
                  onChange={onOccasion}
                >
                  {OCCASIONS.map((o) => (
                    <option key={o.kind} value={o.kind}>
                      {o.label}
                    </option>
                  ))}
                  <option value="other">Something else…</option>
                </select>
              </Field>
              <Field label="Date (optional)">
                <input className={inputCls} value={form.date} onChange={set('date')} placeholder="July 3" />
              </Field>
            </div>

            {isCustomOccasion && (
              <Field label="What should the closing say?" required>
                <input
                  className={inputCls}
                  value={form.occasion}
                  onChange={set('occasion')}
                  placeholder="Congratulations"
                />
                <span className="mt-2 block font-sans text-[0.65rem] text-white/35">
                  It reads as "{form.occasion || '…'}, {form.recipient || 'their name'}."
                </span>
              </Field>
            )}

            <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
              <Field label="Your name (the signature)">
                <input className={inputCls} value={form.sender} onChange={set('sender')} placeholder="Elijah" />
              </Field>
              <Field label="Your relationship">
                <input className={inputCls} value={form.relationship} onChange={set('relationship')} placeholder="a dear friend" />
              </Field>
            </div>

            <Field label="What is true about them? What do they love?" required>
              <textarea
                className={`${inputCls} min-h-[92px] resize-y`}
                value={form.traits}
                onChange={set('traits')}
                placeholder="art, travel, teaching children, fearless, endlessly curious, wears black like a signature"
              />
              <span className="mt-2 block font-sans text-[0.65rem] text-white/35">
                A few words or a sentence. Commas are fine.
              </span>
            </Field>

            <Field label="A memory you share (optional)">
              <textarea
                className={`${inputCls} min-h-[80px] resize-y`}
                value={form.memory}
                onChange={set('memory')}
                placeholder="You came to my exhibition and brought two friends. It meant more than you knew."
              />
            </Field>

            <Field label="Tone">
              <select aria-label="Tone" className={inputCls} value={form.tone} onChange={set('tone')}>
                <option>warm &amp; sincere</option>
                <option>quiet &amp; cinematic</option>
                <option>playful &amp; light</option>
                <option>poetic &amp; tender</option>
              </select>
            </Field>

            {status === 'error' && (
              <p className="font-sans text-[0.8rem] text-red-300/80">{error}</p>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className="mt-2 self-start rounded-full border border-gold-soft/30 bg-gold-soft/[0.06] px-9 py-3.5 font-sans text-[0.7rem] uppercase tracking-widest2 text-gold-soft transition-all hover:border-gold-soft/60 hover:bg-gold-soft/[0.12] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {status === 'working' ? 'writing…' : 'Create the gift'}
            </button>
          </form>
        )}

        {status === 'done' && gift && (
          <Result gift={gift} link={link} usedAI={usedAI} copied={copied} onCopy={copyLink} onReset={() => setStatus('idle')} />
        )}
      </div>
    </div>
  )
}

const inputCls =
  'w-full rounded-md border border-white/12 bg-white/[0.03] px-4 py-3 font-serif text-[1.05rem] text-white/90 outline-none transition-colors placeholder:text-white/25 focus:border-gold-soft/50'

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="font-sans text-[0.62rem] uppercase tracking-widest2 text-white/45">
        {label}
        {required && <span className="text-gold-soft/70"> ·</span>}
      </span>
      {children}
    </label>
  )
}

function Result({
  gift,
  link,
  usedAI,
  copied,
  onCopy,
  onReset,
}: {
  gift: GiftConfig
  link: string
  usedAI: boolean
  copied: boolean
  onCopy: () => void
  onReset: () => void
}) {
  return (
    <div className="mt-12 flex flex-col gap-8">
      <div>
        <p className="font-hand text-[clamp(1.8rem,5vw,2.6rem)] text-gold-soft/85">
          For {gift.recipient}.
        </p>
        <p className="mt-1 font-sans text-[0.62rem] uppercase tracking-widest2 text-white/40">
          {usedAI ? 'written just now' : 'composed locally · add an API key for AI-written words'}
        </p>
      </div>

      {/* A quiet preview of the written piece */}
      <div className="flex flex-col gap-6 rounded-lg border border-white/10 bg-white/[0.02] p-6">
        <Preview label="Opening" lines={gift.introLines} />
        <Preview label="The heart of it" lines={gift.message} />
        <div>
          <PreviewLabel>Wishes</PreviewLabel>
          <ul className="flex flex-col gap-1.5">
            {gift.bigWishes.map((w, i) => (
              <li key={i} className="font-serif text-[1.02rem] italic leading-relaxed text-white/75">
                {w}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <PreviewLabel>What makes them them</PreviewLabel>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {gift.essence.map((e, i) => (
              <span key={i} className="font-serif text-[1.02rem] text-white/70">
                {e.word}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* The shareable link */}
      <div className="flex flex-col gap-3">
        <PreviewLabel>Private link — send it to anyone</PreviewLabel>
        <input
          readOnly
          aria-label="Shareable gift link"
          value={link}
          onFocus={(e) => e.currentTarget.select()}
          className="w-full rounded-md border border-white/12 bg-white/[0.03] px-4 py-3 font-sans text-[0.8rem] text-white/70 outline-none"
        />
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onCopy}
            className="rounded-full border border-gold-soft/30 bg-gold-soft/[0.06] px-7 py-3 font-sans text-[0.68rem] uppercase tracking-widest2 text-gold-soft transition-all hover:border-gold-soft/60 hover:bg-gold-soft/[0.12]"
          >
            {copied ? 'copied ✓' : 'Copy link'}
          </button>
          <a
            href={link}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-white/15 px-7 py-3 font-sans text-[0.68rem] uppercase tracking-widest2 text-white/70 transition-all hover:border-white/40 hover:text-white"
          >
            Preview the experience ↗
          </a>
          <button
            type="button"
            onClick={onReset}
            className="rounded-full px-4 py-3 font-sans text-[0.68rem] uppercase tracking-widest2 text-white/40 transition-colors hover:text-white/70"
          >
            Make another
          </button>
        </div>
      </div>
    </div>
  )
}

function PreviewLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-2 block font-sans text-[0.6rem] uppercase tracking-widest2 text-gold-soft/50">
      {children}
    </span>
  )
}

function Preview({ label, lines }: { label: string; lines: string[] }) {
  return (
    <div>
      <PreviewLabel>{label}</PreviewLabel>
      <div className="flex flex-col gap-1">
        {lines.map((l, i) => (
          <p key={i} className="font-serif text-[1.05rem] font-light leading-relaxed text-white/80">
            {l}
          </p>
        ))}
      </div>
    </div>
  )
}
