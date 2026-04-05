// ── data/modes.js ─────────────────────────────────────────────────────────────
// Mode registry. Each mode defines its own rows, path rules, and arrow config.
// To add a new mode: create a mode object and push it to MODES[].

import { CHROMATIC, DIATONIC, SECONDARY, MODAL } from './theory.js';

// ── PROGRESSIONS mode ─────────────────────────────────────────────────────────
export const MODE_PROGRESSIONS = {
  id:    'progressions',
  label: 'Progressions',
  icon:  'music',
  scale: 'major',
  rows: [
    {
      id: 'secondary', tag: 'Secondary Dominants', hint: 'V7 — resolves down',
      loopLabel: '↓ only', canLoop: false, style: 'secondary',
      chords:   SECONDARY,
      rootCalc: (cd, ti) => (ti + cd.resolveSemi + 7) % 12,
    },
    {
      id: 'main', tag: 'Main Chords', hint: 'Mix freely',
      loopLabel: '⟳ free', canLoop: true, style: 'main',
      chords:   DIATONIC,
      rootCalc: (cd, ti) => (ti + cd.semi) % 12,
    },
    {
      id: 'modal', tag: 'Modal Interchange', hint: 'Parallel minor — via I, IV, V',
      loopLabel: '↕ I/IV/V', canLoop: false, style: 'modal',
      chords:   MODAL,
      rootCalc: (cd, ti) => (ti + cd.semi) % 12,
    },
  ],
  isDimmed(chordId, rowId, lastSelected) {
    if (!lastSelected) return false;
    const { id: lastId, row: lastRow } = lastSelected;
    const GATEWAY = new Set(['I', 'IV', 'V']);
    if (lastRow === 'secondary') {
      const sec = SECONDARY.find(s => s.id === lastId);
      if (!sec) return false;
      if (rowId === 'main')      return chordId !== sec.targetId;
      if (rowId === 'secondary') return true;
      if (rowId === 'modal')     return true;
    }
    if (lastRow === 'main') {
      if (rowId === 'modal') return !GATEWAY.has(lastId);
      return false;
    }
    if (lastRow === 'modal') {
      if (rowId === 'main')      return !GATEWAY.has(chordId);
      if (rowId === 'secondary') return true;
      if (rowId === 'modal')     return false;
    }
    return false;
  },
  arrows: [
    { type: 'row-to-row-targeted', fromRow: 'secondary', toRow: 'main', style: 'teal' },
    { type: 'gateway-down', fromRow: 'main', toRow: 'modal', gatewayIds: ['I','IV','V'], style: 'amber' },
  ],
};

// ── DARK HARMONY mode ─────────────────────────────────────────────────────────
// Based on the harmonic minor scale.
// Key of A reference: Am(i), C Maj7(♭III), Dm(iv), F Maj(♭VI), E7(V), G#°(#vii°), B°(ii°)
//
// Row layout (top to bottom):
//   [TOP]    Secondary Diminished V  +  Neapolitan (♭II Maj7) — both resolve to V
//   [MAIN]   Main chords — mix freely
//   [BOTTOM] Secondary Diminished iv, ♭VI — resolve up to iv or ♭VI
//
// Secondary diminished chords are fully-diminished 7ths rooted a semitone below their target.
// The 4 top sec.dim chords are the 4 inversions/enharmonic spellings resolving to V:
//   In A: D# (→E), F# (→G#... but here all → V=E), A (→Bb=Neap), C (→C#... all → V)
// Per the PDF they all lead to V. Roots = targetSemi(V) - 1 minus 0,3,6,9 (dim7 symmetry).

// Helper: dim7 has interval symmetry — 4 inversions, each 3 semitones apart
// For top row, all 4 dim7 chords resolve to V (semi=7). Their roots are 7-1=6, 6-3=3, 3-3=0, 0-3=9 → 6,3,0,9
// In A: 6=F#, 3=C#... wait let me use the PDF literally:
// PDF shows in key A: D#/Eb°, F#/Gb°, A°, C° → all resolve to E (V)
// semitones from A: D#=6, F#=9(enharmon Gb), A=0(dim of A), C=3
// So roots are: 6 (D#), 9 (F#), 0 (A), 3 (C) — these are tonic+6, +9, +0, +3

const DH_MAIN = [
  { id:'dh-i',      deg:'i',     semi:0,  int:[0,3,7],     quality:'minor',  qLabel:'m',    nash:'1m',  tonic:true  },
  { id:'dh-bIII',   deg:'♭III',  semi:3,  int:[0,4,7,11],  quality:'maj7',   qLabel:'Maj7', nash:'♭3',  tonic:false },
  { id:'dh-iv',     deg:'iv',    semi:5,  int:[0,3,7],     quality:'minor',  qLabel:'m',    nash:'4m',  tonic:false },
  { id:'dh-bVI',    deg:'♭VI',   semi:8,  int:[0,4,7],     quality:'major',  qLabel:'M',    nash:'♭6',  tonic:false },
  { id:'dh-V',      deg:'V',     semi:7,  int:[0,4,7,10],  quality:'dom7',   qLabel:'7',    nash:'5',   tonic:false },
  { id:'dh-viidim', deg:'#vii°', semi:11, int:[0,3,6,9],   quality:'dim7',   qLabel:'°7',   nash:'7°',  tonic:false },
  { id:'dh-iidim',  deg:'ii°',   semi:2,  int:[0,3,6],     quality:'dim',    qLabel:'°',    nash:'2°',  tonic:false },
];

