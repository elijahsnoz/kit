// Turns a few human answers into a finished GiftConfig. It asks the serverless
// AI endpoint first; if that isn't available (e.g. no API key, or hosted on a
// static-only host), it composes a graceful gift locally so the product always
// works.

import type { GiftConfig } from './gift'

export type GiftInput = {
  recipient: string
  occasion: string // the closing headline, e.g. "Happy Birthday", "Congratulations"
  occasionKind: string // what it's for, e.g. "birthday", "wedding", "anniversary"
  date?: string // "July 3"
  sender?: string // signature
  relationship: string // "my best friend", "my sister", …
  traits: string // who they are / what they love (freeform, comma-friendly)
  memory?: string // a shared memory to weave in
  tone: string // "warm & sincere", "playful", "poetic", …
}

export async function generateGift(input: GiftInput): Promise<{ gift: GiftConfig; usedAI: boolean }> {
  try {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    if (res.ok) {
      const data = await res.json()
      if (data && Array.isArray(data.introLines)) {
        return { gift: mergeInput(input, data), usedAI: true }
      }
    }
  } catch {
    // fall through to local composition
  }
  return { gift: fallbackGift(input), usedAI: false }
}

// The base fields always come straight from the creator's answers; the AI (or
// the fallback) only supplies the written passages.
function mergeInput(input: GiftInput, written: Partial<GiftConfig>): GiftConfig {
  return {
    recipient: input.recipient,
    occasion: input.occasion || 'Happy Birthday',
    date: input.date || undefined,
    sender: input.sender || undefined,
    introLines: written.introLines ?? [],
    essence: written.essence ?? [],
    message: written.message ?? [],
    wishWords: written.wishWords ?? [],
    bigWishes: written.bigWishes ?? [],
    finalThanks: written.finalThanks ?? [],
    blessing: written.blessing ?? '',
    hiddenNote: written.hiddenNote,
  }
}

/* ── Local fallback — no API key required ──────────────────────── */

function splitTraits(traits: string): string[] {
  return traits
    .split(/[,\n;]+| and /i)
    .map((t) => t.trim())
    .filter(Boolean)
}

const titleCase = (s: string) =>
  s.replace(/\b\w/g, (c) => c.toUpperCase())

export function fallbackGift(input: GiftInput): GiftConfig {
  const name = input.recipient.trim() || 'You'
  const traits = splitTraits(input.traits)
  const primary = traits[0] || 'kindness'

  const essence = traits.slice(0, 6).map((t) => ({
    word: titleCase(t),
    note: essenceNote(t),
  }))

  const wishWords = Array.from(
    new Set(
      traits
        .flatMap((t) => t.split(/\s+/))
        .map((w) => titleCase(w))
        .filter((w) => w.length > 2)
        .concat(['Joy', 'Kindness', 'Courage', 'Adventure', 'Laughter', 'Purpose']),
    ),
  ).slice(0, 10)

  const message = [
    `${input.memory ? input.memory.trim() : `Knowing you has quietly changed things for me.`}`,
    `You may not realise how much that meant.`,
    `I wanted you to know it, today of all days.`,
  ]

  const union = /wedding|anniversary|valentine/.test(input.occasionKind || '')
  const bigWishes = union
    ? [
        `May your ${primary.toLowerCase()} only deepen with the years.`,
        'May your home be full of laughter and long, easy evenings.',
        'May you keep choosing each other, gently, every day.',
        'May every hard season find you side by side.',
        'May the life you build be even kinder than the one you imagined.',
      ]
    : [
        `May your ${primary.toLowerCase()} always find room to grow.`,
        'May every journey leave you with a story worth keeping.',
        'May the people around you see you as clearly as I do.',
        'May life keep surprising you in beautiful ways.',
        'May the days ahead be gentler, braver, and fuller than the last.',
      ]

  const finalThanks = [
    'for being exactly who you are.',
    'for the moments I get to share with you.',
    'for making the ordinary feel like more.',
  ]

  return {
    recipient: name,
    occasion: input.occasion || 'Happy Birthday',
    date: input.date || undefined,
    sender: input.sender || undefined,
    introLines: [
      'Some people simply cross our path.',
      'They pass through without leaving a trace.',
      'Then there are people who quietly change everything.',
      `${input.occasion || 'Happy Birthday'}, ${name}.`,
    ],
    essence,
    message,
    wishWords,
    bigWishes,
    finalThanks,
    blessing: union
      ? `I hope the life you build together is full of meaning, quiet happiness, and years that only bring you closer.`
      : `I hope this new chapter is filled with meaning, quiet happiness, and people who see you as clearly as you deserve.`,
    hiddenNote: input.memory
      ? ['There are moments people forget.', "I don't think I'll forget this one.", 'Thank you.']
      : undefined,
  }
}

function essenceNote(trait: string): string {
  const t = trait.toLowerCase()
  if (/(art|paint|draw|music|write|creat)/.test(t)) return 'making where there was nothing'
  if (/(travel|adventure|explore|journey)/.test(t)) return 'the pull of somewhere new'
  if (/(teach|kid|child|mentor|help)/.test(t)) return 'planting things that outlive us'
  if (/(kind|care|warm|gentle)/.test(t)) return 'the quiet kind of strength'
  if (/(laugh|funny|joy|humor|humour)/.test(t)) return 'lightness, carried into every room'
  if (/(curious|learn|question)/.test(t)) return 'the questions you never stop asking'
  return 'entirely, unmistakably yours'
}
