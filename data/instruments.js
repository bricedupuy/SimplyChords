// ── instruments.js ────────────────────────────────────────────────────────────
// Fingering data for piano, guitar, ukulele

// ── Piano ─────────────────────────────────────────────────────────────────────
// Piano is computed dynamically from intervals — no static data needed.
// See diagrams.js for the renderer.

// ── Guitar voicings ───────────────────────────────────────────────────────────
// Format: { simple: [frets], barre: [frets] }
// frets array = 6 strings E A D G B e (low to high)
// -1 = muted string, 0 = open string
// barre: { fret, strings } optional

export const GUITAR_VOICINGS = {
  // Major chords
  'C':  { simple: [-1,3,2,0,1,0],      barre: [8,10,10,9,8,8]  },
  'C#': { simple: [-1,4,3,1,2,1],      barre: [9,11,11,10,9,9] },
  'D♭': { simple: [-1,4,3,1,2,1],      barre: [9,11,11,10,9,9] },
  'D':  { simple: [-1,-1,0,2,3,2],     barre: [10,12,12,11,10,10] },
  'D#': { simple: [-1,-1,1,3,4,3],     barre: [11,13,13,12,11,11] },
  'E♭': { simple: [-1,-1,1,3,4,3],     barre: [11,13,13,12,11,11] },
  'E':  { simple: [0,2,2,1,0,0],       barre: [12,14,14,13,12,12] },
  'F':  { simple: [1,3,3,2,1,1],       barre: [1,3,3,2,1,1] },
  'F#': { simple: [2,4,4,3,2,2],       barre: [2,4,4,3,2,2] },
  'G♭': { simple: [2,4,4,3,2,2],       barre: [2,4,4,3,2,2] },
  'G':  { simple: [3,2,0,0,0,3],       barre: [3,5,5,4,3,3] },
  'G#': { simple: [4,6,6,5,4,4],       barre: [4,6,6,5,4,4] },
  'A♭': { simple: [4,6,6,5,4,4],       barre: [4,6,6,5,4,4] },
  'A':  { simple: [-1,0,2,2,2,0],      barre: [5,7,7,6,5,5] },
  'A#': { simple: [-1,1,3,3,3,1],      barre: [6,8,8,7,6,6] },
  'B♭': { simple: [-1,1,3,3,3,1],      barre: [6,8,8,7,6,6] },
  'B':  { simple: [-1,2,4,4,4,2],      barre: [7,9,9,8,7,7] },

  // Minor chords (key: root + 'm')
  'Cm':  { simple: [-1,3,5,5,4,3],     barre: [8,10,10,9,8,8] },
  'C#m': { simple: [-1,4,6,6,5,4],     barre: [9,11,11,10,9,9] },
  'D♭m': { simple: [-1,4,6,6,5,4],     barre: [9,11,11,10,9,9] },
  'Dm':  { simple: [-1,-1,0,2,3,1],    barre: [10,12,12,11,10,10] },
  'D#m': { simple: [-1,-1,1,3,4,2],    barre: [11,13,13,12,11,11] },
  'E♭m': { simple: [-1,-1,1,3,4,2],    barre: [11,13,13,12,11,11] },
  'Em':  { simple: [0,2,2,0,0,0],      barre: [12,14,14,13,12,12] },
  'Fm':  { simple: [1,3,3,1,1,1],      barre: [1,3,3,1,1,1] },
  'F#m': { simple: [2,4,4,2,2,2],      barre: [2,4,4,2,2,2] },
  'G♭m': { simple: [2,4,4,2,2,2],      barre: [2,4,4,2,2,2] },
  'Gm':  { simple: [3,5,5,3,3,3],      barre: [3,5,5,3,3,3] },
  'G#m': { simple: [4,6,6,4,4,4],      barre: [4,6,6,4,4,4] },
  'A♭m': { simple: [4,6,6,4,4,4],      barre: [4,6,6,4,4,4] },
  'Am':  { simple: [-1,0,2,2,1,0],     barre: [5,7,7,5,5,5] },
  'A#m': { simple: [-1,1,3,3,2,1],     barre: [6,8,8,6,6,6] },
  'B♭m': { simple: [-1,1,3,3,2,1],     barre: [6,8,8,6,6,6] },
  'Bm':  { simple: [-1,2,4,4,3,2],     barre: [7,9,9,7,7,7] },

  // Dominant 7th
  'C7':  { simple: [-1,3,2,3,1,0],     barre: [8,10,8,9,8,8] },
  'D7':  { simple: [-1,-1,0,2,1,2],    barre: [10,12,10,11,10,10] },
  'E7':  { simple: [0,2,0,1,0,0],      barre: [12,14,12,13,12,12] },
  'F7':  { simple: [1,3,1,2,1,1],      barre: [1,3,1,2,1,1] },
  'G7':  { simple: [3,2,0,0,0,1],      barre: [3,5,3,4,3,3] },
  'A7':  { simple: [-1,0,2,0,2,0],     barre: [5,7,5,6,5,5] },
  'B7':  { simple: [-1,2,1,2,0,2],     barre: [7,9,7,8,7,7] },
  'G#7': { simple: [4,6,4,5,4,4],      barre: [4,6,4,5,4,4] },
  'A♭7': { simple: [4,6,4,5,4,4],      barre: [4,6,4,5,4,4] },
  'A#7': { simple: [-1,1,3,1,3,1],     barre: [6,8,6,7,6,6] },
  'B♭7': { simple: [-1,1,3,1,3,1],     barre: [6,8,6,7,6,6] },
  'C#7': { simple: [-1,4,3,4,2,2],     barre: [9,11,9,10,9,9] },
  'D♭7': { simple: [-1,4,3,4,2,2],     barre: [9,11,9,10,9,9] },
  'D#7': { simple: [-1,-1,1,3,2,3],    barre: [11,13,11,12,11,11] },
  'E♭7': { simple: [-1,-1,1,3,2,3],    barre: [11,13,11,12,11,11] },
  'F#7': { simple: [2,4,2,3,2,2],      barre: [2,4,2,3,2,2] },
  'G♭7': { simple: [2,4,2,3,2,2],      barre: [2,4,2,3,2,2] },

  // Maj7
  'CM7':  { simple: [-1,3,2,0,0,0],    barre: [8,10,9,9,8,8] },
  'DM7':  { simple: [-1,-1,0,2,2,2],   barre: [10,12,11,11,10,10] },
  'EM7':  { simple: [0,2,1,1,0,0],     barre: [12,14,13,13,12,12] },
  'FM7':  { simple: [1,3,2,2,1,0],     barre: [1,3,2,2,1,1] },
  'GM7':  { simple: [3,2,0,0,0,2],     barre: [3,5,4,4,3,3] },
  'AM7':  { simple: [-1,0,2,1,2,0],    barre: [5,7,6,6,5,5] },
  'BM7':  { simple: [-1,2,4,3,4,2],    barre: [7,9,8,8,7,7] },
  'G#M7': { simple: [4,6,5,5,4,4],     barre: [4,6,5,5,4,4] },
  'A♭M7': { simple: [4,6,5,5,4,4],     barre: [4,6,5,5,4,4] },
  'A#M7': { simple: [-1,1,3,2,3,1],    barre: [6,8,7,7,6,6] },
  'B♭M7': { simple: [-1,1,3,2,3,1],    barre: [6,8,7,7,6,6] },
  'C#M7': { simple: [-1,4,3,1,1,1],    barre: [9,11,10,10,9,9] },
  'D♭M7': { simple: [-1,4,3,1,1,1],    barre: [9,11,10,10,9,9] },
  'D#M7': { simple: [-1,-1,1,3,3,3],   barre: [11,13,12,12,11,11] },
  'E♭M7': { simple: [-1,-1,1,3,3,3],   barre: [11,13,12,12,11,11] },
  'F#M7': { simple: [2,4,3,3,2,2],     barre: [2,4,3,3,2,2] },
  'G♭M7': { simple: [2,4,3,3,2,2],     barre: [2,4,3,3,2,2] },

  // Minor 7th
  'Cm7':  { simple: [-1,3,5,3,4,3],    barre: [8,10,8,9,8,8] },
  'Dm7':  { simple: [-1,-1,0,2,1,1],   barre: [10,12,10,11,10,10] },
  'Em7':  { simple: [0,2,0,0,0,0],     barre: [12,14,12,13,12,12] },
  'Fm7':  { simple: [1,3,1,1,1,1],     barre: [1,3,1,1,1,1] },
  'Gm7':  { simple: [3,5,3,3,3,3],     barre: [3,5,3,3,3,3] },
  'Am7':  { simple: [-1,0,2,0,1,0],    barre: [5,7,5,5,5,5] },
  'Bm7':  { simple: [-1,2,4,2,3,2],    barre: [7,9,7,7,7,7] },

  // Diminished
  'C°':  { simple: [-1,3,4,5,4,-1],    barre: null },
  'D°':  { simple: [-1,-1,0,1,0,1],    barre: null },
  'E°':  { simple: [0,-1,2,3,2,-1],    barre: null },
  'F°':  { simple: [1,-1,3,4,3,-1],    barre: null },
  'G°':  { simple: [3,-1,4,5,4,-1],    barre: null },
  'A°':  { simple: [-1,0,1,2,1,-1],    barre: null },
  'B°':  { simple: [-1,2,3,4,3,-1],    barre: null },
  'C#°': { simple: [-1,4,5,6,5,-1],    barre: null },
  'D♭°': { simple: [-1,4,5,6,5,-1],    barre: null },
  'D#°': { simple: [-1,-1,1,2,1,2],    barre: null },
  'E♭°': { simple: [-1,-1,1,2,1,2],    barre: null },
  'F#°': { simple: [2,-1,4,5,4,-1],    barre: null },
  'G♭°': { simple: [2,-1,4,5,4,-1],    barre: null },
  'G#°': { simple: [4,-1,5,6,5,-1],    barre: null },
  'A♭°': { simple: [4,-1,5,6,5,-1],    barre: null },
  'A#°': { simple: [-1,1,2,3,2,-1],    barre: null },
  'B♭°': { simple: [-1,1,2,3,2,-1],    barre: null },
};

