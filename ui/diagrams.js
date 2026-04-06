// ── ui/diagrams.js ─────────────────────────────────────────────────────────────

import { GUITAR_VOICINGS, UKULELE_VOICINGS } from '../data/instruments.js';
import { CHROMATIC } from '../data/theory.js';
import { playChord } from '../audio/player.js';

const WHITE_ORDER    = [0,2,4,5,7,9,11];
const BLACK_ORDER    = [1,3,6,8,10];
const BLACK_X_OFFSET = {1:0.6, 3:1.6, 6:3.6, 8:4.6, 10:5.6};
const svgNS          = 'http://www.w3.org/2000/svg';

// ── CSS variable readers ──────────────────────────────────────────────────────
export function getPianoBg() {
  return getComputedStyle(document.documentElement).getPropertyValue('--piano-bg').trim() || '#181b24';
}
export function getKeyStroke() {
  return getComputedStyle(document.documentElement).getPropertyValue('--key-stroke').trim() || 'rgba(255,255,255,0.5)';
}

// ── Chord tone colour resolver ────────────────────────────────────────────────
// Returns { root, chord, label } colours for a given quality.
// In default mode all qualities use the same blue palette.
// The quality-colour mode overrides this via CSS variables set on <html>.
export function getChordColours(quality) {
  const css = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  // Try quality-specific variable first, fall back to default blue
  const rootCol  = css(`--chord-root-${quality}`)  || css('--chord-root')  || '#4a8fe8';
  const chordCol = css(`--chord-tone-${quality}`)  || css('--chord-tone')  || '#91bef0';
  const labelCol = css(`--chord-label-${quality}`) || css('--chord-label') || '#0d3d7a';
  return { root: rootCol, chord: chordCol, label: labelCol };
}

// ── SVG element helper ────────────────────────────────────────────────────────
function el(tag, attrs, parent) {
  const e = document.createElementNS(svgNS, tag);
  if (attrs) Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
  if (parent) parent.appendChild(e);
  return e;
}

function noteMidi(noteIdx, octave = 4) {
  return 12 + octave * 12 + (noteIdx % 12);
}

function playNote(midi) {
  playChord(midi, [0], { arpeggiate: false, duration: 1.5, gain: 0.35 });
}

// ── Piano key renderer (shared for white and black) ───────────────────────────
function renderKey(parent, { x, y, w, h, rx }, noteState, opts) {
  const { isRoot, isChord, isScale, interactive, intervalMidi, octaves, colours, bgColor, keyStroke } = opts;

  const fill   = isRoot ? colours.root : isChord ? colours.chord : bgColor;
  const stroke = (isRoot || isChord) ? 'none' : keyStroke;

  const rect = el('rect', { x, y, width: w, height: h, rx, fill, stroke, 'stroke-width': 0.8 }, parent);

  if (interactive && (isRoot || isChord) && intervalMidi != null) {
    rect.style.cursor = 'pointer';
    rect.addEventListener('click', () => playNote(intervalMidi));
    rect.addEventListener('mouseenter', () => rect.setAttribute('opacity', '0.75'));
    rect.addEventListener('mouseleave', () => rect.setAttribute('opacity', '1'));
  }

  return rect;
}

