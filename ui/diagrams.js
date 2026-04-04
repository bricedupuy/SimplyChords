// ── ui/diagrams.js ─────────────────────────────────────────────────────────────

import { GUITAR_VOICINGS, UKULELE_VOICINGS } from '../data/instruments.js';
import { CHROMATIC } from '../data/theory.js';
import { playChord } from '../audio/player.js';

const WHITE_ORDER   = [0,2,4,5,7,9,11];
const BLACK_ORDER   = [1,3,6,8,10];
const BLACK_X_OFFSET = {1:0.6, 3:1.6, 6:3.6, 8:4.6, 10:5.6};

// Read CSS variables at render time so theme changes are reflected
export function getPianoBg() {
  return getComputedStyle(document.documentElement).getPropertyValue('--piano-bg').trim() || '#181b24';
}
export function getKeyStroke() {
  return getComputedStyle(document.documentElement).getPropertyValue('--key-stroke').trim() || 'rgba(255,255,255,0.5)';
}

function noteMidi(noteIdx, octave = 4) {
  return 12 + octave * 12 + (noteIdx % 12);
}

// ── Piano ─────────────────────────────────────────────────────────────────────
// compact=true → returns SVG string (tiles)
// compact=false, interactive=true → returns a <div> with clickable SVG keys (detail panel)

