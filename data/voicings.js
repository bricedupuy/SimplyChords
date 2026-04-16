// ── data/voicings.js ──────────────────────────────────────────────────────────
// Computes inversions and chord variations for a given root + quality.

// ── Inversions ────────────────────────────────────────────────────────────────
// Given a set of intervals (e.g. [0,4,7,11]), produce all inversions.
// Each inversion raises the lowest note by an octave.
// intervals: sorted array of semitone offsets from root (in root position)
// Returns array of { label, intervals, bassInterval }

export function getInversions(intervals) {
  // Sort the base intervals ascending (root position)
  const sorted = [...intervals].sort((a, b) => a - b);
  const labels = ['Root', '1st inv', '2nd inv', '3rd inv', '4th inv'];

  return sorted.map((bassIv, invIdx) => {
    // An inversion keeps the SAME notes, just puts a different one in the bass.
    // All intervals are still measured from the original root.
    // Notes below the bass note get raised by an octave (+12).
    const voicing = sorted.map(iv => iv < bassIv ? iv + 12 : iv);
    // Sort so the bass is first
    voicing.sort((a, b) => a - b);

    return {
      label:      labels[invIdx] || `Inv ${invIdx}`,
      intervals:  voicing,   // still relative to original root
      bassNote:   bassIv,    // which interval is now in the bass
    };
  });
}

// ── Chord variations ──────────────────────────────────────────────────────────
// Returns groups of related chord voicings for a given base quality.
// Each variation: { label, intervals, quality, qLabel }