// ── Piano ─────────────────────────────────────────────────────────────────────
export function renderPiano(rootNoteIdx, intervals, scaleNoteSet, compact = false, bgColor = '#181b24', interactive = false, octaves = 1, quality = 'major') {
  const totalWhite = octaves === 2 ? 15 : 8;
  const totalKeys  = octaves === 2 ? 25 : 13;
  const W  = octaves === 2 ? 340 : 200;
  const H  = compact ? 60 : 80;
  const ww = W / totalWhite;
  const bw = ww * 0.62;
  const bh = H * 0.6;

  const chordNotes = new Set(intervals.map(i => (rootNoteIdx + i) % 12));
  const colours    = getChordColours(quality);
  const keyStroke  = getKeyStroke();

  const svgEl = el('svg', {
    viewBox: `0 0 ${W} ${compact ? H : H + 16}`,
    style: 'width:100%;height:auto;display:block;',
  });

  const whitesG = el('g', null, svgEl);
  const blacksG = el('g', null, svgEl);

  const commonOpts = { interactive, colours, bgColor, keyStroke, octaves };

  // White keys
  for (let i = 0; i < totalKeys; i++) {
    const n = i % 12;
    if (!WHITE_ORDER.includes(n)) continue;
    const oct  = Math.floor(i / 12);
    const wPos = WHITE_ORDER.indexOf(n) + oct * 7;
    const x    = wPos * ww;
    const isRoot  = n === rootNoteIdx % 12 && oct === 0;
    const isChord = chordNotes.has(n);
    const isScale = scaleNoteSet?.has(n) && !isChord && !isRoot;

    renderKey(whitesG, { x, y: 0, w: ww, h: H, rx: 3 }, {}, {
      ...commonOpts, isRoot, isChord, isScale,
      intervalMidi: (isRoot || isChord)
        ? noteMidi(rootNoteIdx, 4 + oct) + (intervals.find(iv => (rootNoteIdx + iv) % 12 === n) ?? 0) % 12
        : null,
    });

    if (isRoot || isChord) {
      el('text', {
        x: x + ww / 2, y: H - 7,
        'text-anchor': 'middle', 'font-size': octaves === 2 ? 6 : 7,
        fill: isRoot ? 'white' : colours.label,
        'font-family': 'monospace', 'pointer-events': 'none',
      }, whitesG).textContent = CHROMATIC[n];
    }
    if (isScale) {
      el('circle', { cx: x + ww / 2, cy: H - 8, r: 2.5, fill: '#5a9e50', opacity: 0.8, 'pointer-events': 'none' }, whitesG);
    }
  }

  // Black keys (drawn on top)
  for (let i = 0; i < totalKeys; i++) {
    const n = i % 12;
    if (!BLACK_ORDER.includes(n)) continue;
    const oct = Math.floor(i / 12);
    const x   = (BLACK_X_OFFSET[n] + oct * 7) * ww;
    const isRoot  = n === rootNoteIdx % 12 && oct === 0;
    const isChord = chordNotes.has(n);
    const isScale = scaleNoteSet?.has(n) && !isChord && !isRoot;

    renderKey(blacksG, { x, y: 0, w: bw, h: bh, rx: 2 }, {}, {
      ...commonOpts, isRoot, isChord, isScale,
      intervalMidi: (isRoot || isChord)
        ? noteMidi(rootNoteIdx, 4 + oct) + (intervals.find(iv => (rootNoteIdx + iv) % 12 === n) ?? 0) % 12
        : null,
    });

    if (isRoot || isChord) {
      el('circle', { cx: x + bw / 2, cy: bh - 7, r: 3, fill: 'white', opacity: 0.9, 'pointer-events': 'none' }, blacksG);
    } else if (isScale) {
      el('circle', { cx: x + bw / 2, cy: bh - 7, r: 2, fill: '#7ad870', opacity: 0.8, 'pointer-events': 'none' }, blacksG);
    }
  }

  // Legend (non-compact)
  if (!compact) {
    const legendG = el('g', null, svgEl);
    [
      { x: 2,  fill: colours.root,  label: 'root'  },
      { x: 36, fill: colours.chord, label: 'chord' },
      { x: 76, fill: '#5a9e50',     label: 'scale' },
    ].forEach(({ x, fill, label }) => {
      el('rect', { x, y: H + 2, width: 7, height: 7, rx: 1, fill }, legendG);
      el('text', { x: x + 10, y: H + 9, 'font-size': 7, fill: '#888', 'font-family': 'sans-serif' }, legendG)
        .textContent = label;
    });
    if (interactive) {
      el('text', { x: W - 2, y: H + 9, 'text-anchor': 'end', 'font-size': 7, fill: '#555', 'font-family': 'sans-serif' }, legendG)
        .textContent = 'click keys to play';
    }
  }

  if (compact) {
    return new XMLSerializer().serializeToString(svgEl);
  }
  return svgEl;
}