export function renderPiano(rootNoteIdx, intervals, scaleNoteSet, compact = false, bgColor = '#181b24', interactive = false) {
  const W = 200, H = compact ? 60 : 80;
  const totalWhite = 8;
  const ww = W / totalWhite;
  const wh = H;
  const bw = ww * 0.62;
  const bh = H * 0.6;

  const chordNotes = new Set(intervals.map(i => (rootNoteIdx + i) % 12));

  // Build as DOM so we can optionally attach listeners
  const svgNS = 'http://www.w3.org/2000/svg';
  const svgEl = document.createElementNS(svgNS, 'svg');
  svgEl.setAttribute('viewBox', `0 0 ${W} ${compact ? H : H + 16}`);
  svgEl.style.cssText = 'width:100%;height:auto;display:block;';

  const whitesG = document.createElementNS(svgNS, 'g');
  const blacksG = document.createElementNS(svgNS, 'g');
  const keyStroke = getKeyStroke();

  // ── White keys ──────────────────────────────────────────────────────────────
  let wi = 0;
  for (let i = 0; i < 14; i++) {
    const n = i % 12;
    if (!WHITE_ORDER.includes(n)) continue;
    const wPos = WHITE_ORDER.indexOf(n) + (i >= 12 ? 7 : 0);
    const x = wPos * ww;
    const isRoot  = n === rootNoteIdx % 12 && i < 12;
    const isChord = chordNotes.has(n);
    const isScale = scaleNoteSet?.has(n) && !isChord && !isRoot;

    const fill   = isRoot ? '#4a8fe8' : isChord ? '#91bef0' : bgColor;
    const stroke = (isRoot || isChord) ? 'none' : keyStroke;

    const rect = document.createElementNS(svgNS, 'rect');
    rect.setAttribute('x', x);
    rect.setAttribute('y', 0);
    rect.setAttribute('width', ww);
    rect.setAttribute('height', wh);
    rect.setAttribute('rx', 3);
    rect.setAttribute('fill', fill);
    rect.setAttribute('stroke', stroke);
    rect.setAttribute('stroke-width', 0.8);

    if (interactive && (isRoot || isChord)) {
      const midi = noteMidi(rootNoteIdx) + intervals.find(iv => (rootNoteIdx + iv) % 12 === n);
      rect.style.cursor = 'pointer';
      rect.addEventListener('click', () => playNote(midi));
      rect.addEventListener('mouseenter', () => rect.setAttribute('opacity', '0.75'));
      rect.addEventListener('mouseleave', () => rect.setAttribute('opacity', '1'));
    }

    whitesG.appendChild(rect);

    if (isRoot || isChord) {
      const labelFill = isRoot ? 'white' : '#0d3d7a';
      const txt = document.createElementNS(svgNS, 'text');
      txt.setAttribute('x', x + ww / 2);
      txt.setAttribute('y', wh - 7);
      txt.setAttribute('text-anchor', 'middle');
      txt.setAttribute('font-size', 7);
      txt.setAttribute('fill', labelFill);
      txt.setAttribute('font-family', 'monospace');
      txt.setAttribute('pointer-events', 'none');
      txt.textContent = CHROMATIC[n];
      whitesG.appendChild(txt);
    }
    if (isScale) {
      const dot = document.createElementNS(svgNS, 'circle');
      dot.setAttribute('cx', x + ww / 2);
      dot.setAttribute('cy', wh - 8);
      dot.setAttribute('r', 2.5);
      dot.setAttribute('fill', '#5a9e50');
      dot.setAttribute('opacity', 0.8);
      dot.setAttribute('pointer-events', 'none');
      whitesG.appendChild(dot);
    }
    wi++;
  }

  // ── Black keys ──────────────────────────────────────────────────────────────
  for (let i = 0; i < 13; i++) {
    const n = i % 12;
    if (!BLACK_ORDER.includes(n)) continue;
    const baseOffset = BLACK_X_OFFSET[n];
    const octOff = i >= 12 ? 7 : 0;
    const x = (baseOffset + octOff) * ww;
    const isRoot  = n === rootNoteIdx % 12;
    const isChord = chordNotes.has(n);
    const isScale = scaleNoteSet?.has(n) && !isChord && !isRoot;

    // Same styling as white keys — no differentiation
    const fill   = isRoot ? '#4a8fe8' : isChord ? '#91bef0' : bgColor;
    const stroke = (isRoot || isChord) ? 'none' : keyStroke;

    const rect = document.createElementNS(svgNS, 'rect');
    rect.setAttribute('x', x);
    rect.setAttribute('y', 0);
    rect.setAttribute('width', bw);
    rect.setAttribute('height', bh);
    rect.setAttribute('rx', 2);
    rect.setAttribute('fill', fill);
    rect.setAttribute('stroke', stroke);
    rect.setAttribute('stroke-width', 0.8);

    if (interactive && (isRoot || isChord)) {
      const iv = intervals.find(iv => (rootNoteIdx + iv) % 12 === n);
      const midi = noteMidi(rootNoteIdx) + iv;
      rect.style.cursor = 'pointer';
      rect.addEventListener('click', () => playNote(midi));
      rect.addEventListener('mouseenter', () => rect.setAttribute('opacity', '0.75'));
      rect.addEventListener('mouseleave', () => rect.setAttribute('opacity', '1'));
    }

    blacksG.appendChild(rect);

    if (isRoot || isChord) {
      const dot = document.createElementNS(svgNS, 'circle');
      dot.setAttribute('cx', x + bw / 2);
      dot.setAttribute('cy', bh - 7);
      dot.setAttribute('r', 3);
      dot.setAttribute('fill', 'white');
      dot.setAttribute('opacity', 0.9);
      dot.setAttribute('pointer-events', 'none');
      blacksG.appendChild(dot);
    } else if (isScale) {
      const dot = document.createElementNS(svgNS, 'circle');
      dot.setAttribute('cx', x + bw / 2);
      dot.setAttribute('cy', bh - 7);
      dot.setAttribute('r', 2);
      dot.setAttribute('fill', '#7ad870');
      dot.setAttribute('opacity', 0.8);
      dot.setAttribute('pointer-events', 'none');
      blacksG.appendChild(dot);
    }
  }

  // Legend (non-compact only)
  if (!compact) {
    const legendG = document.createElementNS(svgNS, 'g');
    const items = [
      { x: 2,  color: '#4a8fe8', label: 'root'  },
      { x: 36, color: '#91bef0', label: 'chord' },
      { x: 76, color: '#5a9e50', label: 'scale' },
    ];
    items.forEach(({ x, color, label }) => {
      const r = document.createElementNS(svgNS, 'rect');
      r.setAttribute('x', x); r.setAttribute('y', H + 2);
      r.setAttribute('width', 7); r.setAttribute('height', 7);
      r.setAttribute('rx', 1); r.setAttribute('fill', color);
      const t = document.createElementNS(svgNS, 'text');
      t.setAttribute('x', x + 10); t.setAttribute('y', H + 9);
      t.setAttribute('font-size', 7); t.setAttribute('fill', '#888');
      t.setAttribute('font-family', 'sans-serif');
      t.textContent = label;
      legendG.appendChild(r); legendG.appendChild(t);
    });
    if (interactive) {
      const hint = document.createElementNS(svgNS, 'text');
      hint.setAttribute('x', W - 2); hint.setAttribute('y', H + 9);
      hint.setAttribute('text-anchor', 'end');
      hint.setAttribute('font-size', 7); hint.setAttribute('fill', '#555');
      hint.setAttribute('font-family', 'sans-serif');
      hint.textContent = 'click keys to play';
      legendG.appendChild(hint);
    }
    svgEl.appendChild(legendG);
  }

  svgEl.appendChild(whitesG);
  svgEl.appendChild(blacksG);

  if (compact) {
    // For tiles: return serialised string (fast, no DOM overhead)
    const ser = new XMLSerializer();
    return ser.serializeToString(svgEl);
  } else {
    // For detail panel: return the live DOM element
    return svgEl;
  }
}

