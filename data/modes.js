// ── data/modes.js ─────────────────────────────────────────────────────────────
// Mode registry. Each mode defines its rows, row metadata, and path rules.
// New modes can be added here without touching board.js or app.js.

// ── Row descriptor schema ─────────────────────────────────────────────────────
// {
//   id:        string          — DOM container id (row-<id>)
//   label:     string          — display name
//   tag:       string          — short tag shown in row header
//   hint:      string          — short description
//   loopLabel: string          — loop badge text
//   canLoop:   boolean         — whether chords mix freely
//   style:     string          — CSS class suffix (main/secondary/modal/neapolitan/...)
//   chords:    ChordDef[]      — chord definitions for this row
//   rootCalc:  (cd, ti) => int — how to compute the root note index from tonic
// }

import { CHROMATIC, DIATONIC, SECONDARY, MODAL } from './theory.js';

// ── Helper: semitone shorthand ────────────────────────────────────────────────
const fix = semi => cd => (/* tonicIdx injected at call */ 0 + semi) % 12; // placeholder — real calc in mode

// ── PROGRESSIONS mode ─────────────────────────────────────────────────────────
// The original major-key board.

export const MODE_PROGRESSIONS = {
  id:    'progressions',
  label: 'Progressions',
  icon:  'music',
  scale: 'major',
  rows: [
    {
      id:        'secondary',
      label:     'Secondary Dominants',
      tag:       'Secondary Dominants',
      hint:      'V7 — resolves down',
      loopLabel: '↓ only',
      canLoop:   false,
      style:     'secondary',
      chords:    SECONDARY,
      rootCalc:  (cd, ti) => (ti + cd.resolveSemi + 7) % 12,
    },
    {
      id:        'main',
      label:     'Main Chords',
      tag:       'Main Chords',
      hint:      'Mix freely',
      loopLabel: '⟳ free',
      canLoop:   true,
      style:     'main',
      chords:    DIATONIC,
      rootCalc:  (cd, ti) => (ti + cd.semi) % 12,
    },
    {
      id:        'modal',
      label:     'Modal Interchange',
      tag:       'Modal Interchange',
      hint:      'Parallel minor — via I, IV, V',
      loopLabel: '↕ I/IV/V',
      canLoop:   false,
      style:     'modal',
      chords:    MODAL,
      rootCalc:  (cd, ti) => (ti + cd.semi) % 12,
    },
  ],
  // Path dimming rules: given lastSelected {id, row}, is this chord dimmed?
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
  // Arrow definitions: { from: {rowId, chordId}, to: {rowId, chordId}, style }
  // 'all' = draw one arrow per chord in the row
  arrows: [
    { type: 'row-to-row-targeted', fromRow: 'secondary', toRow: 'main', style: 'teal' },
    { type: 'gateway-down',        fromRow: 'main',      toRow: 'modal', gatewayIds: ['I','IV','V'], style: 'amber' },
  ],
};

// ── DARK HARMONY mode ─────────────────────────────────────────────────────────
// Based on the harmonic minor scale. Key of A = Am, Caug, Dm, F, E, G#dim, Bdim.
// Three rows: Secondary Diminished (top), Main Chords (middle), Sec. Dim. iv/♭VI (bottom)
// Plus a special Neapolitan chord (♭IIMaj7).

// Harmonic minor diatonic chords (semitones above minor tonic):
//   i=0 (m), ♭IIIaug=3 (aug), iv=5 (m), ♭VI=8 (Maj), V=7 (Maj/dom), #vii°=11 (dim), ii°=2 (dim)
const DH_MAIN = [
  { id:'dh-i',     deg:'i',      semi:0,  int:[0,3,7],     quality:'minor',  qLabel:'m',    nash:'1m',  tonic:true  },
  { id:'dh-bIII',  deg:'♭IIIaug',semi:3,  int:[0,4,8],     quality:'aug',    qLabel:'+',    nash:'♭3+', tonic:false },
  { id:'dh-iv',    deg:'iv',     semi:5,  int:[0,3,7],     quality:'minor',  qLabel:'m',    nash:'4m',  tonic:false },
  { id:'dh-bVI',   deg:'♭VI',    semi:8,  int:[0,4,7,11],  quality:'maj7',   qLabel:'Maj7', nash:'♭6',  tonic:false },
  { id:'dh-V',     deg:'V',      semi:7,  int:[0,4,7,10],  quality:'dom7',   qLabel:'7',    nash:'5',   tonic:false },
  { id:'dh-sharpdim',deg:'#vii°',semi:11, int:[0,3,6,9],   quality:'dim7',   qLabel:'°7',   nash:'7°',  tonic:false },
  { id:'dh-iidim', deg:'ii°',    semi:2,  int:[0,3,6],     quality:'dim',    qLabel:'°',    nash:'2°',  tonic:false },
];

// Secondary diminished (top): fully-diminished 7th a semitone below each main chord
// Targets: i (semi 0), iv (5), ♭VI (8), V (7) → dim7 root = target - 1
const DH_SECDIM_TOP = [
  { id:'dh-sd-i',   deg:'°7/i',   targetSemi:0,  resolveId:'dh-i',   int:[0,3,6,9], quality:'dim7', qLabel:'°7', nash:'°7/1' },
  { id:'dh-sd-iv',  deg:'°7/iv',  targetSemi:5,  resolveId:'dh-iv',  int:[0,3,6,9], quality:'dim7', qLabel:'°7', nash:'°7/4' },
  { id:'dh-sd-bVI', deg:'°7/♭VI', targetSemi:8,  resolveId:'dh-bVI', int:[0,3,6,9], quality:'dim7', qLabel:'°7', nash:'°7/♭6' },
  { id:'dh-sd-V',   deg:'°7/V',   targetSemi:7,  resolveId:'dh-V',   int:[0,3,6,9], quality:'dim7', qLabel:'°7', nash:'°7/5' },
];

