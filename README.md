# Chord Board

A chord progression map for musicians — inspired by [Chord Files](https://www.chordfiles.com) by Jaka Zaletelj.

Visualises diatonic chords, secondary dominants, modal interchange, and dark harmony side by side, with piano/guitar/ukulele diagrams, interactive audio, a progression builder, and chord inversions/variations in the detail panel.

Designed as a Progressive Web App: installable on iOS and Android, no build step required.

---

## Modes

### Progressions
Major key harmony. Three rows:
- **Secondary Dominants** (top) — V7 of each diatonic chord, resolves down to its target
- **Main Chords** (middle) — the seven diatonic chords, mix freely; I/IV/V gate access to the bottom row
- **Modal Interchange** (bottom) — borrowed from the parallel minor: ♭III Maj7, ♭VI Maj7, iv m7, ♭VII 7, ii° m7♭5

### Dark Harmony
Harmonic minor harmony. Three rows:
- **Sec. Dim. V + Neapolitan** (top) — four fully-diminished °7 chords (enharmonic inversions) plus the Neapolitan ♭II Maj7, all resolving down to V
- **Main Chords** (middle) — i, ♭III Maj7, iv, ♭VI, V7, #vii°7, ii°; mix freely
- **Sec. Dim. iv · ♭VI** (bottom) — four °7 chords resolving up to iv or ♭VI

**Path rules per mode**: after clicking any chord, unreachable next-chords are dimmed according to that mode's resolution rules. Reset with the ↺ button.

---

## Features

### Board
- Mode-aware layout — each mode defines its own rows, chord data, dimming rules, and arrows
- **Path dimming** — unreachable chords grey out after each selection
- **SVG arrows** showing resolution paths between rows
- **Structure presets** — Pop, Jazz ii–V–I, Emotional, 12-Bar Blues: highlights relevant tiles
- **Reset path** button (↺) in the top bar

### Key & Name
- All 12 keys, full real-time transposition
- Three formats: **English** (C, Am, F#) · **Solfège** (Do, Ré, Mi) · **Nashville** (1, 6m, 4)

### View modes
- **Chords** — chord name on every tile
- **Diagrams** — inline instrument diagram on every tile
- Toggle always visible in the top bar

### Colour modes
- **Default** — blue/teal/amber row accent colours
- **By quality** — chord name and tile border coloured by chord quality:
  - Pink = major · Light blue = minor · Yellow = dominant 7th
  - Purple = diminished · Green = augmented · Teal = suspended

### Instrument diagrams
- **Piano** — chord tones and scale tones highlighted; 2-octave view in detail panel; keys are clickable to hear individual notes
- **Guitar** — standard open voicings
- **Ukulele** — GCEA standard tuning

### Detail panel
Tap the ⓘ strip at the bottom of any tile:
- **2-octave piano** with clickable keys
- **Fretboard** diagram (when guitar/ukulele is active) with clickable dots
- **Inversion tabs** — Root, 1st inv, 2nd inv, 3rd inv; each updates the piano and plays the voicing
- **Variations** grouped by type (Extensions, Suspensions, Alterations, Simplify, Related) — click any to hear it and update the keyboard
- Intervals and note names

### Progression builder
- Click tiles to queue a sequence
- ▶ Play at 72 BPM · ↩ Undo · ✕ Clear
- Export as text (e.g. `Am – F – C – G`)
- Click any queued step to replay it

### Audio
- Web Audio API: triangle + sine oscillators with arpeggiated attack
- Sound toggle in the top bar

### App
- Progressive Web App — installable on iOS/Android, full-screen, no browser chrome
- SVG favicon + ICO fallback
- Dark / light theme toggle
- Responsive layout with safe-area insets

---

## Setup

No build step, no dependencies to install. Just serve the folder:

```bash
# Python
python3 -m http.server 8080

# Node
npx serve .
```

> ES modules require HTTP — opening `index.html` directly via `file://` will not work.

---

## Installing as a PWA

**iOS (Safari):** Open URL → Share → Add to Home Screen

**Android (Chrome):** Open URL → ⋮ menu → Add to Home Screen (or Install app)

---

## File structure

```
chord-board/
├── index.html              # App shell — all markup
├── app.js                  # Global state, init, mode switcher
├── style.css               # All styles, both themes, quality colours
├── manifest.json           # PWA manifest
├── favicon.svg             # SVG favicon (all modern browsers)
├── favicon.ico             # ICO fallback (legacy)
├── icon-192.png            # PWA / Apple touch icon
├── icon-512.png            # PWA splash icon
├── data/
│   ├── theory.js           # Notes, scales, chord formatting, interval names, structures
│   ├── modes.js            # Mode registry — Progressions, Dark Harmony
│   ├── instruments.js      # Guitar + ukulele voicings for all 12 keys
│   └── voicings.js         # Inversion calculator + chord variation groups
├── ui/
│   ├── board.js            # Mode-aware tile and row rendering
│   ├── controls.js         # Key row, settings drawer, all toggles
│   ├── detail.js           # Detail panel: piano, inversions, variations
│   ├── diagrams.js         # Piano SVG + fretboard SVG renderers
│   ├── arrows.js           # Mode-aware SVG flow arrows overlay
│   └── progression.js      # Progression tray and playback
└── audio/
    └── player.js           # Web Audio oscillator engine
```

---

## Adding a new mode

1. Open `data/modes.js`
2. Define chord arrays using the schema: `{ id, deg, semi, int, quality, qLabel, nash, tonic? }`  
   For rows where root = semitone below a target, use `semiOffset` instead of `semi`
3. Create a mode object:
```js
{
  id: 'my_mode',
  label: 'My Mode',
  icon: 'lucide-icon-name',
  scale: 'major',           // key for scaleNotes() in theory.js
  rows: [ ...rowDefs ],     // each row: { id, tag, hint, loopLabel, canLoop, style, chords, rootCalc }
  isDimmed(chordId, rowId, lastSelected) { ... },
  arrows: [ ...arrowDefs ], // types: 'row-to-row-targeted', 'row-to-fixed-target', 'gateway-down'
}
```
4. Push to `MODES[]`

The board, arrows, dimming, mode switcher tab, and progression builder all update automatically.

---

## Phase 2 — what's still open

The following items were scoped for Phase 2 but not yet done:

- **Service Worker** — offline caching (currently the app requires a network connection on first load for fonts and Lucide)
- **Barre chord alternates** — guitar/ukulele voicings currently only show the `simple` voicing; the `barre` data exists in `instruments.js` but the detail panel doesn't expose a way to switch between them yet
- **Arrow labels** — the SVG arrows show direction but don't yet label *why* (e.g. "resolves to V")
- **Mood/Structure playback** — structure presets highlight tiles but don't have a dedicated Play button for the preset sequence

---

## Roadmap

### Phase 3
- Barre/alternate voicing switcher in the detail panel
- More modes: Dorian, Phrygian, Lydian, Pentatonic
- URL-shareable progressions (`?key=A&mode=dark&prog=Am-F-C-G`)
- Service Worker for full offline support

### Phase 4
- **Tone.js audio** with [Salamander Grand Piano](https://github.com/sfztools/salamander-grand-piano) samples via `Tone.Sampler`
  - Realistic piano sound using real note samples with pitch-shifting between them
  - Existing Web Audio oscillators stay as the "Synth" fallback (faster load, no network)
  - Toggle between "Synth" and "Piano" in the settings drawer
- Better guitar/ukulele audio (string-like synthesis or samples)

---

## Credits

Chord theory, board layout, and Dark Harmony design inspired by [Chord Files](https://www.chordfiles.com) by Jaka Zaletelj.

Built with vanilla JS ES modules · [Lucide Icons](https://lucide.dev) · Web Audio API · DM Sans + DM Mono (Google Fonts).
