// ── theory.js ─────────────────────────────────────────────────────────────────
// All music theory: notes, scales, chord definitions, name mappings

export const CHROMATIC = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];

export const ENHARMONIC = {
  'C#':'D♭','D#':'E♭','F#':'G♭','G#':'A♭','A#':'B♭',
  'D♭':'C#','E♭':'D#','G♭':'F#','A♭':'G#','B♭':'A#'
};

// Prefer flat names for these roots
const FLAT_KEYS = new Set(['F','B♭','E♭','A♭','D♭','G♭']);
export function preferredNote(noteIdx, rootKey) {
  const sharp = CHROMATIC[noteIdx % 12];
  if (FLAT_KEYS.has(rootKey) && ENHARMONIC[sharp]) return ENHARMONIC[sharp];
  return sharp;
}

// ── Name systems ──────────────────────────────────────────────────────────────
export const SOLFEGE_MAP = {
  'C':'Do','C#':'Do#','D♭':'Ré♭','D':'Ré','D#':'Ré#','E♭':'Mi♭',
  'E':'Mi','F':'Fa','F#':'Fa#','G♭':'Sol♭','G':'Sol','G#':'Sol#',
  'A♭':'La♭','A':'La','A#':'La#','B♭':'Si♭','B':'Si'
};

export const NASHVILLE_DEGREES = ['1','♭2','2','♭3','3','4','♭5','5','♭6','6','♭7','7'];

// ── Scale intervals ────────────────────────────────────────────────────────────
export const SCALES = {
  major:       [0,2,4,5,7,9,11],
  naturalMinor:[0,2,3,5,7,8,10],
  dorian:      [0,2,3,5,7,9,10],
  mixolydian:  [0,2,4,5,7,9,10],
};

// ── Diatonic chord definitions (major key) ────────────────────────────────────
// Each entry: degree label, semitone above tonic, chord intervals, quality, Nashville
export const DIATONIC = [
  { id:'I',    deg:'I',    semi:0,  int:[0,4,7],     quality:'major',  qLabel:'M',    nash:'1',   tonic:true  },
  { id:'vi',   deg:'vi',   semi:9,  int:[0,3,7],     quality:'minor',  qLabel:'m',    nash:'6m',  tonic:false },
  { id:'IV',   deg:'IV',   semi:5,  int:[0,4,7,11],  quality:'maj7',   qLabel:'Maj7', nash:'4',   tonic:false },
  { id:'ii',   deg:'ii',   semi:2,  int:[0,3,7,10],  quality:'min7',   qLabel:'m7',   nash:'2m',  tonic:false },
  { id:'V',    deg:'V',    semi:7,  int:[0,4,7,10],  quality:'dom7',   qLabel:'7',    nash:'5',   tonic:false },
  { id:'iii',  deg:'iii',  semi:4,  int:[0,3,7],     quality:'minor',  qLabel:'m',    nash:'3m',  tonic:false },
  { id:'viiº', deg:'vii°', semi:11, int:[0,3,6],     quality:'dim',    qLabel:'°',    nash:'7°',  tonic:false },
];

// Secondary dominants: V7 that resolves to each diatonic chord
export const SECONDARY = [
  { id:'V/I',    deg:'Vⁱ',    targetId:'I',    resolveSemi:0,  int:[0,4,7,10], quality:'dom7', qLabel:'7', nash:'V/1'  },
  { id:'V/vi',   deg:'Vᵛⁱ',   targetId:'vi',   resolveSemi:9,  int:[0,4,7,10], quality:'dom7', qLabel:'7', nash:'V/6'  },
  { id:'V/IV',   deg:'Vⁱᵛ',   targetId:'IV',   resolveSemi:5,  int:[0,4,7,10], quality:'dom7', qLabel:'7', nash:'V/4'  },
  { id:'V/ii',   deg:'Vⁱⁱ',   targetId:'ii',   resolveSemi:2,  int:[0,4,7,10], quality:'dom7', qLabel:'7', nash:'V/2'  },
  { id:'V/V',    deg:'Vᵛ',    targetId:'V',    resolveSemi:7,  int:[0,4,7,10], quality:'dom7', qLabel:'7', nash:'V/5'  },
  { id:'V/iii',  deg:'Vⁱⁱⁱ',  targetId:'iii',  resolveSemi:4,  int:[0,4,7,10], quality:'dom7', qLabel:'7', nash:'V/3'  },
  { id:'V/vii',  deg:'Vᵛⁱⁱ',  targetId:'viiº', resolveSemi:11, int:[0,4,7,10], quality:'dom7', qLabel:'7', nash:'V/7'  },
];

