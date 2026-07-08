// The shape of a single gift. Everything that makes an experience personal
// lives here as data, so the same cinematic engine can render a gift for
// anyone — and so an entire gift can travel inside a shareable link.

export type EssenceItem = { word: string; note: string }

export type GiftConfig = {
  // Who it's for, and who it's from.
  recipient: string
  occasion: string // e.g. "Happy Birthday" — the closing headline
  date?: string // e.g. "July 3" — the second handwritten title (optional)
  sender?: string // signature, e.g. "Elijah"

  // The words. Every array here is written to be personal, never generic.
  introLines: string[] // the slow opening four-beat
  essence: EssenceItem[] // "the things that make you… you"
  message: string[] // a short, personal middle passage (the "thank you" heart)
  wishWords: string[] // single words that drift around the portrait
  bigWishes: string[] // the full blessings in the wish-storm
  finalThanks: string[] // the closing litany ("Thank you… for …")
  blessing: string // one long closing blessing
  hiddenNote?: string[] // the note found by chance (optional)

  // Optional imagery. With no photo, an elegant typographic centerpiece is
  // shown instead — so a gift is complete with words alone.
  portraitUrl?: string
}

// Kit's original experience, expressed as a GiftConfig. Used as the showcased
// example and as a safe fallback. (Her full bespoke site still lives in App's
// KitExperience — this is the portable, words-only distillation of it.)
export const EXAMPLE_GIFT: GiftConfig = {
  recipient: 'Kit',
  occasion: 'Happy Birthday',
  date: 'July 3',
  sender: 'Elijah',
  introLines: [
    'Some people simply cross our path.',
    'They leave without changing us.',
    'Then there are people who quietly leave a mark.',
    'Happy Birthday, Kit.',
  ],
  essence: [
    { word: 'Travel', note: 'the pull of somewhere new' },
    { word: 'Art', note: 'a language older than words' },
    { word: 'Teaching Children', note: 'planting things that outlive us' },
    { word: 'Adventure', note: 'saying yes to the unknown' },
    { word: 'Creativity', note: 'making where there was nothing' },
    { word: 'Curiosity', note: 'the questions you never stop asking' },
  ],
  message: [
    'I still remember you coming to my exhibition.',
    'You reminded me that art becomes even more meaningful when it is shared.',
    'That meant far more than you probably realised.',
  ],
  wishWords: [
    'Kindness',
    'Persistence',
    'Curiosity',
    'Art',
    'Courage',
    'Laughter',
    'Purpose',
    'Adventure',
    'Creativity',
  ],
  bigWishes: [
    'May every child you teach remember your kindness.',
    'May every journey leave you with a story worth keeping.',
    'May your persistence continue opening doors.',
    'May your creativity never lose its curiosity.',
    'May your courage always stay stronger than uncertainty.',
    'May life surprise you in beautiful ways.',
  ],
  finalThanks: [
    'for supporting my art.',
    'for your kindness.',
    'for your persistence.',
    'for making meaningful memories with me.',
    'for simply being you.',
  ],
  blessing:
    'I hope this new year of your life is filled with beautiful journeys, meaningful work, quiet happiness, endless creativity, and people who appreciate you as much as you deserve.',
  hiddenNote: [
    'There are moments people forget.',
    "I don't think I'll ever forget that day.",
    'Thank you.',
  ],
}
