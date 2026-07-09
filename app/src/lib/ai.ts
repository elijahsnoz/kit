// Turns a few human answers into a finished GiftConfig. It asks the serverless
// AI endpoint first; if that isn't available (no API key, static host, or the
// call fails), it composes the piece locally — free, private, and offline.
//
// The local writer is deliberately not a single template: it draws from phrase
// banks keyed to the person's own traits and to the occasion, so two gifts
// rarely read alike.

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
// the local writer) only supplies the written passages.
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

/* ── Local writer — no API key, no network, nothing leaves the browser ─── */

const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)]

function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const pickN = <T,>(arr: readonly T[], n: number): T[] => shuffle(arr).slice(0, n)

const titleCase = (s: string) => s.replace(/\b\w/g, (c) => c.toUpperCase())

function splitTraits(traits: string): string[] {
  return traits
    .split(/[,\n;]+| and /i)
    .map((t) => t.trim())
    .filter(Boolean)
}

/** Ends a sentence properly without doubling punctuation. */
function asSentence(s: string): string {
  const t = s.trim()
  if (!t) return t
  return /[.!?…]$/.test(t) ? t : `${t}.`
}

/* Occasion families — what kind of blessing the day wants. */
type Family = 'birthday' | 'union' | 'milestone' | 'holiday' | 'gratitude'

function familyOf(kind: string): Family {
  const k = (kind || '').toLowerCase()
  if (/wedding|anniversar|valentine|engage/.test(k)) return 'union'
  if (/graduat|promotion|new job|milestone|achiev/.test(k)) return 'milestone'
  if (/christmas|new year|mother|father|easter|thanksgiv|holiday|eid|diwali/.test(k)) return 'holiday'
  if (/thank|gratitude|just because|farewell|goodbye/.test(k)) return 'gratitude'
  return 'birthday'
}

/* ── Openings ───────────────────────────────────────────────────────── */

const OPENINGS: readonly (readonly string[])[] = [
  [
    'Some people simply cross our path.',
    'They pass through without leaving a trace.',
    'Then there are people who quietly change everything.',
  ],
  [
    'Most days pass without asking to be remembered.',
    'They arrive, and they go.',
    'And then there are the people who stay.',
  ],
  [
    'There are people you meet.',
    'And there are people you keep.',
    'You have always been the second kind.',
  ],
  [
    'The world is loud with people passing through.',
    'Few of them leave anything behind.',
    'You left something behind.',
  ],
  [
    'It is a rare thing to be truly seen by someone.',
    'Rarer still to know it while it is happening.',
    'This is me, knowing it.',
  ],
]

const OPENINGS_PLAYFUL: readonly (readonly string[])[] = [
  [
    'I could have bought you something.',
    'It would have sat in a drawer by spring.',
    'So I made you this instead.',
  ],
  [
    'There is no card big enough for this.',
    'Believe me, I looked.',
    'So the internet will have to do.',
  ],
]

/* ── Trait phrase bank ──────────────────────────────────────────────── */

type Category = keyof typeof NOTES

const NOTES = {
  art: [
    'making where there was nothing',
    'a language older than words',
    'proof that you were here',
    'beauty, insisted upon',
  ],
  travel: [
    'the pull of somewhere new',
    'saying yes to the unknown',
    'horizons that keep moving',
    'a map made of leaving',
  ],
  teach: [
    'planting things that outlive us',
    'patience, given away freely',
    'lighting rooms you will never sit in',
    'the quiet work of shaping someone',
  ],
  kind: [
    'the quiet kind of strength',
    'gentleness that costs something',
    'the softest form of courage',
    'warmth without conditions',
  ],
  joy: [
    'lightness, carried into every room',
    'laughter that arrives uninvited',
    'joy you refuse to ration',
    'the sound the day was missing',
  ],
  curious: [
    'the questions you never stop asking',
    'wonder, kept alive on purpose',
    'a mind that refuses to settle',
    'always one question further',
  ],
  courage: [
    'fear, walked through anyway',
    'the refusal to look away',
    'strength that never announces itself',
    'stubbornness with a good heart',
  ],
  music: ['the room, rearranged by sound', 'feeling, before language', 'something that says it better'],
  nature: ['stillness, borrowed from the trees', 'the world before it was busy'],
  food: ['love, disguised as an ordinary meal', 'care you can taste'],
  words: ['the world, written down and kept', 'sentences that hold their weight'],
  style: ['worn like a signature', 'certainty, quietly stated'],
  work: ['a promise you keep making', 'doors opened by refusing to stop'],
  family: ['home, wherever you are standing', 'the people you would rebuild the world for'],
  calm: ['stillness that other people lean on', 'the quiet at the centre of things'],
  faith: ['something to hold when nothing else holds'],
  other: [
    'entirely, unmistakably yours',
    'something only you could carry',
    'one of the reasons you are you',
  ],
} as const