// Modal interchange: borrowed from parallel minor
// Key of C reference: E♭Maj7, A♭Maj7, Fm7, B♭7, Dm7♭5
export const MODAL = [
  { id:'bIII', deg:'♭III', semi:3,  int:[0,4,7,11], quality:'maj7',  qLabel:'Maj7',  nash:'♭3', canReturn:true  },
  { id:'bVI',  deg:'♭VI',  semi:8,  int:[0,4,7,11], quality:'maj7',  qLabel:'Maj7',  nash:'♭6', canReturn:false },
  { id:'iv',   deg:'iv',   semi:5,  int:[0,3,7,10], quality:'min7',  qLabel:'m7',    nash:'4m', canReturn:false },
  { id:'bVII', deg:'♭VII', semi:10, int:[0,4,7,10], quality:'dom7',  qLabel:'7',     nash:'♭7', canReturn:false },
  { id:'iiø',  deg:'ii°',  semi:2,  int:[0,3,6,10], quality:'halfdim', qLabel:'m7♭5', nash:'2°', canReturn:false },
];

// ── Secondary dominant root calculation ───────────────────────────────────────
// The V7 of a chord is rooted a P5 above that chord's root (= +7 semitones)
export function secDomRoot(tonicIdx, targetSemi) {
  return (tonicIdx + targetSemi + 7) % 12;
}

// ── Chord name formatting ─────────────────────────────────────────────────────
export function formatRoot(noteIdx, rootKey, format) {
  const note = preferredNote(noteIdx, rootKey);
  if (format === 'solfege') return SOLFEGE_MAP[note] || note;
  return note;
}

export function formatChordName(noteIdx, quality, rootKey, format, nashvilleDeg) {
  if (format === 'nashville') return nashvilleDeg;
  const root = formatRoot(noteIdx, rootKey, format);
  const suffixes = { major:'', minor:'m', dom7:'7', maj7:'M7', min7:'m7', dim:'°', halfdim:'m7♭5', aug:'+' };
  return root + (suffixes[quality] || '');
}

// ── Scale notes for a given root + scale type ─────────────────────────────────
export function scaleNotes(tonicIdx, scaleType = 'major') {
  return (SCALES[scaleType] || SCALES.major).map(i => (tonicIdx + i) % 12);
}

// ── Interval label map ────────────────────────────────────────────────────────
export const INTERVAL_NAMES = {
  0:'Root', 1:'m2', 2:'M2', 3:'m3', 4:'M3', 5:'P4',
  6:'♭5', 7:'P5', 8:'m6', 9:'M6', 10:'m7', 11:'M7'
};

// ── Mood presets ──────────────────────────────────────────────────────────────
// Each step references a chord id from DIATONIC/SECONDARY/MODAL
export const MOODS = [
  {
    id: 'pop',
    label: 'Pop',
    desc: 'I–V–vi–IV',
    color: '#4a8fe8',
    steps: ['I','V','vi','IV']
  },
  {
    id: 'jazz',
    label: 'Jazz ii–V–I',
    desc: 'ii–V–I',
    color: '#e8a84a',
    steps: ['ii','V','I']
  },
  {
    id: 'emotional',
    label: 'Emotional',
    desc: 'vi–IV–I–V',
    color: '#b07de8',
    steps: ['vi','IV','I','V']
  },
  {
    id: 'blues',
    label: '12-Bar Blues',
    desc: 'I–I–I–I–IV–IV–I–I–V–IV–I–V',
    color: '#e87a4a',
    steps: ['I','I','I','I','IV','IV','I','I','V','IV','I','V']
  },
];