// ── Ukulele voicings (GCEA tuning) ────────────────────────────────────────────
// frets array = 4 strings G C E A (low to high)
export const UKULELE_VOICINGS = {
  'C':   { simple: [0,0,0,3],   barre: [0,0,0,3] },
  'C#':  { simple: [1,1,1,4],   barre: [1,1,1,4] },
  'D♭':  { simple: [1,1,1,4],   barre: [1,1,1,4] },
  'D':   { simple: [2,2,2,0],   barre: [2,2,2,5] },
  'D#':  { simple: [3,3,3,1],   barre: [3,3,3,1] },
  'E♭':  { simple: [3,3,3,1],   barre: [3,3,3,1] },
  'E':   { simple: [4,4,4,2],   barre: [4,4,4,2] },
  'F':   { simple: [2,0,1,0],   barre: [2,0,1,0] },
  'F#':  { simple: [3,1,2,1],   barre: [3,1,2,1] },
  'G♭':  { simple: [3,1,2,1],   barre: [3,1,2,1] },
  'G':   { simple: [0,2,3,2],   barre: [0,2,3,2] },
  'G#':  { simple: [5,3,4,3],   barre: [5,3,4,3] },
  'A♭':  { simple: [5,3,4,3],   barre: [5,3,4,3] },
  'A':   { simple: [2,1,0,0],   barre: [2,1,0,0] },
  'A#':  { simple: [3,2,1,1],   barre: [3,2,1,1] },
  'B♭':  { simple: [3,2,1,1],   barre: [3,2,1,1] },
  'B':   { simple: [4,3,2,2],   barre: [4,3,2,2] },

  'Cm':  { simple: [0,3,3,3],   barre: [0,3,3,3] },
  'C#m': { simple: [1,4,4,4],   barre: [1,4,4,4] },
  'D♭m': { simple: [1,4,4,4],   barre: [1,4,4,4] },
  'Dm':  { simple: [2,2,1,0],   barre: [2,2,1,0] },
  'D#m': { simple: [3,3,2,1],   barre: [3,3,2,1] },
  'E♭m': { simple: [3,3,2,1],   barre: [3,3,2,1] },
  'Em':  { simple: [4,4,3,2],   barre: [4,4,3,2] },
  'Fm':  { simple: [1,0,1,3],   barre: [1,0,1,3] },
  'F#m': { simple: [2,1,2,0],   barre: [2,1,2,0] },
  'G♭m': { simple: [2,1,2,0],   barre: [2,1,2,0] },
  'Gm':  { simple: [0,2,3,1],   barre: [0,2,3,1] },
  'G#m': { simple: [4,3,4,2],   barre: [4,3,4,2] },
  'A♭m': { simple: [4,3,4,2],   barre: [4,3,4,2] },
  'Am':  { simple: [2,0,0,0],   barre: [2,0,0,0] },
  'A#m': { simple: [3,1,1,1],   barre: [3,1,1,1] },
  'B♭m': { simple: [3,1,1,1],   barre: [3,1,1,1] },
  'Bm':  { simple: [4,2,2,2],   barre: [4,2,2,2] },

  'C7':  { simple: [0,0,0,1],   barre: [0,0,0,1] },
  'D7':  { simple: [2,2,2,3],   barre: [2,2,2,3] },
  'E7':  { simple: [1,2,0,2],   barre: [1,2,0,2] },
  'F7':  { simple: [2,3,1,0],   barre: [2,3,1,0] },
  'G7':  { simple: [0,2,1,2],   barre: [0,2,1,2] },
  'A7':  { simple: [0,1,0,0],   barre: [0,1,0,0] },
  'B7':  { simple: [2,3,2,2],   barre: [2,3,2,2] },
  'C#7': { simple: [1,1,1,2],   barre: [1,1,1,2] },
  'D♭7': { simple: [1,1,1,2],   barre: [1,1,1,2] },
  'D#7': { simple: [3,3,3,4],   barre: [3,3,3,4] },
  'E♭7': { simple: [3,3,3,4],   barre: [3,3,3,4] },
  'F#7': { simple: [3,4,2,1],   barre: [3,4,2,1] },
  'G♭7': { simple: [3,4,2,1],   barre: [3,4,2,1] },
  'G#7': { simple: [4,3,4,4],   barre: [4,3,4,4] },
  'A♭7': { simple: [4,3,4,4],   barre: [4,3,4,4] },
  'A#7': { simple: [1,2,1,1],   barre: [1,2,1,1] },
  'B♭7': { simple: [1,2,1,1],   barre: [1,2,1,1] },

  'CM7': { simple: [0,0,0,2],   barre: [0,0,0,2] },
  'FM7': { simple: [2,4,1,0],   barre: [2,4,1,0] },
  'GM7': { simple: [0,2,2,2],   barre: [0,2,2,2] },
  'AM7': { simple: [1,1,0,0],   barre: [1,1,0,0] },
  'DM7': { simple: [2,2,2,4],   barre: [2,2,2,4] },
  'EM7': { simple: [1,3,0,2],   barre: [1,3,0,2] },
  'BM7': { simple: [3,3,2,2],   barre: [3,3,2,2] },

  'Dm7': { simple: [2,2,1,3],   barre: [2,2,1,3] },
  'Em7': { simple: [0,2,0,2],   barre: [0,2,0,2] },
  'Am7': { simple: [0,0,0,0],   barre: [0,0,0,0] },
  'Bm7': { simple: [2,2,2,2],   barre: [2,2,2,2] },
  'Cm7': { simple: [3,3,3,3],   barre: [3,3,3,3] },
  'Gm7': { simple: [0,2,1,1],   barre: [0,2,1,1] },
  'Fm7': { simple: [1,3,1,3],   barre: [1,3,1,3] },

  'C°':  { simple: [2,3,2,3],   barre: null },
  'D°':  { simple: [1,2,1,2],   barre: null },
  'E°':  { simple: [0,1,0,1],   barre: null },
  'A°':  { simple: [2,3,2,3],   barre: null },
  'B°':  { simple: [3,4,3,4],   barre: null },
};

// ── Instrument specs ──────────────────────────────────────────────────────────
export const INSTRUMENTS = {
  piano: {
    id: 'piano',
    label: 'Piano',
    icon: '🎹',
  },
  guitar: {
    id: 'guitar',
    label: 'Guitar',
    icon: '🎸',
    strings: 6,
    tuning: ['E2','A2','D3','G3','B3','E4'], // low to high
    tuningMidi: [40, 45, 50, 55, 59, 64],
  },
  ukulele: {
    id: 'ukulele',
    label: 'Ukulele',
    icon: '🪕',
    strings: 4,
    tuning: ['G4','C4','E4','A4'],
    tuningMidi: [67, 60, 64, 69],
  },
};

// ── Chord key lookup for voicing data ─────────────────────────────────────────
// Given root name + quality, returns the key used in GUITAR_VOICINGS / UKULELE_VOICINGS
export function voicingKey(rootName, quality) {
  const suffixes = {
    major: '',
    minor: 'm',
    dom7:  '7',
    maj7:  'M7',
    min7:  'm7',
    dim:   '°',
    halfdim: 'm7♭5',
    aug:   '+',
  };
  return rootName + (suffixes[quality] ?? '');
}
