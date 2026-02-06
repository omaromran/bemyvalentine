# Be My Valentine, Alex 💘

A single-page, romantic, interactive Valentine’s experience with 3 mini-games that unlock one by one.

## Run locally

```bash
npm install
npm run dev
```

Then open the URL shown (e.g. `http://localhost:5173`).

## Build

```bash
npm run build
npm run preview   # optional: preview production build
```

## Assets

Place these images in `public/assets/` (paths are used by the app; if missing, fallback shapes are used):

- **her.png** – Your face (flying face in Game 1, popping head in Game 2)
- **alex.png** – Alex’s avatar (optional UI)
- **us.png** – Photo of both (final reveal)

## Structure

- **Landing** → Start challenge, 3 locked heart icons (Cupids, Kisses, Letters)
- **Game 1 – Cupid Arrow** – Shoot heart arrows at the flying face (3 hits to win)
- **Game 2 – Beach Kisses** – Shoot kisses at the head popping from the sand (8 hits in 20s)
- **Game 3 – Word Puzzle** – Drag letters to spell “WOULD YOU BE MY VALENTINE?” (3 hints)
- **Final Reveal** – Heart celebration, `us.png`, date/location, “I’m In 💖”, Add to Calendar (.ics)

Tech: React, Vite, TypeScript, HTML5 Canvas for games 1–2, DOM for game 3. Red/pink theme, heart particles, optional sound (pop on hit, sparkle on level complete).