// ── Single note playback ──────────────────────────────────────────────────────
function playNote(midi) {
  playChord(midi, [0], { arpeggiate: false, duration: 1.5, gain: 0.35 });
}

// ── Fretboard ─────────────────────────────────────────────────────────────────
// interactive=false → returns SVG string; interactive=true → returns DOM element

export function renderFretboard(rootNoteIdx, intervals, scaleNoteSet, voicingKeyStr, instrument, interactive = false) {
  const voicings    = instrument === 'guitar' ? GUITAR_VOICINGS : UKULELE_VOICINGS;
  const numStrings  = instrument === 'guitar' ? 6 : 4;
  const tuningMidi  = instrument === 'guitar'
    ? [40, 45, 50, 55, 59, 64]
    : [67, 60, 64, 69];

  const voicing = voicings[voicingKeyStr];
  const frets   = voicing ? voicing.simple : null;

  const W = 160, FRETS = 5;
  const padLeft = 24, padTop = 20, padBottom = 20;
  const strSpacing  = (W - padLeft - 16) / (numStrings - 1);
  const fretSpacing = 28;
  const H = padTop + FRETS * fretSpacing + padBottom;

  const chordNotes = new Set(intervals.map(i => (rootNoteIdx + i) % 12));

  const svgNS = 'http://www.w3.org/2000/svg';
  const svgEl = document.createElementNS(svgNS, 'svg');
  svgEl.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svgEl.style.cssText = 'width:100%;height:auto;display:block;';

  let minFret = 99;
  if (frets) frets.forEach(f => { if (f > 0) minFret = Math.min(minFret, f); });
  if (minFret === 99) minFret = 1;
  const startFret = minFret > 1 ? minFret - 1 : 0;
  const yOff = padTop + (startFret === 0 ? 4 : 0);

  function addEl(tag, attrs, parent = svgEl) {
    const el = document.createElementNS(svgNS, tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    parent.appendChild(el);
    return el;
  }

  // Nut / position
  if (startFret === 0) {
    addEl('rect', { x: padLeft, y: padTop, width: strSpacing*(numStrings-1), height: 4, rx: 1, fill: '#aaa' });
  } else {
    addEl('text', { x: 4, y: padTop + fretSpacing*0.6, 'font-size': 9, fill: '#888', 'font-family': 'monospace' })
      .textContent = `${startFret+1}fr`;
  }

  // Fret lines
  for (let f = 0; f <= FRETS; f++) {
    const y = yOff + f * fretSpacing;
    addEl('line', { x1: padLeft, y1: y, x2: padLeft+strSpacing*(numStrings-1), y2: y, stroke: '#444', 'stroke-width': 0.7 });
  }

  // String lines
  for (let s = 0; s < numStrings; s++) {
    const x = padLeft + s * strSpacing;
    addEl('line', { x1: x, y1: yOff, x2: x, y2: yOff+FRETS*fretSpacing, stroke: '#555', 'stroke-width': 1.2 });
  }

  // Fretboard position dots
  [3,5,7,9,12].forEach(df => {
    const fi = df - startFret;
    if (fi > 0 && fi <= FRETS) {
      addEl('circle', { cx: padLeft+strSpacing*(numStrings-1)/2, cy: yOff+(fi-0.5)*fretSpacing, r: 3, fill: '#333', opacity: 0.4 });
    }
  });

  // Per-string: muted X, open circle, or fretted dot
  for (let s = 0; s < numStrings; s++) {
    const x = padLeft + s * strSpacing;
    if (!frets || frets[s] === -1) {
      if (frets?.[s] === -1)
        addEl('text', { x, y: padTop-7, 'text-anchor': 'middle', 'font-size': 10, fill: '#666' }).textContent = '×';
      continue;
    }

    if (frets[s] === 0) {
      // Open string
      const openNote = tuningMidi[s] % 12;
      const isRoot  = openNote === rootNoteIdx % 12;
      const isChord = chordNotes.has(openNote);
      const fill   = isRoot ? '#4a8fe8' : isChord ? 'none' : 'none';
      const stroke = isRoot ? '#4a8fe8' : isChord ? '#4a8fe8' : '#888';
      const circ = addEl('circle', { cx: x, cy: padTop-8, r: 5, fill, stroke, 'stroke-width': 1.5 });
      if (interactive && (isRoot || isChord)) {
        const midi = tuningMidi[s];
        circ.style.cursor = 'pointer';
        circ.addEventListener('click', () => playNote(midi));
        circ.addEventListener('mouseenter', () => circ.setAttribute('opacity', '0.7'));
        circ.addEventListener('mouseleave', () => circ.setAttribute('opacity', '1'));
      }
    } else {
      // Fretted note
      const fi = frets[s] - startFret;
      if (fi < 1 || fi > FRETS) continue;
      const cy = yOff + (fi - 0.5) * fretSpacing;
      const noteMidiVal = tuningMidi[s] + frets[s];
      const note  = noteMidiVal % 12;
      const isRoot  = note === rootNoteIdx % 12;
      const isChord = chordNotes.has(note);
      const dotFill = isRoot ? '#4a8fe8' : isChord ? '#91bef0' : '#666';

      const circ = addEl('circle', { cx: x, cy, r: 8, fill: dotFill });
      if (interactive && (isRoot || isChord)) {
        circ.style.cursor = 'pointer';
        circ.addEventListener('click', () => playNote(noteMidiVal));
        circ.addEventListener('mouseenter', () => circ.setAttribute('opacity', '0.7'));
        circ.addEventListener('mouseleave', () => circ.setAttribute('opacity', '1'));
      }
      if (isRoot) {
        const t = addEl('text', { x, y: cy+3.5, 'text-anchor': 'middle', 'font-size': 8, fill: 'white', 'font-weight': 'bold', 'font-family': 'monospace', 'pointer-events': 'none' });
        t.textContent = CHROMATIC[note];
      }
    }
  }

  // String labels at bottom
  const labels = instrument === 'guitar' ? ['E','A','D','G','B','e'] : ['G','C','E','A'];
  for (let s = 0; s < numStrings; s++) {
    addEl('text', { x: padLeft+s*strSpacing, y: H-4, 'text-anchor': 'middle', 'font-size': 8, fill: '#666', 'font-family': 'monospace' })
      .textContent = labels[s];
  }

  if (interactive) {
    // hint
    addEl('text', { x: W/2, y: H-4, 'text-anchor': 'middle', 'font-size': 7, fill: '#555', 'font-family': 'sans-serif' })
      .textContent = 'click notes to play';
  }

  if (!interactive) {
    const ser = new XMLSerializer();
    return ser.serializeToString(svgEl);
  }
  return svgEl;
}
