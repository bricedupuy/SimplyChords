# Chord Board

A chord progression map for musicians. Visualises diatonic chords, secondary dominants, and modal interchange side by side — with piano/guitar/ukulele diagrams, interactive audio, and a progression builder.

Designed as a Progressive Web App: installable on iOS and Android from the browser.

---

## Modes

### Progressions
Based on the major key. Three rows:
- **Secondary Dominants** (top) — V7 of each diatonic chord, resolves down to its target
- **Main Chords** (middle) — the seven diatonic chords, mix freely
- **Modal Interchange** (bottom) — borrowed from the parallel minor (♭III, ♭VI, iv, ♭VII, ii°), enter via I, IV or V

### Dark Harmony
Based on the harmonic minor scale. Three rows:
- **Sec. Dim. V + Neapolitan** (top) — four fully-diminished 7th chords (enharmonic spellings of the same chord) plus the Neapolitan ♭II Maj7, all resolving down to V
- **Main Chords** (middle) — harmonic minor diatonic set: i, ♭III Maj7, iv, ♭VI, V7, #vii°7, ii°, mix freely
- **Sec. Dim. iv · ♭VI** (bottom) — four fully-diminished 7th chords resolving up to iv or ♭VI

Path rules:
- Top row → only V is reachable next in Main
- Bottom row → only the specific iv or ♭VI target is reachable next
- Neapolitan → only V is reachable next
- From Main → all rows are freely accessible

---

## Features

### Board
- Mode-aware three-row layout — each mode defines its own rows, chord data, dimming rules and arrows
- **Path dimming** — after clicking a chord, unreachable next chords are dimmed
- **SVG arrows** showing resolution paths between rows
- **Reset path** button to clear dimming state

### Keys & Naming
- All 12 keys, transposing everything in real time
- Three name formats: **English** (C, Am, F#), **Solfège** (Do, Ré, Mi), **Nashville** (1, 6m, 4)

### Instrument Diagrams
- **Piano** — highlighted chord tones and scale tones; clickable in the detail panel
- **Guitar** — fretboard diagram with standard voicings
- **Ukulele** — fretboard diagram (GCEA tuning)
- Two view modes: **Name** (chord labels) or **Diagram** (inline instrument diagram on each tile)

### Detail Panel
- Tap the info strip at the bottom of any tile
- Shows piano + fretboard diagram, intervals, note names
- Click individual piano keys or fretboard dots to hear single notes

### Audio
- Web Audio API synthesis (triangle + sine oscillators)
- Click any tile to play the chord with arpeggiated attack
- Sound toggle in the top bar

### Progression Builder
- Click tiles to queue a progression
- Play, undo, or clear the sequence
- Export as text string (e.g. `Am – F – C – G`)
- Playback at 72 BPM, 2 beats per chord

### Structures (Presets)
Highlights relevant tiles and lets you hear the pattern:
- **Pop** — I–V–vi–IV
- **Jazz ii–V–I** — ii–V–I
- **Emotional** — vi–IV–I–V
- **12-Bar Blues** — full 12-bar cycle

### Theme
- Dark and light modes, toggled from the top bar
- Updates the PWA theme colour dynamically

---

## Setup

No build step required. Serve the folder from any static HTTP server.

```bash
# Python
python3 -m http.server 8080

# Node
npx serve .
```

> **Note:** ES modules require HTTP — `file://` won't work.

---

## Installing as a PWA

### iOS (Safari)
1. Open the URL in Safari → Share → **Add to Home Screen**

### Android (Chrome)
1. Open the URL in Chrome → three-dot menu → **Add to Home Screen**

Once installed, the app opens full-screen with no browser chrome.

---

## File Structure

```
chord-board/
├── index.html              # App shell and markup
├── app.js                  # State, init, mode switcher
├── style.css               # All styles and themes
├── manifest.json           # PWA manifest
├── icon-192.png / icon-512.png
├── data/
│   ├── theory.js           # Notes, scales, intervals, chord formatting, structures
│   ├── modes.js            # Mode registry — add new modes here
│   └── instruments.js      # Guitar and ukulele voicings for all 12 keys
├── ui/
│   ├── board.js            # Mode-aware tile rendering and detail panel
│   ├── controls.js         # Key row, settings drawer, all toggles
│   ├── diagrams.js         # Piano and fretboard SVG renderers
│   ├── arrows.js           # Mode-aware SVG flow arrows
│   └── progression.js      # Progression tray and playback
└── audio/
    └── player.js           # Web Audio oscillator engine
```

---

## Adding a New Mode

1. Open `data/modes.js`
2. Define your chord arrays with the standard schema (`id`, `deg`, `semi` or `semiOffset`, `int`, `quality`, `qLabel`, `nash`)
3. Create a mode object with `id`, `label`, `icon` (Lucide icon name), `scale`, `rows[]`, `isDimmed()`, `arrows[]`
4. Push it to `MODES[]`

The board, arrows, dimming, and mode switcher tab all update automatically.

---

## Roadmap

### Phase 3
- Complete guitar and ukulele voicings with barre chord alternates
- More modes (e.g. Pentatonic, Modal — Dorian, Phrygian)
- Circle of fifths colour scheme option
- Service Worker for full offline support

### Phase 4
- **Tone.js audio** with [Salamander Grand Piano](https://github.com/sfztools/salamander-grand-piano) samples via `Tone.Sampler`
  - The sampler loads individual note samples and pitch-shifts between them for a realistic piano sound
  - The existing Web Audio oscillator engine stays as the fallback option (no internet / fast load)
  - Toggle between "Synth" and "Piano" audio modes in the settings drawer
- URL-shareable progressions (`?prog=Am-F-C-G&key=A`)

---

## Credits

Chord theory and board layout inspired by [Chord Files](https://www.chordfiles.com) by Jaka Zaletelj.

Built with vanilla JS ES modules, [Lucide Icons](https://lucide.dev), and Web Audio API.