const VARIATION_MAP = {
  // Major triad → extensions, suspensions, colour tones
  major: [
    {
      group: 'Extensions',
      items: [
        { label: 'maj7',  intervals: [0,4,7,11],  quality: 'maj7',   qLabel: 'Maj7' },
        { label: 'maj9',  intervals: [0,4,7,11,14], quality: 'maj9', qLabel: 'Maj9' },
        { label: 'add9',  intervals: [0,4,7,14],   quality: 'add9',  qLabel: 'add9' },
        { label: '6th',   intervals: [0,4,7,9],    quality: 'maj6',  qLabel: '6'    },
        { label: '6/9',   intervals: [0,4,7,9,14], quality: 'maj69', qLabel: '6/9'  },
      ],
    },
    {
      group: 'Suspensions',
      items: [
        { label: 'sus2',  intervals: [0,2,7],      quality: 'sus2',  qLabel: 'sus2' },
        { label: 'sus4',  intervals: [0,5,7],      quality: 'sus4',  qLabel: 'sus4' },
        { label: '7sus4', intervals: [0,5,7,10],   quality: '7sus4', qLabel: '7sus4'},
      ],
    },
    {
      group: 'Alterations',
      items: [
        { label: 'aug',   intervals: [0,4,8],      quality: 'aug',   qLabel: '+'    },
        { label: 'dom7',  intervals: [0,4,7,10],   quality: 'dom7',  qLabel: '7'    },
        { label: '7♭9',   intervals: [0,4,7,10,13],quality: '7b9',   qLabel: '7♭9'  },
        { label: '7#9',   intervals: [0,4,7,10,15],quality: '7s9',   qLabel: '7#9'  },
      ],
    },
  ],

  // Minor triad
  minor: [
    {
      group: 'Extensions',
      items: [
        { label: 'm7',    intervals: [0,3,7,10],   quality: 'min7',  qLabel: 'm7'   },
        { label: 'm9',    intervals: [0,3,7,10,14],quality: 'min9',  qLabel: 'm9'   },
        { label: 'madd9', intervals: [0,3,7,14],   quality: 'madd9', qLabel: 'madd9'},
        { label: 'm6',    intervals: [0,3,7,9],    quality: 'min6',  qLabel: 'm6'   },
        { label: 'mMaj7', intervals: [0,3,7,11],   quality: 'minmaj7',qLabel:'mMaj7'},
      ],
    },
    {
      group: 'Suspensions',
      items: [
        { label: 'sus2',  intervals: [0,2,7],      quality: 'sus2',  qLabel: 'sus2' },
        { label: 'sus4',  intervals: [0,5,7],      quality: 'sus4',  qLabel: 'sus4' },
      ],
    },
    {
      group: 'Alterations',
      items: [
        { label: 'dim',   intervals: [0,3,6],      quality: 'dim',   qLabel: '°'    },
        { label: 'm7♭5',  intervals: [0,3,6,10],   quality: 'halfdim',qLabel:'m7♭5' },
      ],
    },
  ],

  // Dominant 7th
  dom7: [
    {
      group: 'Extensions',
      items: [
        { label: '9th',   intervals: [0,4,7,10,14],quality: 'dom9',  qLabel: '9'    },
        { label: '13th',  intervals: [0,4,7,10,21],quality: 'dom13', qLabel: '13'   },
        { label: '7sus4', intervals: [0,5,7,10],   quality: '7sus4', qLabel: '7sus4'},
      ],
    },
    {
      group: 'Alterations',
      items: [
        { label: '7♭9',   intervals: [0,4,7,10,13],quality: '7b9',   qLabel: '7♭9'  },
        { label: '7#9',   intervals: [0,4,7,10,15],quality: '7s9',   qLabel: '7#9'  },
        { label: '7♭5',   intervals: [0,4,6,10],   quality: '7b5',   qLabel: '7♭5'  },
        { label: '7#5',   intervals: [0,4,8,10],   quality: '7s5',   qLabel: '7#5'  },
        { label: 'maj7',  intervals: [0,4,7,11],   quality: 'maj7',  qLabel: 'Maj7' },
      ],
    },
  ],

  // Major 7th
  maj7: [
    {
      group: 'Extensions',
      items: [
        { label: 'maj9',  intervals: [0,4,7,11,14],quality: 'maj9',  qLabel: 'Maj9' },
        { label: 'maj13', intervals: [0,4,7,11,21],quality: 'maj13', qLabel: 'Maj13'},
        { label: '6/9',   intervals: [0,4,7,9,14], quality: 'maj69', qLabel: '6/9'  },
      ],
    },
    {
      group: 'Simplify',
      items: [
        { label: 'triad', intervals: [0,4,7],       quality: 'major', qLabel: ''     },
        { label: 'add9',  intervals: [0,4,7,14],    quality: 'add9',  qLabel: 'add9' },
        { label: '6th',   intervals: [0,4,7,9],     quality: 'maj6',  qLabel: '6'    },
      ],
    },
  ],

  // Minor 7th
  min7: [
    {
      group: 'Extensions',
      items: [
        { label: 'm9',    intervals: [0,3,7,10,14],quality: 'min9',  qLabel: 'm9'   },
        { label: 'm11',   intervals: [0,3,7,10,17],quality: 'min11', qLabel: 'm11'  },
      ],
    },
    {
      group: 'Simplify',
      items: [
        { label: 'triad', intervals: [0,3,7],       quality: 'minor', qLabel: 'm'   },
        { label: 'madd9', intervals: [0,3,7,14],    quality: 'madd9', qLabel: 'madd9'},
        { label: 'm6',    intervals: [0,3,7,9],     quality: 'min6',  qLabel: 'm6'  },
      ],
    },
  ],

  // Diminished
  dim: [
    {
      group: 'Extensions',
      items: [
        { label: 'dim7',  intervals: [0,3,6,9],     quality: 'dim7',  qLabel: '°7'   },
        { label: 'm7♭5',  intervals: [0,3,6,10],    quality: 'halfdim',qLabel:'m7♭5' },
      ],
    },
  ],

  // Half-diminished
  halfdim: [
    {
      group: 'Related',
      items: [
        { label: 'dim7',  intervals: [0,3,6,9],     quality: 'dim7',  qLabel: '°7'   },
        { label: 'm7',    intervals: [0,3,7,10],    quality: 'min7',  qLabel: 'm7'   },
        { label: 'dim',   intervals: [0,3,6],       quality: 'dim',   qLabel: '°'    },
      ],
    },
  ],

  // Fully diminished 7th
  dim7: [
    {
      group: 'Related',
      items: [
        { label: 'dim',   intervals: [0,3,6],       quality: 'dim',   qLabel: '°'    },
        { label: 'm7♭5',  intervals: [0,3,6,10],    quality: 'halfdim',qLabel:'m7♭5' },
        { label: 'aug',   intervals: [0,4,8],       quality: 'aug',   qLabel: '+'    },
      ],
    },
  ],

  // Augmented
  aug: [
    {
      group: 'Related',
      items: [
        { label: 'aug7',  intervals: [0,4,8,10],    quality: 'aug7',  qLabel: '7+'   },
        { label: 'major', intervals: [0,4,7],       quality: 'major', qLabel: ''     },
        { label: 'maj7',  intervals: [0,4,7,11],    quality: 'maj7',  qLabel: 'Maj7' },
      ],
    },
  ],
};

export function getVariations(quality) {
  return VARIATION_MAP[quality] || [];
}
