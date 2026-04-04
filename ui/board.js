// ── ui/board.js ────────────────────────────────────────────────────────────────
// Renders the three-row chord board and handles tile interactions.

import {
  CHROMATIC, DIATONIC, SECONDARY, MODAL,
  formatChordName, scaleNotes, preferredNote, INTERVAL_NAMES
} from '../data/theory.js';
import { voicingKey } from '../data/instruments.js';
import { renderPiano, renderFretboard, getPianoBg } from './diagrams.js';
import { playChord } from '../audio/player.js';
import { addToProgression } from './progression.js';
import { drawArrows } from './arrows.js';

let _state = null;
export function setStateRef(s) { _state = s; }

function rootMidi(noteIdx) { return 12 + 4 * 12 + noteIdx; }

// ── Path dimming logic ────────────────────────────────────────────────────────
const GATEWAY_IDS = new Set(['I', 'IV', 'V']);

function isDimmed(chordId, row) {
  const last = _state.lastSelected;
  if (!last) return false;

  const { id: lastId, row: lastRow } = last;

  if (lastRow === 'secondary') {
    const sec = SECONDARY.find(s => s.id === lastId);
    if (!sec) return false;
    if (row === 'main')      return chordId !== sec.targetId;
    if (row === 'secondary') return true;
    if (row === 'modal')     return true;
  }

  if (lastRow === 'main') {
    if (row === 'modal') return !GATEWAY_IDS.has(lastId);
    return false;
  }

  if (lastRow === 'modal') {
    if (row === 'main')      return !GATEWAY_IDS.has(chordId);
    if (row === 'secondary') return true;
    if (row === 'modal')     return false;
  }

  return false;
}

// ── Build tile ────────────────────────────────────────────────────────────────
function buildTile(noteIdx, chordDef, rowClass, opts = {}) {
  const { moodHighlight = false } = opts;
  const st = _state;
  const rootKey = CHROMATIC[st.tonicIdx];
  const chordName = formatChordName(noteIdx, chordDef.quality, rootKey, st.chordFormat, chordDef.nash);
  const dimmed = isDimmed(chordDef.id, rowClass);

  const tile = document.createElement('div');
  tile.className = [
    'chord-tile',
    `tile-${rowClass}`,
    dimmed      ? 'tile-dimmed'   : '',
    moodHighlight ? 'tile-mood'   : '',
    chordDef.tonic ? 'tile-tonic' : '',
    st.lastSelected?.id === chordDef.id ? 'tile-selected' : '',
  ].filter(Boolean).join(' ');

  tile.dataset.chordId  = chordDef.id;
  tile.dataset.row      = rowClass;
  tile.dataset.noteIdx  = noteIdx;
  tile.dataset.quality  = chordDef.quality;
  tile.dataset.intervals = chordDef.int.join(',');

  // Name view
  const nameView = document.createElement('div');
  nameView.className = 'tile-name-view';
  nameView.innerHTML = `
    <div class="tile-deg">${chordDef.deg}</div>
    <div class="tile-chord">${chordName}</div>
    <div class="tile-quality">${chordDef.qLabel || ''}</div>`;

  // Diagram view
  const diagramView = document.createElement('div');
  diagramView.className = 'tile-diagram-view';
  const scaleSet = new Set(scaleNotes(st.tonicIdx));
  if (st.instrument === 'piano') {
    diagramView.innerHTML = renderPiano(noteIdx, chordDef.int, scaleSet, true, getPianoBg());
  } else {
    const vk = voicingKey(preferredNote(noteIdx, rootKey), chordDef.quality);
    diagramView.innerHTML = renderFretboard(noteIdx, chordDef.int, scaleSet, vk, st.instrument);
  }

  // ── Detail strip (full-width bottom zone, easy to tap) ───────────────────
  const detailStrip = document.createElement('button');
  detailStrip.className = 'tile-detail-strip';
  detailStrip.title = 'Chord details';
  detailStrip.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
  detailStrip.addEventListener('click', e => {
    e.stopPropagation();
    openDetailPanel(noteIdx, chordDef, chordName);
  });

  tile.appendChild(nameView);
  tile.appendChild(diagramView);
  tile.appendChild(detailStrip);

  // Click: play + add to progression + update dimming
  tile.addEventListener('click', () => {
    if (st.soundEnabled) playChord(rootMidi(noteIdx), chordDef.int);
    addToProgression(noteIdx, chordDef);
    st.lastSelected = { id: chordDef.id, row: rowClass };
    renderBoard();
    // Pulse the re-rendered tile
    requestAnimationFrame(() => {
      const t = document.querySelector(`[data-chord-id="${chordDef.id}"]`);
      if (t) { t.classList.add('tile-playing'); setTimeout(() => t.classList.remove('tile-playing'), 350); }
    });
  });

  return tile;
}

