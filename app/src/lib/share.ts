// A whole gift lives inside its own link — no backend, no database, no
// accounts. We serialize the GiftConfig to compact JSON, then to URL-safe
// base64 in the location hash. Sharing the URL is sharing the gift.

import type { GiftConfig } from './gift'

// UTF-8-safe base64 (btoa alone mangles non-ASCII like curly quotes / accents).
function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64UrlToBytes(s: string): Uint8Array {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

export function encodeGift(gift: GiftConfig): string {
  const json = JSON.stringify(gift)
  return bytesToBase64Url(new TextEncoder().encode(json))
}

export function decodeGift(encoded: string): GiftConfig | null {
  try {
    const json = new TextDecoder().decode(base64UrlToBytes(encoded))
    const parsed = JSON.parse(json)
    // Minimal sanity check — enough fields to render something meaningful.
    if (parsed && typeof parsed.recipient === 'string' && Array.isArray(parsed.introLines)) {
      return parsed as GiftConfig
    }
    return null
  } catch {
    return null
  }
}

// Build the full shareable URL for a gift, e.g. https://site/#/g/<encoded>
export function giftUrl(gift: GiftConfig): string {
  const base = window.location.origin + window.location.pathname
  return `${base}#/g/${encodeGift(gift)}`
}