// Secondary diminished (bottom): dim7 a semitone below iv and ♭VI (resolves up)
const DH_SECDIM_BOT = [
  { id:'dh-sb-iv',  deg:'°7/iv',  targetSemi:5,  resolveId:'dh-iv',  int:[0,3,6,9], quality:'dim7', qLabel:'°7', nash:'°7/4b' },
  { id:'dh-sb-bVI', deg:'°7/♭VI', targetSemi:8,  resolveId:'dh-bVI', int:[0,3,6,9], quality:'dim7', qLabel:'°7', nash:'°7/♭6b' },
  { id:'dh-sb-i2',  deg:'°7/i',   targetSemi:0,  resolveId:'dh-i',   int:[0,3,6,9], quality:'dim7', qLabel:'°7', nash:'°7/1b' },
  { id:'dh-sb-V2',  deg:'°7/V',   targetSemi:7,  resolveId:'dh-V',   int:[0,3,6,9], quality:'dim7', qLabel:'°7', nash:'°7/5b' },
];

// Neapolitan: ♭II Maj7 (semi = 1 above tonic)
const DH_NEAPOLITAN = [
  { id:'dh-neap', deg:'♭II', semi:1, int:[0,4,7,11], quality:'maj7', qLabel:'Maj7', nash:'♭2', tonic:false },
];

export const MODE_DARK_HARMONY = {
  id:    'dark_harmony',
  label: 'Dark Harmony',
  icon:  'moon',
  scale: 'naturalMinor',
  rows: [
    {
      id:        'dh-top',
      label:     'Secondary Diminished',
      tag:       'Sec. Diminished',
      hint:      '°7 — resolves down',
      loopLabel: '↓ only',
      canLoop:   false,
      style:     'secondary',
      chords:    DH_SECDIM_TOP,
      rootCalc:  (cd, ti) => (ti + cd.targetSemi - 1 + 12) % 12,
    },
    {
      id:        'dh-neap',
      label:     'Neapolitan',
      tag:       'Neapolitan',
      hint:      '♭II — follow the arrow',
      loopLabel: '↓ only',
      canLoop:   false,
      style:     'neapolitan',
      chords:    DH_NEAPOLITAN,
      rootCalc:  (cd, ti) => (ti + cd.semi) % 12,
    },
    {
      id:        'dh-main',
      label:     'Main Chords',
      tag:       'Main Chords',
      hint:      'Mix freely',
      loopLabel: '⟳ free',
      canLoop:   true,
      style:     'main',
      chords:    DH_MAIN,
      rootCalc:  (cd, ti) => (ti + cd.semi) % 12,
    },
    {
      id:        'dh-bot',
      label:     'Secondary Diminished iv, ♭VI',
      tag:       'Sec. Dim. iv, ♭VI',
      hint:      '°7 — resolves up',
      loopLabel: '↑ only',
      canLoop:   false,
      style:     'modal',
      chords:    DH_SECDIM_BOT,
      rootCalc:  (cd, ti) => (ti + cd.targetSemi - 1 + 12) % 12,
    },
  ],
  isDimmed(chordId, rowId, lastSelected) {
    if (!lastSelected) return false;
    const { id: lastId, row: lastRow } = lastSelected;

    // After a top secondary dim → only its target in main is lit
    if (lastRow === 'dh-top') {
      const sec = DH_SECDIM_TOP.find(s => s.id === lastId);
      if (rowId === 'dh-main') return sec ? chordId !== sec.resolveId : true;
      if (rowId === 'dh-top')  return true;
      if (rowId === 'dh-bot')  return true;
      return false;
    }
    // After a bottom secondary dim → only its target in main is lit
    if (lastRow === 'dh-bot') {
      const sec = DH_SECDIM_BOT.find(s => s.id === lastId);
      if (rowId === 'dh-main') return sec ? chordId !== sec.resolveId : true;
      if (rowId === 'dh-top')  return true;
      if (rowId === 'dh-bot')  return true;
      return false;
    }
    // After Neapolitan → only i and V are accessible
    if (lastRow === 'dh-neap') {
      if (rowId === 'dh-main') return !['dh-i','dh-V'].includes(chordId);
      return true;
    }
    // After main → neapolitan accessible from any chord; bottom accessible from i and V
    if (lastRow === 'dh-main') {
      if (rowId === 'dh-bot')  return !['dh-i','dh-V'].includes(lastId);
      return false;
    }
    return false;
  },
  arrows: [
    { type: 'row-to-row-targeted', fromRow: 'dh-top', toRow: 'dh-main', style: 'teal' },
    { type: 'gateway-down', fromRow: 'dh-main', toRow: 'dh-bot', gatewayIds: ['dh-i','dh-V'], style: 'amber' },
  ],
};

// ── Mode registry ─────────────────────────────────────────────────────────────
// Add new modes here — board.js and app.js read this registry.
export const MODES = [
  MODE_PROGRESSIONS,
  MODE_DARK_HARMONY,
];

export function getModeById(id) {
  return MODES.find(m => m.id === id) || MODE_PROGRESSIONS;
}