// ── Build row ─────────────────────────────────────────────────────────────────
function buildRow(containerId, chordDefs, rootCalc, rowClass) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';
  const moodIds = _state.activeMood ? _state.activeMood.steps : [];
  chordDefs.forEach(cd => {
    const noteIdx = rootCalc(cd);
    container.appendChild(buildTile(noteIdx, cd, rowClass, { moodHighlight: moodIds.includes(cd.id) }));
  });
}

// ── Full board render ─────────────────────────────────────────────────────────
export function renderBoard() {
  const ti = _state.tonicIdx;
  buildRow('row-secondary', SECONDARY, cd => (ti + cd.resolveSemi + 7) % 12, 'secondary');
  buildRow('row-main',      DIATONIC,  cd => (ti + cd.semi)            % 12, 'main');
  buildRow('row-modal',     MODAL,     cd => (ti + cd.semi)            % 12, 'modal');
  applyViewMode();
  requestAnimationFrame(() => drawArrows());
}

// ── View mode ─────────────────────────────────────────────────────────────────
export function applyViewMode() {
  const mode = _state.viewMode;
  document.querySelectorAll('.tile-name-view').forEach(el => {
    el.style.display = mode === 'name' ? 'block' : 'none';
  });
  document.querySelectorAll('.tile-diagram-view').forEach(el => {
    el.style.display = mode === 'diagram' ? 'block' : 'none';
  });
}

// ── Detail panel ─────────────────────────────────────────────────────────────
function openDetailPanel(noteIdx, chordDef, chordName) {
  const st = _state;
  const rootKey = CHROMATIC[st.tonicIdx];
  const scaleSet = new Set(scaleNotes(st.tonicIdx));

  const pianoEl = document.getElementById('dp-piano');
  pianoEl.innerHTML = '';
  pianoEl.appendChild(renderPiano(noteIdx, chordDef.int, scaleSet, false, getPianoBg(), true));

  const fretWrap  = document.getElementById('dp-fret-wrap');
  const fretLabel = document.getElementById('dp-fret-label');
  if (st.instrument !== 'piano') {
    const vk = voicingKey(preferredNote(noteIdx, rootKey), chordDef.quality);
    fretWrap.innerHTML = '';
    fretWrap.appendChild(renderFretboard(noteIdx, chordDef.int, scaleSet, vk, st.instrument, true));
    fretWrap.style.display = '';
    if (fretLabel) { fretLabel.textContent = st.instrument[0].toUpperCase() + st.instrument.slice(1); fretLabel.style.display = ''; }
  } else {
    fretWrap.style.display = 'none';
    if (fretLabel) fretLabel.style.display = 'none';
  }

  document.getElementById('dp-chord-name').textContent = chordName;
  document.getElementById('dp-chord-meta').textContent = `${chordDef.deg} — ${chordDef.quality}`;
  document.getElementById('dp-intervals').innerHTML =
    chordDef.int.map(i => `<span class="pill">${INTERVAL_NAMES[i] || '+'+i}</span>`).join('');
  document.getElementById('dp-notes').innerHTML =
    chordDef.int.map(i => `<span class="pill">${preferredNote((noteIdx+i)%12, rootKey)}</span>`).join('');
  document.getElementById('dp-play').onclick = () => {
    if (st.soundEnabled) playChord(rootMidi(noteIdx), chordDef.int);
  };
  document.getElementById('detail-panel-overlay').classList.add('open');
}

export function closeDetailPanel() {
  document.getElementById('detail-panel-overlay').classList.remove('open');
}
