# For Kit

A quiet, cinematic birthday experience — less a website than a signed piece of
digital art, made by Elijah for one person on one day.

It opens in darkness. A handwritten line arrives — *For Kit.* — then *July 3.*
Only then does her portrait develop out of the dark. From there the experience
moves like walking slowly through a quiet gallery: The Fighter, Realistic,
Your Aura, the things that make her *her*, and — its emotional centre — Thank
You: the exhibition she came to, the two friends she brought, the day we taught
children art together. It closes on wishes written only for her, a return to
the portrait, and silence.

There is one thing hidden among the drifting wishes. It is meant to be found by
chance.

## Stack

React · TypeScript · Vite · Tailwind CSS · Framer Motion · GSAP (ScrollTrigger)
· Lenis smooth scroll · Three.js particles · Web Audio (optional, muted ambient).

Built performance-first and accessible: it fully respects
`prefers-reduced-motion`, and the ambient sound is off by default — silence is
the intended soundtrack.

## Run it

```bash
cd app
npm install
npm run dev      # local dev
npm run build    # production build -> app/dist
npm run preview  # preview the build
```

## Media

Web-ready assets live in `app/public/media/` (images optimized from the
originals; the two clips transcoded to H.264 MP4 for cross-browser playback).
The original camera files are kept at the project root as the source of truth.

— With care.