// Top row: 4 secondary diminished chords all resolving to V, + Neapolitan (♭II Maj7)
// Dim7 roots relative to tonic: +6, +9, +0, +3 (enharmonic spellings of the same chord)
// They all resolve to V (semi=7), so resolveId = 'dh-V' for all
const DH_SECDIM_V = [
  { id:'dh-sv-1', deg:'°7', semiOffset:6,  resolveId:'dh-V', int:[0,3,6,9], quality:'dim7', qLabel:'°7', nash:'vii°7/V' },
  { id:'dh-sv-2', deg:'°7', semiOffset:9,  resolveId:'dh-V', int:[0,3,6,9], quality:'dim7', qLabel:'°7', nash:'vii°7/V' },
  { id:'dh-sv-3', deg:'°7', semiOffset:0,  resolveId:'dh-V', int:[0,3,6,9], quality:'dim7', qLabel:'°7', nash:'vii°7/V' },
  { id:'dh-sv-4', deg:'°7', semiOffset:3,  resolveId:'dh-V', int:[0,3,6,9], quality:'dim7', qLabel:'°7', nash:'vii°7/V' },
  // Neapolitan: ♭II Maj7 — also resolves to V, placed at end of this row
  { id:'dh-neap', deg:'♭II', semiOffset:1, resolveId:'dh-V', int:[0,4,7,11], quality:'maj7', qLabel:'Maj7', nash:'♭2', isNeapolitan:true },
];

// Bottom row: 4 secondary diminished chords resolving to iv or ♭VI
// PDF in key A: G°, A#°, C#°, E° → all lead up to Dm(iv) or FM(♭VI)
// Relative to tonic A: G=10, A#=1(Bb), C#=4, E=7... but wait that's V
// Let me re-read: PDF shows G dim, Ab/A# dim, Cb/C# dim, E dim
// These are semitone below iv(D=5→root=4=C#), semitone below ♭VI(F=8→root=7... E)
// Actually from symmetry: same dim7 chord, 4 spellings, target is iv AND ♭VI
// roots in A: G(10), A#(1), C#(4), E(7) — these are ti+10, +1, +4, +7
const DH_SECDIM_BOT = [
  { id:'dh-sb-1', deg:'°7', semiOffset:10, resolveId:'dh-iv',  int:[0,3,6,9], quality:'dim7', qLabel:'°7', nash:'vii°7/iv'  },
  { id:'dh-sb-2', deg:'°7', semiOffset:1,  resolveId:'dh-bVI', int:[0,3,6,9], quality:'dim7', qLabel:'°7', nash:'vii°7/♭VI' },
  { id:'dh-sb-3', deg:'°7', semiOffset:4,  resolveId:'dh-iv',  int:[0,3,6,9], quality:'dim7', qLabel:'°7', nash:'vii°7/iv'  },
  { id:'dh-sb-4', deg:'°7', semiOffset:7,  resolveId:'dh-bVI', int:[0,3,6,9], quality:'dim7', qLabel:'°7', nash:'vii°7/♭VI' },
];

export const MODE_DARK_HARMONY = {
  id:    'dark_harmony',
  label: 'Dark Harmony',
  icon:  'moon',
  scale: 'naturalMinor',
  rows: [
    {
      id: 'dh-top', tag: 'Sec. Dim. V + Neapolitan',
      hint: '°7 / ♭II — all resolve to V',
      loopLabel: '↓ to V', canLoop: false, style: 'secondary',
      chords:   DH_SECDIM_V,
      rootCalc: (cd, ti) => (ti + cd.semiOffset) % 12,
    },
    {
      id: 'dh-main', tag: 'Main Chords',
      hint: 'Mix freely — start with i, iv, ♭VI or V',
      loopLabel: '⟳ free', canLoop: true, style: 'main',
      chords:   DH_MAIN,
      rootCalc: (cd, ti) => (ti + cd.semi) % 12,
    },
    {
      id: 'dh-bot', tag: 'Sec. Dim. iv · ♭VI',
      hint: '°7 — resolves up to iv or ♭VI',
      loopLabel: '↑ only', canLoop: false, style: 'modal',
      chords:   DH_SECDIM_BOT,
      rootCalc: (cd, ti) => (ti + cd.semiOffset) % 12,
    },
  ],
  isDimmed(chordId, rowId, lastSelected) {
    if (!lastSelected) return false;
    const { id: lastId, row: lastRow } = lastSelected;

    // After top row (sec.dim V or Neapolitan) → only V is lit in main
    if (lastRow === 'dh-top') {
      if (rowId === 'dh-main') return chordId !== 'dh-V';
      return true; // dim top → top or bottom not allowed
    }
    // After bottom sec.dim → only iv or ♭VI lit in main
    if (lastRow === 'dh-bot') {
      const sec = DH_SECDIM_BOT.find(s => s.id === lastId);
      if (rowId === 'dh-main') return sec ? chordId !== sec.resolveId : true;
      return true;
    }
    // After main → top accessible from any; bottom accessible from any
    if (lastRow === 'dh-main') {
      return false; // all rows accessible from main
    }
    return false;
  },
  arrows: [
    // All top chords point down to V
    { type: 'row-to-fixed-target', fromRow: 'dh-top', targetId: 'dh-V', style: 'teal' },
    // Bottom chords point up to their targets
    { type: 'row-to-row-targeted', fromRow: 'dh-bot', toRow: 'dh-main', style: 'amber' },
  ],
};

// ── Mode registry ─────────────────────────────────────────────────────────────
export const MODES = [
  MODE_PROGRESSIONS,
  MODE_DARK_HARMONY,
];

export function getModeById(id) {
  return MODES.find(m => m.id === id) || MODE_PROGRESSIONS;
}