const CATEGORY_TESTS: readonly [RegExp, Category][] = [
  [/art|paint|draw|design|creat|craft|photo|film/, 'art'],
  [/travel|adventur|explor|journey|wander|road/, 'travel'],
  [/teach|kid|child|mentor|student|school|nurs|care for/, 'teach'],
  [/kind|warm|gentle|generous|compassion|empath/, 'kind'],
  [/laugh|funny|humor|humour|joy|silly|playful|smile/, 'joy'],
  [/curious|curiosity|learn|question|read|study|wonder/, 'curious'],
  [/courage|brave|fearless|strong|persist|determin|resilien|fight/, 'courage'],
  [/music|sing|song|dance|guitar|piano|drum/, 'music'],
  [/nature|garden|plant|sea|ocean|mountain|hike|forest/, 'nature'],
  [/cook|bak|food|kitchen|meal|chef/, 'food'],
  [/writ|poet|book|story|journal/, 'words'],
  [/fashion|style|black|clothes|dress/, 'style'],
  [/work|ambition|business|build|hustle|discipline/, 'work'],
  [/family|mother|father|sister|brother|home|loyal/, 'family'],
  [/calm|quiet|patien|still|peace|grounded|serene/, 'calm'],
  [/faith|god|pray|spirit|believ/, 'faith'],
]

function categorise(trait: string): Category {
  const t = trait.toLowerCase()
  for (const [re, cat] of CATEGORY_TESTS) if (re.test(t)) return cat
  return 'other'
}

// Only these read naturally after "your …" — "your kindness" works,
// "your cooking" does not. Used for the thanks line and for {t} in wishes.
const QUALITY: readonly Category[] = ['kind', 'courage', 'curious', 'joy', 'calm', 'faith']

/** The first trait that is a quality rather than an activity, if any. */
function qualityTrait(traits: string[]): string | null {
  const found = traits.find((t) => QUALITY.includes(categorise(t)))
  return found ? found.toLowerCase() : null
}

/* ── Wishes, thanks, blessings ──────────────────────────────────────── */

const WISHES: Record<Family, readonly string[]> = {
  birthday: [
    'May your {t} always find room to grow.',
    'May this year be gentler, braver, and fuller than the last.',
    'May every journey leave you with a story worth keeping.',
    'May the people around you see you as clearly as I do.',
    'May life keep surprising you in the best possible ways.',
    'May your {t} open doors you have not thought to knock on.',
    'May you be as kind to yourself as you are to everyone else.',
    'May the year ahead make room for everything you have been carrying.',
  ],
  union: [
    'May your {t} only deepen with the years.',
    'May your home be full of laughter and long, easy evenings.',
    'May you keep choosing each other, gently, every day.',
    'May every hard season find you side by side.',
    'May the life you build be even kinder than the one you imagined.',
    'May the ordinary days turn out to be the ones you treasure most.',
    'May you never run out of things to say to one another.',
  ],
  milestone: [
    'May your {t} carry you further than you planned.',
    'May the work ahead be worthy of everything it cost you.',
    'May you never forget how far you have already come.',
    'May the next room you walk into be ready for you.',
    'May you keep beginning things, unafraid.',
    'May the doors you open stay open for someone behind you.',
  ],
  holiday: [
    'May this season be slow, warm, and entirely yours.',
    'May your {t} find you again in the quiet days.',
    'May the people you love be near, and the year be kind.',
    'May you rest as deeply as you have worked.',
    'May the light find its way back to you.',
    'May you be surrounded by the people who feel like home.',
  ],
  gratitude: [
    'May your {t} be returned to you tenfold.',
    'May you be met with the kindness you have given away.',
    'May you always know what you have meant to people.',
    'May the good you have done keep circling back.',
    'May you never doubt that you mattered here.',
    'May the world be as gentle with you as you have been with it.',
  ],
}

const BLESSINGS: Record<Family, readonly string[]> = {
  birthday: [
    'I hope this new year of your life is filled with beautiful journeys, meaningful work, quiet happiness, and people who appreciate you as much as you deserve.',
    'I hope the year ahead is gentler than the last, and that it gives you back everything you have quietly given away.',
    'I hope this chapter is full of meaning, unhurried happiness, and people who see you as clearly as you deserve to be seen.',
  ],
  union: [
    'I hope the life you build together is full of meaning, quiet happiness, and years that only bring you closer.',
    'I hope your home is loud with laughter, slow on Sunday mornings, and kind to you both in the difficult seasons.',
  ],
  milestone: [
    'I hope what comes next is worthy of everything it took to get here, and that you never stop being proud of how you did it.',
    'I hope the road ahead is generous to you, and that you meet it with the same stubborn heart that brought you this far.',
  ],
  holiday: [
    'I hope this season gives you rest, warmth, and the particular happiness of being among people who love you.',
    'I hope these days are slow and full, and that the year to come is kind to you.',
  ],
  gratitude: [
    'I hope you understand, even a little, what you have meant — and that every kindness you have given finds its way back to you.',
    'I hope life returns to you the same warmth you have spent so freely on everyone else.',
  ],
}

