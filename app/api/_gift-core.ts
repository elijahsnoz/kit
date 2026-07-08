// Shared server-side core: turns the creator's answers into the written parts
// of a gift, in the voice of the original "For Kit" piece. Used by both the
// Vercel serverless function (production) and the Vite dev middleware (local),
// so there is one prompt and one schema.
//
// Zero dependencies on purpose — a plain fetch to the Messages API runs
// identically in a Node serverless function and in the Vite dev server without
// bundling the SDK into anything.

export type GiftInputCore = {
  recipient: string
  occasion: string // closing headline, e.g. "Happy Birthday", "Congratulations"
  occasionKind: string // what it's for, e.g. "birthday", "wedding", "anniversary"
  relationship: string
  traits: string
  memory?: string
  tone: string
}

// Only the written fields — the base fields (name, date, sender) come straight
// from the form on the client. Schema constraints follow the structured-output
// rules: every object sets additionalProperties:false and lists required keys.
const GIFT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: [
    'introLines',
    'essence',
    'message',
    'wishWords',
    'bigWishes',
    'finalThanks',
    'blessing',
    'hiddenNote',
  ],
  properties: {
    introLines: { type: 'array', items: { type: 'string' } },
    essence: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['word', 'note'],
        properties: {
          word: { type: 'string' },
          note: { type: 'string' },
        },
      },
    },
    message: { type: 'array', items: { type: 'string' } },
    wishWords: { type: 'array', items: { type: 'string' } },
    bigWishes: { type: 'array', items: { type: 'string' } },
    finalThanks: { type: 'array', items: { type: 'string' } },
    blessing: { type: 'string' },
    hiddenNote: { type: 'array', items: { type: 'string' } },
  },
} as const

const SYSTEM = `You are the writer behind a quiet, cinematic digital gift — less a greeting card than a signed piece of art made for one person (or a couple). It can mark any occasion: a birthday, a wedding, an anniversary, a graduation, a farewell, a holiday like Christmas or Mother's Day, or simply gratitude. Write to the occasion you are given.

The tone is understated, sincere, and unhurried: short declarative lines with room to breathe, never saccharine, never generic, no exclamation marks, no emoji, no clichés like "you light up every room." Draw every line from the specific person and occasion described. British/neutral spelling is fine. Each line should feel handwritten and true.

You will be given who the gift is for, the occasion, the relationship, a few things that are true about them, and optionally a shared memory. Compose the written passages of their experience. Guidance for each field:
- introLines: exactly 4 lines. A slow opening: three short lines that build toward the occasion, then a final line that is the given closing headline + their name (e.g. "Happy Birthday, Ada." or "Congratulations, Ada & Sam.").
- essence: 4 to 6 items. Each is a single word or very short phrase (a trait / what they love / for a wedding, what they are to each other) plus a short poetic "note" (3-7 words, lowercase, no full stop) capturing why it matters.
- message: 3 to 4 short lines — the heart of it, written to the occasion. If a shared memory was given, weave it in honestly; otherwise speak to who they are and what this day means. The last line should land softly.
- wishWords: 8 to 10 single words drawn from who they are and the occasion (used as drifting motes). Title Case, one word each, no phrases.
- bigWishes: 5 to 6 full blessings, each one sentence beginning "May ...", each specific to them and fitting the occasion (a wedding wishes a life together; a birthday wishes the year ahead).
- finalThanks: 3 to 5 short fragments that each complete "Thank you… <fragment>" (e.g. "for your quiet courage."). Lowercase start, end with a full stop. If gratitude doesn't fit the occasion, make these warm affirmations of them instead, still phrased as short fragments.
- blessing: one warm closing sentence wishing them well in what comes next, specific to them and the occasion.
- hiddenNote: exactly 3 short handwritten lines — an intimate note found by chance. The last line is simply "Thank you." If no memory was shared, still write something true and personal.

Return only the structured object.`

export async function generateGiftContent(
  input: GiftInputCore,
  apiKey: string,
  model = 'claude-opus-4-8',
) {
  const userPrompt = [
    `For: ${input.recipient}`,
    `Occasion: ${input.occasionKind} (closing headline should read "${input.occasion}, ${input.recipient}.")`,
    `Relationship to me: ${input.relationship}`,
    `Things that are true about them / that they love: ${input.traits}`,
    input.memory ? `A memory we share: ${input.memory}` : `No specific shared memory was given.`,
    `Desired tone: ${input.tone}`,
  ].join('\n')

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 4000,
      system: SYSTEM,
      messages: [{ role: 'user', content: userPrompt }],
      output_config: { format: { type: 'json_schema', schema: GIFT_SCHEMA } },
    }),
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`Anthropic API ${res.status}: ${detail.slice(0, 300)}`)
  }

  const data = (await res.json()) as {
    content?: Array<{ type: string; text?: string }>
    stop_reason?: string
  }
  if (data.stop_reason === 'refusal') {
    throw new Error('The request was declined.')
  }
  const textBlock = data.content?.find((b) => b.type === 'text' && typeof b.text === 'string')
  if (!textBlock?.text) throw new Error('No content returned.')
  return JSON.parse(textBlock.text)
}
