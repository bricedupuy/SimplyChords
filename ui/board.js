// ── ui/board.js ────────────────────────────────────────────────────────────────
// Mode-aware board renderer. All row/chord data comes from the active mode.

import {
  CHROMATIC,
  formatChordName, scaleNotes, preferredNote
} from '../data/theory.js';
import { voicingKey } from '../data/instruments.js';
import { renderPiano, renderFretboard, getPianoBg } from './diagrams.js';
import { playChord } from '../audio/player.js';
import { addToProgression } from './progression.js';
import { drawArrows } from './arrows.js';
import { open as openDetailPanel, close as closeDetailPanel } from './detail.js';

let _state = null;
export function setStateRef(s) { _state = s; }

function rootMidi(noteIdx) { return 12 + 4 * 12 + noteIdx; }

// ── Build tile ────────────────────────────────────────────────────────────────
function buildTile(noteIdx, chordDef, rowDef, opts = {}) {
  const { moodHighlight = false } = opts;
  const st = _state;
  const mode = st.activeMode;
  const rootKey = CHROMATIC[st.tonicIdx];
  const chordName = formatChordName(noteIdx, chordDef.quality, rootKey, st.chordFormat, chordDef.nash);
  const dimmed = mode.isDimmed(chordDef.id, rowDef.id, st.lastSelected);

  const tile = document.createElement('div');
  tile.className = [
    'chord-tile',
    `tile-${rowDef.style}`,
    chordDef.isNeapolitan ? 'tile-neapolitan' : '',
    dimmed         ? 'tile-dimmed'   : '',
    moodHighlight  ? 'tile-mood'     : '',
    chordDef.tonic ? 'tile-tonic'    : '',
    st.lastSelected?.id === chordDef.id ? 'tile-selected' : '',
  ].filter(Boolean).join(' ');

  tile.dataset.chordId   = chordDef.id;
  tile.dataset.row       = rowDef.id;
  tile.dataset.noteIdx   = noteIdx;
  tile.dataset.quality   = chordDef.quality;
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
  const scaleSet = new Set(scaleNotes(st.tonicIdx, mode.scale));
  if (st.instrument === 'piano') {
    diagramView.innerHTML = renderPiano(noteIdx, chordDef.int, scaleSet, true, getPianoBg(), false, 1, chordDef.quality);
  } else {
    const vk = voicingKey(preferredNote(noteIdx, rootKey), chordDef.quality);
    diagramView.innerHTML = renderFretboard(noteIdx, chordDef.int, scaleSet, vk, st.instrument, false, chordDef.quality);
  }

  // Detail strip
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

  tile.addEventListener('click', () => {
    if (st.soundEnabled) playChord(rootMidi(noteIdx), chordDef.int);
    addToProgression(noteIdx, chordDef);
    st.lastSelected = { id: chordDef.id, row: rowDef.id };
    renderBoard();
    requestAnimationFrame(() => {
      const t = document.querySelector(`[data-chord-id="${chordDef.id}"]`);
      if (t) { t.classList.add('tile-playing'); setTimeout(() => t.classList.remove('tile-playing'), 350); }
    });
  });

  return tile;
}

// ── Build rows from mode definition ──────────────────────────────────────────
function buildBoardRows() {
  const mode = _state.activeMode;
  const ti   = _state.tonicIdx;
  const boardEl = document.querySelector('.board');
  if (!boardEl) return;

  // Clear and rebuild DOM rows to match mode
  boardEl.innerHTML = '';

  mode.rows.forEach((rowDef, idx) => {
    // Row block
    const rowBlock = document.createElement('div');
    rowBlock.className = `row-block row-block-${rowDef.style}`;

    const rowHeader = document.createElement('div');
    rowHeader.className = 'row-header';
    rowHeader.innerHTML = `
      <span class="row-tag ${rowDef.style}">${rowDef.tag}</span>
      <span class="row-hint">${rowDef.hint}</span>
      <span class="loop-badge ${rowDef.canLoop ? 'can-loop' : ''}">${rowDef.loopLabel}</span>`;

    const chordRow = document.createElement('div');
    chordRow.className = 'chord-row';
    chordRow.id = `row-${rowDef.id}`;

    // Populate tiles
    const moodIds = _state.activeMood ? _state.activeMood.steps : [];
    rowDef.chords.forEach(cd => {
      const noteIdx = rowDef.rootCalc(cd, ti);
      chordRow.appendChild(buildTile(noteIdx, cd, rowDef, {
        moodHighlight: moodIds.includes(cd.id),
      }));
    });

    rowBlock.appendChild(rowHeader);
    rowBlock.appendChild(chordRow);
    boardEl.appendChild(rowBlock);

    // Divider between rows (not after last)
    if (idx < mode.rows.length - 1) {
      const div = document.createElement('div');
      div.className = 'board-divider';
      boardEl.appendChild(div);
    }
  });
}

// ── Full board render ─────────────────────────────────────────────────────────
export function renderBoard() {
  buildBoardRows();
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

export { closeDetailPanel };
