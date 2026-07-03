# Happy Birthday, Kit

A quiet, cinematic digital letter — an interactive experience that opens in
darkness, develops a portrait out of the dark, and moves through six chapters
before ending in silence.

Built with React + TypeScript + Vite, Tailwind, Framer Motion, GSAP
(ScrollTrigger), Lenis smooth scrolling, and a Three.js particle field.

## Run it

```bash
cd app
npm install
npm run dev      # open the printed http://localhost:5173 URL
```

Production build:

```bash
npm run build
npm run preview
```

Best experienced full-screen, with the sound of the room and a slow scroll.
It respects `prefers-reduced-motion`: with that on, the reveals become gentle
fades and the smooth-scroll / heavy motion step aside.

## A note on the media

The brief assumed `kit pic .PNG` was a hand-drawn scribble. On inspection it is
a **photograph** — a warm night-time selfie of Kit in black. Rather than
replace it, the experience honours the brief's *intent*: the portrait is
**developed out of darkness in real time** (~10s luminance-mask reveal) while a
loose gold "artist's line" draws itself around her — a nod to the fact that this
was made by someone who draws. It then breathes.

Every asset was mapped to where it lands emotionally:

| Asset | Where it lives |
| --- | --- |
| `kit pic .PNG` | The centerpiece portrait (opening + final return) |
| `b4542dab….JPG` (Kit + two friends) | Ch. V — "you brought your two friends" |
| `IMG_9660` (candid, in black) | Ch. III — Your Aura |
| `IMG_9663` (gold Fela Kuti shirt) | Ch. IV — black, art, culture |
| `IMG_1917` (Elijah & Kit at the school) | Ch. V — the school visit |
| `IMG_1969 2.MOV` (the artwork at school) | Ch. V — "what we made together" |

There was no confirmable Jabi Lake photograph, so Chapter II (Realistic) is
rendered as atmosphere — slow light on dark water — rather than a
mislabelled image.

Media is pre-processed into `public/media/` (HEIC → JPG, the portrait as PNG,
and the HEVC video transcoded to H.264 MP4 with a poster frame) so it plays
across browsers. The original source files remain in the parent folder.

## Structure

- `src/components/ParticleField.tsx` — the Three.js dust that drifts like it's underwater
- `src/components/PortraitReveal.tsx` — the develop-from-darkness centerpiece
- `src/components/FloatingWishes.tsx` — translucent wishes that dissolve on hover
- `src/components/Chapters.tsx` — the six chapters
- `src/components/WishStorm.tsx` — Chapter VI, the wishes multiply
- `src/components/FinalScene.tsx` — the thanks, the blessing, and silence
- `src/lib/content.ts` — every word, in one place
```
