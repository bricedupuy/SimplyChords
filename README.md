# Chord Board

A chord progression map for musicians. Visualises diatonic chords, secondary dominants, and modal interchange side by side — with piano/guitar/ukulele diagrams, interactive audio, and a progression builder.

Designed as a Progressive Web App: installable on iOS and Android from the browser, works offline once cached.

---

## Features

### Board
- **Three rows** mirroring the Chord Files layout:
  - **Secondary Dominants** — V7 chords that resolve down to each main chord
  - **Main Chords** — the seven diatonic chords of the selected key (I–VII)
  - **Modal Interchange** — borrowed chords from the parallel minor (♭III, ♭VI, iv, ♭VII, ii°)
- **Path dimming** — after clicking a chord, unreachable next chords are dimmed following Chord Files rules
- **SVG arrows** showing allowed resolution paths between rows
- **Reset path** button to clear the dimming state

### Keys & Naming
- All 12 keys, transposing everything in real time
- Three name formats: **English** (C, Am, F#), **Solfège** (Do, Ré, Mi), **Nashville** (1, 6m, 4)

### Instrument Diagrams
- **Piano** — highlighted keys showing chord tones and scale tones, clickable in the detail panel
- **Guitar** — fretboard diagram with standard voicings
- **Ukulele** — fretboard diagram (GCEA tuning)
- Two view modes: **Name** (chord labels) or **Diagram** (inline instrument diagram on each tile)

### Detail Panel
- Tap the info strip at the bottom of any tile
- Shows piano diagram + fretboard diagram (guitar/uke), intervals, note names
- Click individual piano keys or fretboard dots to hear single notes

### Audio
- Web Audio API synthesis (triangle + sine oscillators)
- Click any tile to play the chord
- Sound can be toggled on/off
- Progression playback sequences chords at 72 BPM

### Progression Builder
- Click tiles to queue a progression
- Play, undo, or clear the sequence
- Export as text string (e.g. `Am – F – C – G`)

### Structures (Presets)
- **Pop** — I–V–vi–IV
- **Jazz ii–V–I** — ii–V–I
- **Emotional** — vi–IV–I–V
- **12-Bar Blues** — full 12-bar cycle
- Highlights the relevant tiles on the board

### Theme
- Dark and light modes, toggled from the top bar
- Updates the PWA theme colour dynamically

---

## Setup

No build step required. Serve the folder from any static HTTP server.

```bash
# Python
python3 -m http.server 8080

# Node (npx)
npx serve .

# Or drop the folder into Nginx/Apache public_html
```

Then open `http://localhost:8080` in a browser.

> **Note:** The app uses ES modules (`type="module"`), so it must be served over HTTP — opening `index.html` directly via `file://` will not work.

---

## Installing as a PWA

### iOS (Safari)
1. Open the app URL in Safari
2. Tap the Share button
3. Tap **Add to Home Screen**

### Android (Chrome)
1. Open the app URL in Chrome
2. Tap the three-dot menu
3. Tap **Add to Home Screen** or **Install app**

Once installed, the app opens full-screen with no browser chrome.

---

## File Structure

```
chord-board/
├── index.html              # App shell and markup
├── app.js                  # State management and init
├── style.css               # All styles and themes
├── manifest.json           # PWA manifest
├── icon-192.png            # PWA icon (192×192)
├── icon-512.png            # PWA icon (512×512)
├── data/
│   ├── theory.js           # Music theory: scales, chords, intervals, moods
│   └── instruments.js      # Guitar and ukulele voicings for all 12 keys
├── ui/
│   ├── board.js            # Tile rendering, path dimming, detail panel
│   ├── controls.js         # Key bar, settings drawer, toggles
│   ├── diagrams.js         # Piano and fretboard SVG renderers
│   ├── arrows.js           # SVG flow arrows between rows
│   └── progression.js      # Progression tray and playback
└── audio/
    └── player.js           # Web Audio synthesis engine
```

---

## Roadmap

### Phase 3 (planned)
- Guitar and ukulele fingering diagrams with both simple and barre voicings
- Dark Harmony mode (secondary dominants, tritone substitutions)
- Circle of fifths colour scheme

### Phase 4 (planned)
- Sampled piano audio (replacing oscillators)
- Service Worker for full offline support
- URL-shareable progressions

---

## Credits

Chord theory and board layout inspired by [Chord Files](https://www.chordfiles.com) by Jaka Zaletelj.

Built with vanilla JS ES modules, [Lucide Icons](https://lucide.dev), and Web Audio API.
