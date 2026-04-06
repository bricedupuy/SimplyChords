// ── ui/detail.js ──────────────────────────────────────────────────────────────
// Detail panel: 2-octave piano, inversion tabs, chord variations.

import { CHROMATIC, INTERVAL_NAMES, scaleNotes, preferredNote } from '../data/theory.js';
import { voicingKey } from '../data/instruments.js';
import { renderPiano, renderFretboard, getPianoBg } from './diagrams.js';
import { playChord } from '../audio/player.js';
import { getInversions, getVariations } from '../data/voicings.js';

let _state = null;
export function setStateRef(s) { _state = s; }

// Current panel state
let _panelState = {
  noteIdx:      0,
  baseChordDef: null,
  chordName:    '',
  activeInv:    0,       // index into inversions array
  activeIntervals: [],   // currently displayed intervals
};

export function initDetailPanel() {
  document.getElementById('dp-close')?.addEventListener('click', close);
  document.getElementById('detail-panel-overlay')?.addEventListener('click', e => {
    if (e.target === document.getElementById('detail-panel-overlay')) close();
  });
  document.getElementById('dp-play')?.addEventListener('click', () => {
    const { noteIdx, activeIntervals } = _panelState;
    if (_state.soundEnabled) playChord(rootMidi(noteIdx), activeIntervals);
  });
}

export function open(noteIdx, chordDef, chordName) {
  const inversions = getInversions(chordDef.int);
  _panelState = {
    noteIdx,
    baseChordDef: chordDef,
    chordName,
    activeInv: 0,
    activeIntervals: inversions[0]?.intervals ?? chordDef.int,
  };

  document.getElementById('dp-chord-name').textContent = chordName;
  document.getElementById('dp-chord-meta').textContent = `${chordDef.deg} — ${chordDef.quality}`;

  renderInversionTabs(inversions);
  renderPianoSection(noteIdx, _panelState.activeIntervals);
  renderFretSection(noteIdx, chordDef);
  renderNotesAndIntervals(noteIdx, chordDef.int);
  renderVariations(noteIdx, chordDef);

  document.getElementById('detail-panel-overlay').classList.add('open');
}

export function close() {
  document.getElementById('detail-panel-overlay').classList.remove('open');
}

// ── Inversion tabs ─────────────────────────────────────────────────────────────
function renderInversionTabs(inversions) {
  const bar = document.getElementById('dp-inv-tabs');
  if (!bar) return;
  bar.innerHTML = '';

  inversions.forEach((inv, idx) => {
    const btn = document.createElement('button');
    btn.className = 'dp-inv-tab' + (idx === 0 ? ' active' : '');
    btn.textContent = inv.label;
    btn.addEventListener('click', () => {
      _panelState.activeInv = idx;
      _panelState.activeIntervals = inv.intervals;
      bar.querySelectorAll('.dp-inv-tab').forEach((b, i) => b.classList.toggle('active', i === idx));
      renderPianoSection(_panelState.noteIdx, inv.intervals);
    });
    bar.appendChild(btn);
  });
}

// ── Piano section ──────────────────────────────────────────────────────────────
function renderPianoSection(noteIdx, intervals) {
  const el = document.getElementById('dp-piano');
  if (!el) return;
  const scaleSet = new Set(scaleNotes(_state.tonicIdx, _state.activeMode?.scale ?? 'major'));
  el.innerHTML = '';
  el.appendChild(renderPiano(noteIdx, intervals, scaleSet, false, getPianoBg(), true, 2, _panelState.baseChordDef?.quality ?? 'major'));
}

// ── Fretboard section ─────────────────────────────────────────────────────────
function renderFretSection(noteIdx, chordDef) {
  const fretWrap  = document.getElementById('dp-fret-wrap');
  const fretLabel = document.getElementById('dp-fret-label');
  const inst = _state.instrument;
  if (inst !== 'piano') {
    const rootKey = CHROMATIC[_state.tonicIdx];
    const scaleSet = new Set(scaleNotes(_state.tonicIdx, _state.activeMode?.scale ?? 'major'));
    const vk = voicingKey(preferredNote(noteIdx, rootKey), chordDef.quality);
    fretWrap.innerHTML = '';
    fretWrap.appendChild(renderFretboard(noteIdx, chordDef.int, scaleSet, vk, inst, true, chordDef.quality));
    fretWrap.style.display = '';
    if (fretLabel) { fretLabel.textContent = inst[0].toUpperCase() + inst.slice(1); fretLabel.style.display = ''; }
  } else {
    fretWrap.style.display = 'none';
    if (fretLabel) fretLabel.style.display = 'none';
  }
}

// ── Notes & intervals ─────────────────────────────────────────────────────────
function renderNotesAndIntervals(noteIdx, intervals) {
  const rootKey = CHROMATIC[_state.tonicIdx];
  document.getElementById('dp-intervals').innerHTML =
    intervals.map(i => `<span class="pill">${INTERVAL_NAMES[i % 12] || '+'+i}</span>`).join('');
  document.getElementById('dp-notes').innerHTML =
    intervals.map(i => `<span class="pill">${preferredNote((noteIdx + i) % 12, rootKey)}</span>`).join('');
}

// ── Chord variations ──────────────────────────────────────────────────────────
function renderVariations(noteIdx, chordDef) {
  const container = document.getElementById('dp-variations');
  if (!container) return;

  const groups = getVariations(chordDef.quality);
  if (!groups.length) {
    container.style.display = 'none';
    return;
  }
  container.style.display = '';
  container.innerHTML = '';

  const rootKey = CHROMATIC[_state.tonicIdx];
  const rootName = preferredNote(noteIdx, rootKey);

  groups.forEach(group => {
    const groupEl = document.createElement('div');
    groupEl.className = 'dp-var-group';

    const label = document.createElement('div');
    label.className = 'dp-var-label';
    label.textContent = group.group;
    groupEl.appendChild(label);

    const pills = document.createElement('div');
    pills.className = 'dp-var-pills';

    group.items.forEach(variation => {
      const pill = document.createElement('button');
      pill.className = 'dp-var-pill';
      pill.innerHTML = `<span class="dp-var-root">${rootName}</span><span class="dp-var-suffix">${variation.qLabel}</span>`;
      pill.title = variation.label;

      pill.addEventListener('click', () => {
        // Highlight active
        container.querySelectorAll('.dp-var-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        // Update piano and play
        renderPianoSection(noteIdx, variation.intervals);
        renderNotesAndIntervals(noteIdx, variation.intervals);
        _panelState.activeIntervals = variation.intervals;
        // Re-render inversion tabs for the new voicing
        renderInversionTabs(getInversions(variation.intervals));
        if (_state.soundEnabled) playChord(rootMidi(noteIdx), variation.intervals);
      });

      pills.appendChild(pill);
    });

    groupEl.appendChild(pills);
    container.appendChild(groupEl);
  });
}

function rootMidi(noteIdx) { return 12 + 4 * 12 + noteIdx; }
