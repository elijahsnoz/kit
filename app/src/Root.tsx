import { useEffect, useState } from 'react'
import App from './App' // Kit's original experience, untouched
import Landing from './components/Landing'
import Creator from './components/Creator'
import GiftExperience from './experiences/GiftExperience'
import { decodeGift } from './lib/share'
import { EXAMPLE_GIFT } from './lib/gift'

function useHash() {
  const [hash, setHash] = useState(() => window.location.hash)
  useEffect(() => {
    const onChange = () => {
      setHash(window.location.hash)
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return hash
}

/**
 * A tiny hash router — no dependencies. Everything a shared gift needs travels
 * in the hash, so a static host is enough.
 *
 *   #/ (default)  → the product homepage (with the Create button)
 *   #/make        → the product homepage (explicit alias)
 *   #/create      → the gift maker
 *   #/kit         → Kit's original experience, untouched
 *   #/g/<data>    → a gift, decoded straight from the link
 */
export default function Root() {
  const hash = useHash()

  // Kit's gift lives here now — the experience itself is unchanged.
  if (hash.startsWith('#/kit')) return <App />

  if (hash.startsWith('#/create')) return <Creator />

  if (hash.startsWith('#/g/')) {
    const encoded = hash.slice('#/g/'.length)
    const gift = decodeGift(encoded)
    return gift ? <GiftExperience gift={gift} /> : <BrokenLink />
  }

  // A convenience route for showing the product with real content.
  if (hash.startsWith('#/example')) return <GiftExperience gift={EXAMPLE_GIFT} />

  // Default and #/make both show the product homepage.
  return <Landing />
}

function BrokenLink() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-6 bg-ink px-6 text-center">
      <p className="font-serif text-[clamp(1.6rem,5vw,2.6rem)] font-light text-white/80">
        This gift couldn't be opened.
      </p>
      <p className="max-w-md font-serif text-[1.1rem] font-light text-white/50">
        The link may be incomplete. Ask whoever sent it to share it again.
      </p>
      <a
        href="#/"
        className="mt-2 rounded-full border border-gold-soft/30 px-8 py-3 font-sans text-[0.68rem] uppercase tracking-widest2 text-gold-soft transition-all hover:border-gold-soft/60"
      >
        make one of your own
      </a>
    </div>
  )
}