// ── Fretboard ─────────────────────────────────────────────────────────────────
export function renderFretboard(rootNoteIdx, intervals, scaleNoteSet, voicingKeyStr, instrument, interactive = false, quality = 'major') {
  const voicings   = instrument === 'guitar' ? GUITAR_VOICINGS : UKULELE_VOICINGS;
  const numStrings = instrument === 'guitar' ? 6 : 4;
  const tuningMidi = instrument === 'guitar' ? [40,45,50,55,59,64] : [67,60,64,69];
  const colours    = getChordColours(quality);

  const frets = voicings[voicingKeyStr]?.simple ?? null;

  const W = 160, FRETS = 5;
  const padL = 24, padT = 20, padB = 20;
  const strSp  = (W - padL - 16) / (numStrings - 1);
  const fretSp = 28;
  const H = padT + FRETS * fretSp + padB;

  const chordNotes = new Set(intervals.map(i => (rootNoteIdx + i) % 12));

  const svgEl = el('svg', { viewBox: `0 0 ${W} ${H}`, style: 'width:100%;height:auto;display:block;' });

  let minFret = frets ? Math.min(...frets.filter(f => f > 0), 99) : 1;
  if (minFret === 99) minFret = 1;
  const startFret = minFret > 1 ? minFret - 1 : 0;
  const yOff = padT + (startFret === 0 ? 4 : 0);

  // Nut / position label
  if (startFret === 0) {
    el('rect', { x: padL, y: padT, width: strSp * (numStrings - 1), height: 4, rx: 1, fill: '#aaa' }, svgEl);
  } else {
    el('text', { x: 4, y: padT + fretSp * 0.6, 'font-size': 9, fill: '#888', 'font-family': 'monospace' }, svgEl)
      .textContent = `${startFret + 1}fr`;
  }

  // Fret lines
  for (let f = 0; f <= FRETS; f++) {
    el('line', { x1: padL, y1: yOff + f * fretSp, x2: padL + strSp * (numStrings - 1), y2: yOff + f * fretSp, stroke: '#444', 'stroke-width': 0.7 }, svgEl);
  }

  // String lines
  for (let s = 0; s < numStrings; s++) {
    el('line', { x1: padL + s * strSp, y1: yOff, x2: padL + s * strSp, y2: yOff + FRETS * fretSp, stroke: '#555', 'stroke-width': 1.2 }, svgEl);
  }

  // Position dots
  [3,5,7,9,12].forEach(df => {
    const fi = df - startFret;
    if (fi > 0 && fi <= FRETS)
      el('circle', { cx: padL + strSp * (numStrings - 1) / 2, cy: yOff + (fi - 0.5) * fretSp, r: 3, fill: '#333', opacity: 0.4 }, svgEl);
  });

  // Strings
  for (let s = 0; s < numStrings; s++) {
    const x = padL + s * strSp;
    if (!frets || frets[s] === -1) {
      if (frets?.[s] === -1)
        el('text', { x, y: padT - 7, 'text-anchor': 'middle', 'font-size': 10, fill: '#666' }, svgEl).textContent = '×';
      continue;
    }

    if (frets[s] === 0) {
      const openNote = tuningMidi[s] % 12;
      const isRoot = openNote === rootNoteIdx % 12;
      const isChord = chordNotes.has(openNote);
      const circ = el('circle', {
        cx: x, cy: padT - 8, r: 5,
        fill: isRoot ? colours.root : 'none',
        stroke: (isRoot || isChord) ? colours.root : '#888',
        'stroke-width': 1.5,
      }, svgEl);
      if (interactive && (isRoot || isChord)) {
        circ.style.cursor = 'pointer';
        circ.addEventListener('click', () => playNote(tuningMidi[s]));
        circ.addEventListener('mouseenter', () => circ.setAttribute('opacity', '0.7'));
        circ.addEventListener('mouseleave', () => circ.setAttribute('opacity', '1'));
      }
    } else {
      const fi = frets[s] - startFret;
      if (fi < 1 || fi > FRETS) continue;
      const cy = yOff + (fi - 0.5) * fretSp;
      const midi = tuningMidi[s] + frets[s];
      const note = midi % 12;
      const isRoot  = note === rootNoteIdx % 12;
      const isChord = chordNotes.has(note);

      const circ = el('circle', { cx: x, cy, r: 8, fill: isRoot ? colours.root : isChord ? colours.chord : '#666' }, svgEl);
      if (interactive && (isRoot || isChord)) {
        circ.style.cursor = 'pointer';
        circ.addEventListener('click', () => playNote(midi));
        circ.addEventListener('mouseenter', () => circ.setAttribute('opacity', '0.7'));
        circ.addEventListener('mouseleave', () => circ.setAttribute('opacity', '1'));
      }
      if (isRoot)
        el('text', { x, y: cy + 3.5, 'text-anchor': 'middle', 'font-size': 8, fill: 'white', 'font-weight': 'bold', 'font-family': 'monospace', 'pointer-events': 'none' }, svgEl)
          .textContent = CHROMATIC[note];
    }
  }

  // String labels
  const labels = instrument === 'guitar' ? ['E','A','D','G','B','e'] : ['G','C','E','A'];
  for (let s = 0; s < numStrings; s++) {
    el('text', { x: padL + s * strSp, y: H - 4, 'text-anchor': 'middle', 'font-size': 8, fill: '#666', 'font-family': 'monospace' }, svgEl)
      .textContent = labels[s];
  }

  if (interactive)
    el('text', { x: W / 2, y: H - 4, 'text-anchor': 'middle', 'font-size': 7, fill: '#555', 'font-family': 'sans-serif' }, svgEl)
      .textContent = 'click notes to play';

  if (!interactive) return new XMLSerializer().serializeToString(svgEl);
  return svgEl;
}
