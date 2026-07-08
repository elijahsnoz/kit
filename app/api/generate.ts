// Vercel serverless function: POST /api/generate
// Keeps the Anthropic API key server-side. If no key is configured it returns
// 501 so the client falls back to its local (template) generator — the product
// still works, just without AI-written words.

import { generateGiftContent, type GiftInputCore } from './_gift-core'

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    res.status(501).json({ error: 'AI is not configured on this deployment.' })
    return
  }

  try {
    const body: GiftInputCore =
      typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    const written = await generateGiftContent(body, apiKey, process.env.GIFT_MODEL)
    res.status(200).json(written)
  } catch (err: any) {
    res.status(502).json({ error: String(err?.message || err) })
  }
}