const THANKS_POOL: readonly string[] = [
  'for being exactly who you are.',
  'for the moments I get to share with you.',
  'for making the ordinary feel like more.',
  'for showing up when it would have been easier not to.',
  'for the lessons you never meant to teach.',
  'for the way you make people feel seen.',
  'for staying, when staying was the harder thing.',
  'for every conversation I have thought about since.',
]

const REFLECTIONS: readonly string[] = [
  'You may not realise how much that meant.',
  'I have never quite found the words for it.',
  'I have thought about it more times than I have told you.',
  'It stayed with me long after the day ended.',
]

const LANDINGS: readonly string[] = [
  'I wanted you to know it, today of all days.',
  'So today, I am saying it plainly.',
  'Consider this me finally saying it out loud.',
  'This is the only way I knew to say thank you.',
]

const OPENERS_NO_MEMORY: readonly string[] = [
  'Knowing you has quietly changed things for me.',
  'You have a way of making people braver than they were.',
  'Some people are noticed. You are remembered.',
  'You make the people around you want to be better at being people.',
]

const HIDDEN_NOTES: readonly (readonly string[])[] = [
  ['There are moments people forget.', "I don't think I'll ever forget that one.", 'Thank you.'],
  ['Some things are too small to say out loud.', 'This is one of them.', 'Thank you.'],
  ['I have never told you this.', 'It mattered more than you know.', 'Thank you.'],
  ["You probably don't remember it.", 'I do. I think I always will.', 'Thank you.'],
]

const FILLER_WORDS: readonly string[] = [
  'Joy', 'Kindness', 'Courage', 'Wonder', 'Laughter', 'Adventure',
  'Peace', 'Grace', 'Hope', 'Curiosity', 'Warmth', 'Light', 'Purpose', 'Stillness',
]

/* ── The writer ─────────────────────────────────────────────────────── */

export function fallbackGift(input: GiftInput): GiftConfig {
  const name = input.recipient.trim() || 'You'
  const headline = input.occasion.trim() || 'Happy Birthday'
  const family = familyOf(input.occasionKind)
  const traits = splitTraits(input.traits)
  const quality = qualityTrait(traits) // e.g. "kindness" — reads well after "your"
  const playful = /playful|light/i.test(input.tone)

  // Opening — three lines that build, then the headline.
  const opening = playful && Math.random() < 0.6 ? pick(OPENINGS_PLAYFUL) : pick(OPENINGS)
  const introLines = [...opening, `${headline}, ${name}.`]

  // Essence — their own words, each given a note drawn from its category.
  const essence = traits.slice(0, 6).map((t) => ({
    word: titleCase(t),
    note: pick(NOTES[categorise(t)]),
  }))

  // The heart of it — the memory, honestly placed.
  const memory = (input.memory || '').trim()
  const message = memory
    ? [asSentence(memory), pick(REFLECTIONS), pick(LANDINGS)]
    : [pick(OPENERS_NO_MEMORY), pick(REFLECTIONS), pick(LANDINGS)]

  // Drifting motes — their traits first, then curated warmth.
  const fromTraits = traits
    .flatMap((t) => t.split(/\s+/))
    .filter((w) => w.length > 2)
    .map(titleCase)
  const wishWords = Array.from(new Set([...fromTraits, ...shuffle(FILLER_WORDS)])).slice(0, 10)

  // Blessings — occasion-shaped. The "{t}" wishes only appear when we have a
  // trait that reads naturally after "your"; otherwise they're left out.
  const wishPool = quality ? WISHES[family] : WISHES[family].filter((w) => !w.includes('{t}'))
  const bigWishes = pickN(wishPool, 5).map((w) => w.replace('{t}', quality ?? ''))

  // Thanks — one drawn from who they are, when that reads well.
  const finalThanks = quality
    ? [`for your ${quality}.`, ...pickN(THANKS_POOL, 3)]
    : pickN(THANKS_POOL, 4)

  return {
    recipient: name,
    occasion: headline,
    date: input.date || undefined,
    sender: input.sender || undefined,
    introLines,
    essence,
    message,
    wishWords,
    bigWishes,
    finalThanks,
    blessing: pick(BLESSINGS[family]),
    hiddenNote: [...pick(HIDDEN_NOTES)],
  }
}
